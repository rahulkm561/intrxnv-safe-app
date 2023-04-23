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
    this.addListeners();
  }

  public addListeners(): void {
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
