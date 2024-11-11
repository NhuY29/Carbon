// wallet-response.model.ts
export class WalletResponse {
    publicKey: string;
    secretKey: string;

    constructor(publicKey: string, secretKey: string) {
        this.publicKey = publicKey;
        this.secretKey = secretKey;
    }
}
