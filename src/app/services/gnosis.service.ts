import SafeAppsSDK from '@safe-global/safe-apps-sdk';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

type Opts = {
    allowedDomains?: RegExp[];
    debug?: boolean;
  };
  
  const opts: Opts = {
    allowedDomains: [/gnosis-safe.io$/, /app.safe.global$/],
    debug: false,
  };
  
const appsSdk = new SafeAppsSDK(opts);
export type Tx = {
    to: string;
    value: string;
    data: string;
    gasPrice?: string;
    gas?: string;
};

@Injectable({
    providedIn: 'root'
})
export class GnosisService {

    private walletAddress = new Subject<string>();
    public walletAddress$ = this.walletAddress.pipe(
        shareReplay({ bufferSize: 1, refCount: true })
    );

    // todo: add alert for testnet (not supported)
    private isMainNet = new Subject<boolean>();
    public isMainNet$ = this.isMainNet.pipe(
        shareReplay({ bufferSize: 1, refCount: true })
    );

    constructor() {
    }

    public async sendTransactions(txs: Tx[]) {
        const params = {
            safeTxGas: 500000,
          };
        const txHash = await appsSdk.txs.send({ txs, params });
        console.log('txHash', txHash)
    }

    public async addListeners() {
        const safe = await appsSdk.safe.getInfo();
        this.isMainNet.next(true);
        this.walletAddress.next(safe.safeAddress);
    }
}
