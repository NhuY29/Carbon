import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SolanaService {
  private apiUrl = 'http://localhost:8899';

  constructor(private http: HttpClient) { }

  getBalance(pubkey: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getBalance",
      params: [pubkey]
    });
  }

  getTransactionHistory(pubkey: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getConfirmedSignaturesForAddress2",
      params: [pubkey, { limit: 10 }]
    });
  }

  getTransactionDetails(signature: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getTransaction",
      params: [signature, { encoding: "jsonParsed" }]
    });
  }
  sendTransaction(senderSecretKeyBase58: string, receiverPublicKey: string, amount: number): Observable<any> {
    const payload = {
      senderSecretKeyBase58,
      receiverPublicKey,
      amount
    };
    return this.http.post<any>(`${this.apiUrl}/sendTransaction`, payload);
  }
}
