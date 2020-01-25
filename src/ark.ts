import { Transport as LedgerTransport } from "@ledgerhq/hw-transport";
import { Transport } from "./contracts";
import { splitPath, splitToChunks, writePathsToBuffer } from "./utils";

export default class ARK implements Transport {
	readonly IDENTIFIER = 0xe0;
	readonly OP_GET_PUBLIC_KEY = 0x02;
	readonly OP_SIGN_TRANSACTION = 0x04;
	readonly OP_GET_VERSION = 0x06;
	readonly OP_SIGN_MESSAGE = 0x08;
	readonly ALG_SECP256K1 = 0x40;
	readonly CHUNK_SIZE = 255;
	readonly PAYLOAD_MAX = 255 * 4;
	private transport: LedgerTransport<any>;

	constructor (transport: LedgerTransport<any>) {
		this.transport = transport;

		this.transport.decorateAppAPIMethods(this, [
			"getAddress",
			"signTransaction",
			"getAppConfiguration"
		], "w0w");
	}

	public async getVersion (): Promise<string> {
		const response = await this.transport.send(
			this.IDENTIFIER,
			this.OP_GET_VERSION,
			0x00,
			0x00
		);

		return `${response[1]}.${response[2]}.${response[3]}`;
	}

	public async getPublicKey(path: string): Promise<string> {
		const paths = splitPath(path);
		const buffer = Buffer.alloc(1 + (paths.length * 4));
		writePathsToBuffer(paths, buffer);

		const response = await this.transport.send(
			this.IDENTIFIER,
			this.OP_GET_PUBLIC_KEY,
			0x00,
			this.ALG_SECP256K1,
			buffer
		);

		return response.slice(1, 1 + response[0]).toString("hex");
	}

	public async signTransaction(path: string, hex: Buffer): Promise<string> {
		return this.sign(path, hex, this.OP_SIGN_TRANSACTION);
	}

	public async signMessage(path: string, hex: Buffer): Promise<string> {
		return this.sign(path, hex, this.OP_SIGN_MESSAGE);
	}

	private async sign(path: string, hex: Buffer, operation: number): Promise<string> {
		if (hex.length > this.PAYLOAD_MAX) {
			throw new Error("Payload is too large");
		}

		const paths = splitPath(path);
		const hexChunks = splitToChunks(hex, this.PAYLOAD_MAX - paths.length);
		const toSend = [];

		for (const index in hexChunks) {
			const chunk = hexChunks[index];
			const buffer = Buffer.alloc(index === "0" ? 1 + (paths.length * 4) : 0);

			if (index === "0") {
				writePathsToBuffer(paths, buffer);
			}

			toSend.push(Buffer.concat([buffer, chunk]));
		}

		const promises = [];
		for (const index in toSend) {
			const data = toSend[index];

			let chunkPart = 0x00;
			if (toSend.length === 1 && index === "0") {
				chunkPart = 0x80;
			} else if (toSend.length > 1 && index === (toSend.length - 1).toString()) {
				chunkPart = 0x80;
			}

			console.log([
				'0x'+this.IDENTIFIER.toString(16),
				'0x'+operation.toString(16),
				'0x'+chunkPart.toString(16),
				'0x'+this.ALG_SECP256K1.toString(16),
				data.toString("hex"),
				"\n"
			])

			try {
				promises.push(this.transport.send(
					this.IDENTIFIER,
					operation,
					chunkPart,
					this.ALG_SECP256K1,
					data
				));
			} catch (error) {
				console.error(error)
			}
		}

		const response = await Promise.all(promises);

		if (!response.length) {
			throw new Error("No response");
		}

		console.log(response);
		console.log(response.map(r => r.toString('hex')));
		console.log(response.map(r => r.toString('hex')).join(""));

		return response.map(r => r.toString('hex')).join("");
	}
}