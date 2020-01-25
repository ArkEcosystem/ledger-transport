export function splitPath (path: string): number[] {
	const pathArray = [];

	for (const entry of path.split("/")) {
		let number = parseInt(entry, 10);

		if (isNaN(number)) {
			throw new Error("Invalid path provided");
		}

		if (entry.length > 1 && entry[entry.length - 1] === "'") {
			number += 0x80000000;
		}

		pathArray.push(number);
	}

	return pathArray;
}

export function writePathsToBuffer (paths: number[], buffer: Buffer): void {
	buffer[0] = paths.length;

	for (const index in paths) {
		buffer.writeUInt32BE(paths[index], 1 + (4 * parseInt(index, 10)));
	}
}

export function splitToChunks (string: Buffer, chunkSize: number): Buffer[] {
	return string
		.toString('hex')
		.match(new RegExp(`.{1,${chunkSize}}`, 'g'))
		.map(chunk => Buffer.from(chunk, 'hex'));
}