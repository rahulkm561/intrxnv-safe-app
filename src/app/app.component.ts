import { Component, OnInit } from '@angular/core';
import { ethers } from 'ethers';
import {
  catchError,
  combineLatest,
  forkJoin,
  Observable,
  of,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { environment } from 'src/environments/environment';
import { EthereumService } from './services/ethereum.service';
import { GnosisService } from './services/gnosis.service';
import { Web3Service } from './services/web3.service';
import ERC20ABI from './abi/ERC20ABI.json';
import { BigNumber } from 'ethers/utils';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UrlSegment } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'safe-app';
  public safeAddress: any;
  private re: any = {
    18: new RegExp('^-?\\d+(?:.\\d{0,18})?'),
    8: new RegExp('^-?\\d+(?:.\\d{0,8})?'),
    6: new RegExp('^-?\\d+(?:.\\d{0,6})?'),
    2: new RegExp('^-?\\d+(?:.\\d{0,2})?'),
  };
  constructor(
    private http: HttpClient,
    private ethereumService: EthereumService,
    private gnosisService: GnosisService,
    private web3Service: Web3Service
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.gnosisService.addListeners();
      this.gnosisService.walletAddress$.subscribe((res: any) => {
        this.safeAddress = res;
      });
    }, 1000);
  }

  public parseUnits(amount: any, decimals: any): BigNumber {
    const fixed = this.toFixedSafe(amount, decimals);
    return ethers.utils.parseUnits(fixed, decimals);
  }

  public toFixedSafe(num: any, fixed: any): string {
    if (!this.re[fixed]) {
      this.re[fixed] = new RegExp('^-?\\d+(?:.\\d{0,' + (fixed || -1) + '})?');
    }

    const x = num.toString().match(this.re[fixed]);
    if (x?.length) {
      return x[0];
    }

    return '0';
  }

  public async swap() {
    console.log('swap=>', 227);
    const walletAddress$ = this.gnosisService.walletAddress$;
    let price = this.parseUnits('0.0001', 6);
    const transactions: any[] = [];
    let token: any;
    let walletAddress: string;
    combineLatest([walletAddress$])
      .pipe(
        switchMap(([addr]: any) => {
          console.log('swap=>', 238, addr);
          walletAddress = addr;
          token = '0xc2132d05d31c914a87c6611c10748aeb04b58e8f';

          const toToken = '0x427837FC0095b29BeA77e175A10bAa852A29DAe5';
          console.log('swap=>', toToken);
          const isTokenApproved$ = this.ethereumService.isTokenApproved(
            token,
            walletAddress,
            environment.TOKEN_SPENDER,
            price
          );
          return forkJoin({
            isApproved: isTokenApproved$,
            toToken: of(toToken),
          });
        }),
        switchMap(({ isApproved, fromToken, toToken }: any) => {
          console.log('swap=>', 253, isApproved, fromToken, toToken);
          let tx = {};
          if (!isApproved) {
            tx = {
              ...tx,
              to: token,
              data: this.ethereumService.getSendTokenABI(
                environment.TOKEN_SPENDER,
                ethers.constants.MaxUint256
              ),
              value: '0',
            };
            console.log('swap=>', 106, tx);
            transactions.push(tx);
          }

          return Observable.create((observer: any) => {
            const sendData = this.ethereumService.getSendTokenABI(
              environment.TOKEN_SPENDER,
              ethers.constants.MaxUint256
            );
            observer.next(tx);
            observer.complete();
          });
        }),
        tap((data: any) => {
          console.log('swap=>', 273, data);
          const tx: any = {
            to: data.to,
            value: data.value,
            data: data.data,
            gasPrice: data.gasPrice,
          };
          transactions.push(tx);
          this.gnosisService.sendTransactions(transactions);
        }),
        catchError((e) => {
          console.log('EE', e);
          return of('');
        }),
        take(1)
      )
      .subscribe();
  }

  public getSwapData$(safeHash: any): Observable<any> {
    const url = `https://safe-transaction-polygon.safe.global/api/v1/multisig-transactions/${safeHash}`;

    return this.http.get<any>(url).pipe(delayedRetry(1000));
  }
}

function delayedRetry(arg0: number): import('rxjs').OperatorFunction<any, any> {
  throw new Error('Function not implemented.');
}
