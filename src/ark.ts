import { Transport as LedgerTransport } from "@ledgerhq/hw-transport";
import { Transport } from "./contracts";
import {
	parseBip32Path,
	splitApduChunks,
	writeBip32ElementsToBuffer,
} from "./utils";
	
/**
 * APDU Header Flags
 *
 * Describes the APDU Class, Instruction-Type, Parameter 1, and Parameter 2.
 *
 * APDU Header:  ({ CLA + INS + P1 + P2 })
 * - CLA:  Apdu Class
 * - INS:  Instruction Type
 * - P1:   Instruction Parameter 1
 * - P2:   Instruction Parameter 2
 *
 * Instruction Types:
 * - INS_GET_PUBLIC_KEY:    Get a PublicKey from a Ledger Device
 * - INS_GET_VERSION:       Get the ARK Application Version from a Ledger Device
 * - INS_SIGN_TRANSACTION:  Sign a Transaction using a Ledger Device
 * - INS_SIGN_MESSAGE:      Sign a Message using a Ledger Device
 *
 * App / PublicKey Context:
 * P1: User Approval
 * - P1_NON_CONFIRM:  Do NOT request user approval
 * - P1_CONFIRM:      Request user approval
 *
 * P2: ChainCode
 * - P2_NO_CHAINCODE:  Don't use a ChainCode
 * - P2_CHAINCODE:     Use a Chaincode
 *
 * Signing Context:
 * P1: Payload Segment
 * - P1_SINGLE:  N(1) where N === 1
 * - P1_FIRST:   N(1) where N > 1
 * - P1_MORE:    N(2)..N-1 where N > 2
 * - P1_LAST:    Nth where N > 1
 *
 * P2:
 * - P2_ECDSA: Use Ecdsa Signatures
 *
 */
enum ApduFlags {
	/** APDU Class */
	CLA = 0xe0,

	/** App / PublicKey Context */
	INS_GET_PUBLIC_KEY = 0x02,
	INS_GET_VERSION = 0x06,

	P1_NON_CONFIRM = 0x00,
	P1_CONFIRM = 0x01,

	P2_NO_CHAINCODE = 0x00,
	P2_CHAINCODE = 0x01,

	/** Signing Context */
	INS_SIGN_TRANSACTION = 0x04,
	INS_SIGN_MESSAGE = 0x08,

	P1_SINGLE = 0x80,
	P1_FIRST = 0x00,
	P1_MORE = 0x01,
	P1_LAST = 0x81,

	P2_ECDSA = 0x40,
}

/**
 * ARK Ledger Transport Class.
 *
 * Send APDU Instruction Payloads to a Ledger Device.
 *
 * - INS_GET_PUBLIC_KEY
 * - INS_GET_VERSION
 * - INS_SIGN_TRANSACTION
 * - INS_SIGN_MESSAGE
 */
export default class ARK implements Transport {
	private transport: LedgerTransport<any>;

	readonly CHUNK_MAX: number = 10;
	readonly CHUNK_SIZE: number = 255;
	readonly PAYLOAD_MAX: number = this.CHUNK_MAX * this.CHUNK_SIZE;

	/**
	 * Create an instance using a 'LedgerTransport' object.
	 *
	 * 'decorateAppAPIMethods' basically "locks" the instance,
	 * preventing race conditions where parallel calls are made
	 * or where multiple instantiations are attempted.
	 *
	 * @param {LedgerTransport} transport generic transport interface for Ledger HW.
	 * @throws {Error} if 'LedgerTransport' is busy with another instruction.
	 */
	constructor(transport: LedgerTransport<any>) {
		this.transport = transport;

		try {
			this.transport.decorateAppAPIMethods(
				this,
				[
					"getAddress",
					"getAppConfiguration",
					"signMessage",
					"signTransaction"
				],
				"w0w"
			);
		  } catch (error) {
			throw new Error(error);
		  }
	}

	/**
	 * Get the installed Application version from a Ledger Device.
	 *
	 * @returns {Promise<string>} installed application version
	 */
	public async getVersion(): Promise<string> {
		const response = await this.transport.send(
			ApduFlags.CLA,
			ApduFlags.INS_GET_VERSION,
			ApduFlags.P1_NON_CONFIRM,
			ApduFlags.P2_NO_CHAINCODE
		);

		return `${response[1]}.${response[2]}.${response[3]}`;
	}

	/**
	 * Get the PublicKey from a Ledger Device given a Bip32 HD Path.
	 *
	 * @param {string} path Bip32 Path string
	 * @returns {Promise<string>} device compressed publicKey
	 */
	public async getPublicKey(path: string): Promise<string> {
		const bip32Path = parseBip32Path(path);
		const buffer = Buffer.alloc(1 + bip32Path.length * 4);
		writeBip32ElementsToBuffer(bip32Path, buffer);

		const response = await this.transport.send(
			ApduFlags.CLA,
			ApduFlags.INS_GET_PUBLIC_KEY,
			ApduFlags.P1_NON_CONFIRM,
			ApduFlags.P2_NO_CHAINCODE,
			buffer
		);

		return response.slice(1, 1 + response[0]).toString("hex");
	}

	/**
	 * Sign a Transaction using a Ledger Device.
	 *
	 * @param {string} path Bip32 Path string
	 * @param {Buffer} hex transaction payload hex
	 * @returns {Promise<string>} payload signature
	 */
	public async signTransaction(path: string, hex: Buffer): Promise<string> {
		return this.sign(path, hex, ApduFlags.INS_SIGN_TRANSACTION);
	}

	/**
	 * Sign a Message using a Ledger Device.
	 *
	 * @param {string} path Bip32 Path string
	 * @param {Buffer} hex transaction payload hex
	 * @returns {Promise<string>} payload signature
	 */
	public async signMessage(path: string, hex: Buffer): Promise<string> {
		return this.sign(path, hex, ApduFlags.INS_SIGN_MESSAGE);
	}

	/**
	 * Sign using a Ledger Device.
	 *
	 * @param {string} path Bip32 Path string
	 * @param {Buffer} hex transaction payload hex
	 * @param {number} instruction type of operation (e.g. Transaction, Message, etc.)
	 * @returns {Promise<string>} payload signature
	 * @throws {Error} if the buffer length is 0 or greater than PAYLOAD_MAX
	 */
	private async sign(
		path: string,
		hex: Buffer,
		instruction: number
	): Promise<string> {
		if (hex.length === 0 || hex.length > this.PAYLOAD_MAX) {
			throw new Error("Invalid Payload Size");
		}

		const toSend = [];

		/** build the Apdu payload chunks */
		const bip32Path = parseBip32Path(path);
		const chunks = splitApduChunks(
			hex,
			this.CHUNK_SIZE * 2 - (2 + bip32Path.length * 4) * 2
		);

		for (const index in chunks) {
			const buffer = Buffer.alloc(
				index === "0" ? 1 + bip32Path.length * 4 : 0
			);

			if (index === "0") {
				writeBip32ElementsToBuffer(bip32Path, buffer);
			}

			toSend.push(Buffer.concat([buffer, chunks[index]]));
		}

		const promises = [];

		/** send the Apdu payload in chunks */
		for (const index in toSend) {
			const chunk = toSend[index];

			/** set the payload segment flag */
			let p1 = ApduFlags.P1_FIRST;
			if (index === "0" && toSend.length === 1) {
				/** N(1) where N === 1 */
				p1 = ApduFlags.P1_SINGLE;
			} else if (index > "0" && index < (toSend.length - 1).toString()) {
				/** N(2)..N-1 where N > 2 */
				p1 = ApduFlags.P1_MORE;
			} else if (index === (toSend.length - 1).toString() && toSend.length > 1 ) {
				/** Nth where N > 1 */
				p1 = ApduFlags.P1_LAST;
			}

			const p2 = ApduFlags.P2_ECDSA;

			/** send the Apdu chunk */
			promises.push(
				await this.transport.send(
					ApduFlags.CLA,
					instruction,
					p1,
					p2,
					chunk
				)
			);
		}

		const response = await Promise.all(promises);
		if (!response.length) {
			throw new Error("No response");
		}

		return response
			.map((r) => r.slice(0, r.length - 2).toString("hex"))
			.join("");
	}
}
