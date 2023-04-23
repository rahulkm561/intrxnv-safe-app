import { Component, OnInit } from '@angular/core';
import SafeAppsSDK from '@safe-global/safe-apps-sdk';

type Opts = {
  allowedDomains?: RegExp[];
  debug?: boolean;
};

const opts: Opts = {
  allowedDomains: [/gnosis-safe.io$/, /app.safe.global$/],
  debug: false,
};

const appsSdk = new SafeAppsSDK(opts);
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

  public async addListeners() {
    const safe = await appsSdk.safe.getInfo();
    console.log('safe', safe)
  }

}
