export interface Transport {
	getPublicKey(path: string): Promise<string>;
	getVersion(): Promise<string>;
	signMessage(path: string, hex: Buffer): Promise<string>;
	signMessageWithSchnorr(path: string, hex: Buffer): Promise<string>;
	signTransaction(path: string, hex: Buffer): Promise<string>;
	signTransactionWithSchnorr(path: string, hex: Buffer): Promise<string>;
}
