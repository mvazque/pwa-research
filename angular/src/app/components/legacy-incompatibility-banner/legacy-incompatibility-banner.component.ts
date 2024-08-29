import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-legacy-incompatibility-banner',
  templateUrl: './legacy-incompatibility-banner.component.html',
  styleUrls: ['./legacy-incompatibility-banner.component.scss']
})
export class LegacyIncompatibilityBannerComponent implements OnInit {
  showBanner = false;
  async ngOnInit(): Promise<void> {
      if(!('serviceWorker' in navigator)){
        this.showBanner = true;
        return;
      }

      // @ts-ignore
      const swRegistration = await navigator.serviceWorker.ready;

      // @ts-ignore
      if( !swRegistration.pushManager || !swRegistration.sync){
        this.showBanner = true;
        return;
      }
  }
}
