export interface Transport {
	getPublicKey(path: string): Promise<string>,
	signTransaction(path: string, hex: Buffer): Promise<string>,
	// getAppConfiguration(): Promise<string>
}