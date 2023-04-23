import { Component, OnInit } from '@angular/core';
import { ethers } from 'ethers';
import { catchError, combineLatest, forkJoin, Observable, of, switchMap, take, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { EthereumService } from './services/ethereum.service';
import { GnosisService } from './services/gnosis.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'safe-app';

  constructor(
    private ethereumService: EthereumService,
    private gnosisService: GnosisService,
  ) {}

  ngOnInit(): void {
  }

  public swap(): void {
    console.log('swap=>',227);
  
    const walletAddress$ = this.gnosisService.walletAddress$;

    const transactions: any[] = [];
    let token: any;
    let walletAddress: string;
    combineLatest([walletAddress$]).pipe(
        switchMap(([addr]) => {
            console.log('swap=>',238, addr);
            walletAddress = addr;
            token = addr;
            console.log('swap=>',token);

            const toToken = '0x427837FC0095b29BeA77e175A10bAa852A29DAe5';
            console.log('swap=>',toToken);
            const price:any  = '1.0';                        
            const isTokenApproved$ = this.ethereumService.isTokenApproved(
                token,
                walletAddress,
                environment.TOKEN_SPENDER,
                price
            );
            return forkJoin({
                isApproved: isTokenApproved$,
                fromToken: of(token),
                toToken: of(toToken)
            });
            
        }),
        switchMap(({isApproved, fromToken, toToken}) => {
            console.log('swap=>',253, isApproved, fromToken, toToken);
            if (!isApproved) {
                const tx: any = {
                    to: token,
                    data: this.ethereumService.getApproveCallData(environment.TOKEN_SPENDER, ethers.constants.MaxUint256),
                    value: '0'
                };
                transactions.push(tx);
            }

            return new Observable()
        }),
        tap((data: any) => {
            console.log('swap=>',273, data);

            const tx: any = {
                to: data.tx.to,
                value: data.tx.value,
                data: data.tx.data,
                gasPrice: data.tx.gasPrice
            };
            transactions.push(tx);
            this.gnosisService.sendTransactions(transactions);
        }),
        catchError((e) => {
            console.log(e);
            return of('');
        }),
        take(1),
    ).subscribe();
}


}
