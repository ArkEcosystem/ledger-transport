import * as TransportErrors from "./errors";

/**
 * Static builder for handling the parsing of Bip44 Paths.
 *
 * BIP44 is a particular application of BIP43.
 * It defines a hierarchy for deterministic wallets based on BIP32,
 * and the purpose scheme described in BIP43.
 *
 * A Bip44 path defines the following levels:
 * - m / purpose' / coin_type' / account' / change / address_index
 *
 * https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
 * https://github.com/bitcoin/bips/blob/master/bip-0043.mediawiki
 * https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
 *
 * @example const bip44Bytes = Bip44Path.fromString("44'/111'/0'/0/0").toBytes()
 * @example const bip44Bytes = Bip44Path.fromString("m/44'/111'/0'/0/0").toBytes()
 */
export class Bip44Path {
    private static readonly HARDENING: number = 0x80000000;
    private static readonly REGEXP_VALID_BIP44: string = "^((m/)?(44'?)){1}(/[0-9]+'?){2}(/[0-9]+){2}$";
    private _elements: number[] = [];

    /**
     * Private constructor.
     * Ensures precondition that 'fromString' is called before 'toBytes'.
     *
     * @param {number[]} elements a bip44 path as an array of elements
     */
    private constructor(elements: number[]) {
        this._elements = elements;
    }

    /**
     * Parses a Bip44 path-string, storing the path as elements,
     * and returns a Bip44Path instance.
     *
     * Elements are stored as a 4-byte/uint32 Big-Endian-packed number array.
     *
     * @param {string} path a bip44 path as a string
     * @throws {Error} if the path-string is null
     * @throws {Error} if the path formatting is invalid
     * @returns {Bip44Path} a new instance containing parsed path elements
     */
    public static fromString(path: string): Bip44Path {
        if (!path.toString().match(new RegExp(this.REGEXP_VALID_BIP44, "g"))) {
            throw new TransportErrors.Bip44PathError(path);
        }

        return this.pathToElements(path.replace("m/", ""));
    }

    /**
     * Parses and stores a Bip44 Path-string as an array of elements to the 'Bip44Path' instance.
     *
     * @param {string} path a bip44 path as a string
     * @throws {Error} if the path-string is null
     * @throws {Error} if the path-string has a length of '0'
     * @returns {Bip44Path} a new instance containing parsed path elements
     */
    protected static pathToElements(path: string): Bip44Path {
        const _elements: number[] = [];
        for (const level of path.split("/")) {
            let element = parseInt(level, 10);
            if (level.length > 1 && level.endsWith("'")) {
                // Use hardening
                element += this.HARDENING;
            }

            _elements.push(element);
        }

        return new Bip44Path(_elements);
    }

    /**
     * Get the bytes of a Parsed Bip44 Element Array.
     *
     * @returns {Buffer} a buffer of bytes representing the path
     * @throws {Error} if the internal bip44 element array has a length of '0'
     * @returns {Buffer} a byte buffer of parsed bip44 path elements
     */
    public toBytes(): Buffer {
        const payload = Buffer.alloc(1 + this._elements.length * 4);
        payload[0] = this._elements.length;

        let index = 0;
        for (const element of this._elements) {
            payload.writeUInt32BE(element, 1 + index * 4);
            index += 1;
        }

        return payload;
    }
}

export { Bip44Path as Path };
