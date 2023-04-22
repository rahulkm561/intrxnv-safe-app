import initSdk, { SafeInfo } from '@gnosis.pm/safe-apps-sdk';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

const appsSdk = initSdk();

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

    public sendTransactions(txs: Tx[]): void {
        appsSdk.sendTransactions(txs);
    }

    public addListeners(): void {
        if (!environment.production) {
            console.log('dd')
            this.walletAddress.next('0x451ae4BAcd0034Bd04E4346E467370772963ACB1');
            return;
        }

        appsSdk.addListeners({
            onSafeInfo: ((info: SafeInfo) => {

                this.isMainNet.next(info.network.toLowerCase() === 'mainnet');
                this.walletAddress.next(info.safeAddress);
            })
        });
    }

    public removeListeners(): void {
        appsSdk.removeListeners();
    }
}
