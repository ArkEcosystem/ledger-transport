import "jest-extended";

import { createTransportReplayer, RecordStore } from "@ledgerhq/hw-transport-mocker";

import * as TransportErrors from "../src/errors";
import { ARKTransport } from "../src/index";
import { Fixtures } from "./__fixtures__/transport-fixtures";

class TransportMock {
    protected readonly record: RecordStore;

    private constructor(record: RecordStore) {
        this.record = record;
    }

    public static async getARKTransport(record: RecordStore): Promise<ARKTransport> {
        const mock = new TransportMock(record);
        const Transport = createTransportReplayer(mock.record);
        const transport = await Transport.open();
        return new ARKTransport(transport);
    }
}

describe("ARKTransport", () => {
    describe("getVersion", () => {
        it("should pass with an app version", async () => {
            const ark = await TransportMock.getARKTransport(RecordStore.fromString(Fixtures.appVersion.record));
            await expect(ark.getVersion()).resolves.toEqual(Fixtures.appVersion.result);
        });
    });

    describe("getPublicKey", () => {
        it("should pass with a compressed publicKey", async () => {
            const ark = await TransportMock.getARKTransport(RecordStore.fromString(Fixtures.publicKey.record));
            await expect(ark.getPublicKey(Fixtures.bip44.path.valid)).resolves.toEqual(Fixtures.publicKey.result);
        });
    });

    describe("getExtPublicKey", () => {
        it("should pass with an extended account publicKey and chaincode", async () => {
            const ark = await TransportMock.getARKTransport(RecordStore.fromString(Fixtures.publicKey.extended.record));
            await expect(ark.getExtPublicKey(Fixtures.bip44.path.valid)).resolves.toEqual(
                Fixtures.publicKey.extended.result,
            );
        });
    });

    describe("signMessageWithSchnorr", () => {
        it("should pass with a schnorr signature", async () => {
            const ark = await TransportMock.getARKTransport(RecordStore.fromString(Fixtures.message.schnorr.record));
            const message = Buffer.from(Fixtures.message.schnorr.payload, "hex");
            await expect(ark.signMessageWithSchnorr(Fixtures.bip44.path.valid, message)).resolves.toEqual(
                Fixtures.message.schnorr.result,
            );
        });

        it("should throw with a message containing non-ascii characters", async () => {
            const ark = await TransportMock.getARKTransport(RecordStore.fromString(Fixtures.message.schnorr.record));
            const message = Buffer.from(Fixtures.message.invalid, "utf-8");
            await expect(ark.signMessageWithSchnorr(Fixtures.bip44.path.valid, message)).rejects.toThrow(
                TransportErrors.MessageAsciiError,
            );
        });
    });

    describe("signTransactionWithSchnorr", () => {
        it("should pass with a schnorr signature", async () => {
            const ark = await TransportMock.getARKTransport(RecordStore.fromString(Fixtures.transaction.large.record));
            const transaction = Buffer.from(Fixtures.transaction.large.payload, "hex");
            await expect(ark.signTransactionWithSchnorr(Fixtures.bip44.path.valid, transaction)).resolves.toEqual(
                Fixtures.transaction.large.result,
            );
        });
    });
});
