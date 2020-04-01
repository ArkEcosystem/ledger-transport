/**
 * Parse a Bip32 HD Path into an array of elements.
 *
 * @param {string} path Bip32 Path string
 * @returns {number[]} array of parsed Bip32 elements
 * @throws {Error} if the path string-length is 0
 */
export function parseBip32Path(path: string): number[] {
	if (path.length === 0) {
		throw new Error("Invalid Path Length");
	}

	const elements = [];

	for (const element of path.split("/")) {
		let number = parseInt(element, 10);

		if (isNaN(number)) {
			throw new Error("Invalid Path");
		}

		if (element.length > 1 && element[element.length - 1] === "'") {
			number += 0x80000000;
		}

		elements.push(number);
	}

	return elements;
}

/**
 * Write a parsed Bip32 element array a Buffer.
 *
 * @param {number[]} elements array of parsed Bip32 elements
 * @param {Buffer} buffer destination where Bip32 elements will be written
 * @throws {Error} if the path length is 0 or greater than 10
 */
export function writeBip32ElementsToBuffer(
	elements: number[],
	buffer: Buffer
): void {
	if (elements.length === 0 || elements.length > 10) {
		throw new Error("Invalid Path Length");
	}

	buffer[0] = elements.length;

	for (const index in elements) {
		buffer.writeUInt32BE(elements[index], 1 + 4 * parseInt(index, 10));
	}
}

/**
 * Split an APDU Payload into Chunks of a given size.
 *
 * @param {Buffer} string the APDU Payload to split
 * @param {number} chunkSize the Size of Chunks the APDU payload should be split into
 * @returns {Buffer[]} array of APDU Chunks split to a given size
 * @throws {Error} if the string length or chunkSize is 0
 */
export function splitApduChunks(string: Buffer, chunkSize: number): Buffer[] {
	if (string.length === 0) {
		throw new Error("Invalid APDU Length");
	}

	if (chunkSize === 0) {
		throw new Error("Invalid APDU Chunk Size");
	}

	return string
		.toString("hex")
		.match(new RegExp(`.{1,${chunkSize}}`, "g"))
		.map((chunk) => Buffer.from(chunk, "hex"));
}
