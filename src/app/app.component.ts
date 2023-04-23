import { Component, OnInit } from '@angular/core';
import initSdk, { SafeInfo } from '@gnosis.pm/safe-apps-sdk';

const appsSdk = initSdk();

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'safe-app';

  constructor() {}

  ngOnInit(): void {
    setTimeout(() => {
      this.addListeners(); 
    }, 1000);
  }

  public addListeners(): void {
    console.log('binfo');
    appsSdk.addListeners({
      onSafeInfo: (info: SafeInfo) => {
        console.log('info', info);
      },
    });
  }

  public removeListeners(): void {
    appsSdk.removeListeners();
  }
}
