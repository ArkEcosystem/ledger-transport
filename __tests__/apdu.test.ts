import "jest-extended";

import * as Apdu from "../src/apdu";
import * as TransportErrors from "../src/errors";

describe("Apdu", () => {
    test("should throw with a payload that's too big", () => {
        const exceedingSize = 3000;
        expect(() => {
            new Apdu.Builder(0, 0, 0, 0, Buffer.alloc(exceedingSize));
        }).toThrowError(TransportErrors.PayloadLengthError);
    });
});
