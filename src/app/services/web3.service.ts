import { Observable, Subject } from 'rxjs';
import { Contract } from 'web3-eth-contract';
import { Injectable } from '@angular/core';
import { map, shareReplay } from 'rxjs/operators';
import Web3 from 'web3';

const w = window as any;

@Injectable({
    providedIn: 'root'
})
export class Web3Service {

    public rpcUrl = 'https://polygon-mainnet.infura.io/v3/f27760eff972407dac1f24959d92f247';

    private web3Subject$ = new Subject<Web3>();
    web3$ = this.web3Subject$.asObservable().pipe(
        shareReplay({ bufferSize: 1, refCount: true })
    );

    constructor() {
        // need to subscribe first
        this.web3$.subscribe();
        this.activate();

        // (window as any)?.ethereum?.on('accountsChanged', () => this.activate());
    }

    public activate(): void {
        this.activateWeb3().then(
            (w3) => this.web3Subject$.next(w3),
            (e) => console.error(e)
        );
    }

    public async activateWeb3(): Promise<Web3> {
        // const web3 = new Web3(w.ethereum);
        // if (!web3.defaultAccount) {
        //     await w.ethereum.enable();
        // }
        // return web3;
        return new Web3(this.rpcUrl);
    }

    public getInstance(abi: any[], address: string): Observable<Contract> {

        return this.web3$.pipe(
            map((web3:any) => {
                // @ts-ignore
                return (new web3.eth.Contract(
                    abi,
                    address
                )) as Contract;
            }),
        );
    }

    public getInstanceWithoutNetwork(abi: any[]): Contract {

        const web3 = new Web3('');

        // @ts-ignore
        return new web3.eth.Contract(abi, '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', {
            from: '0x451ae4BAcd0034Bd04E4346E467370772963ACB1',
          }) as Contract;
    }
}

const web3NoNetwork = new Web3('');

export function decodeParameter(type: any/*SolType*/, data: string): any {
    return web3NoNetwork.eth.abi.decodeParameter(type, data);
}
