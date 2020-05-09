import { Transport as LedgerTransport } from "@ledgerhq/hw-transport";

import * as Apdu from "./apdu";
import * as Bip44 from "./bip44";
import * as TransportErrors from "./errors";

export class ARK implements LedgerTransport {
    private transport: LedgerTransport;

    /**
     * Create an instance using a 'LedgerTransport' object.
     *
     * 'decorateAppAPIMethods' basically "locks" execution of the current instruction,
     * preventing race conditions where parallel calls are attempted.
     *
     * @param {LedgerTransport} transport generic transport interface for Ledger HW.
     */
    public constructor(transport: LedgerTransport) {
        this.transport = transport;
        this.transport.decorateAppAPIMethods(
            this,
            ["getVersion", "getPublicKey", "signMessage", "signTransaction"],
            "w0w",
        );
    }

    /**
     * Get the installed Application version from a Ledger Device.
     *
     * @returns {Promise<string>} installed application version (e.g. '2.0.1')
     */
    public async getVersion(): Promise<string> {
        const response = await new Apdu.Builder(
            Apdu.Flag.CLA,
            Apdu.Flag.INS_GET_VERSION,
            Apdu.Flag.P1_NON_CONFIRM,
            Apdu.Flag.P2_NO_CHAINCODE,
        ).send(this.transport);

        return `${response[1]}.${response[2]}.${response[3]}`;
    }

    /**
     * Get the PublicKey from a Ledger Device using a Bip44 path-string.
     *
     * @param {string} path bip44 path as a string
     * @returns {Promise<string>} device compressed publicKey
     */
    public async getPublicKey(path: string): Promise<string> {
        const response = await new Apdu.Builder(
            Apdu.Flag.CLA,
            Apdu.Flag.INS_GET_PUBLIC_KEY,
            Apdu.Flag.P1_NON_CONFIRM,
            Apdu.Flag.P2_NO_CHAINCODE,
            Bip44.Path.fromString(path).toBytes(),
        ).send(this.transport);

        return response.slice(1, 1 + response[0]).toString("hex");
    }

    /**
     * Sign a Message using a Ledger Device.
     *
     * @param {string} path bip44 path as a string
     * @param {Buffer} message message payload
     * @throws {ARKTransportMessageAsciiError} if the message contains non-ascii characters
     * @returns {Promise<string>} payload signature
     */
    public async signMessage(path: string, message: Buffer): Promise<string> {
        const REGEXP_INVALID_MESSAGE: string = "[^\x00-\x7F]";
        if (message.toString().match(new RegExp(REGEXP_INVALID_MESSAGE, "g"))) {
            throw new TransportErrors.MessageAsciiError();
        }

        const response = await new Apdu.Builder(
            Apdu.Flag.CLA,
            Apdu.Flag.INS_SIGN_MESSAGE,
            Apdu.Flag.P1_SINGLE,
            Apdu.Flag.P2_ECDSA,
            Buffer.concat([Bip44.Path.fromString(path).toBytes(), message]),
        ).send(this.transport);

        return response.toString("hex");
    }

    /**
     * Sign a Transaction using a Ledger Device.
     *
     * @param {string} path bip44 path as a string
     * @param {Buffer} payload transaction bytes
     * @returns {Promise<string>} payload signature
     */
    public async signTransaction(path: string, payload: Buffer): Promise<string> {
        const response = await new Apdu.Builder(
            Apdu.Flag.CLA,
            Apdu.Flag.INS_SIGN_TRANSACTION,
            Apdu.Flag.P1_SINGLE,
            Apdu.Flag.P2_ECDSA,
            Buffer.concat([Bip44.Path.fromString(path).toBytes(), payload]),
        ).send(this.transport);

        return response.toString("hex");
    }
}
