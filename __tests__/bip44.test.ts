import "jest-extended";

import { Fixtures } from "./__fixtures__/transport-fixtures";
import * as Bip44 from "../src/bip44";
import * as TransportErrors from "../src/errors";

describe("Bip44", () => {
    test("should pass with a prefixed Bip44 path", () => {
        const prefixedPath = Bip44.Path.fromString(Fixtures.bip44.prefixed.path).toBytes();
        expect(prefixedPath).toEqual(Fixtures.bip44.prefixed.result);
    });

    test("should throw with an invalid Bip44 path", async () => {
        expect(() => {
            Bip44.Path.fromString(Fixtures.bip44.path.invalid);
        }).toThrowError(TransportErrors.Bip44PathError);
    });
});
