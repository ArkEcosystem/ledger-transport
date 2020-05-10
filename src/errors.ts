import * as LedgerHQErrors from "@ledgerhq/errors";

export class MessageAsciiError extends LedgerHQErrors.TransportStatusError {
    public constructor() {
        super({
            statusText: `Message must contain printable ASCII characters.`,
            statusCode: LedgerHQErrors.StatusCodes.INCORRECT_DATA,
        });
    }
}

export class PayloadLengthError extends LedgerHQErrors.TransportStatusError {
    public constructor(expected: number, limit: number) {
        super({
            statusText: `Payload length of ${expected} exceeds ${limit}.`,
            statusCode: LedgerHQErrors.StatusCodes.INCORRECT_LENGTH,
        });
    }
}

export class Bip44PathError extends LedgerHQErrors.TransportStatusError {
    public constructor(path: string) {
        super({
            statusText: `Bip44 Path '${path}' is Invalid`,
            statusCode: LedgerHQErrors.StatusCodes.INCORRECT_DATA,
        });
    }
}
