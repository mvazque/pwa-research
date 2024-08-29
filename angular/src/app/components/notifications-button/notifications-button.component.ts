import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { SubscriptionsService } from 'src/app/services/subscriptions.service';

@Component({
  selector: 'app-notifications-button',
  templateUrl: './notifications-button.component.html',
  styleUrls: ['./notifications-button.component.scss'],
  standalone: true,
  imports: [MatButtonModule, CommonModule],
})
export class NotificationsButtonComponent implements OnInit{

  // TODO Figure if there is a way to send a subscription every so often?
  // Not sure if it was due to switching between PWA apps but the subscription would sometimes get overwritten for some reason
  showButton = false;
  VAPID_PUBLIC_KEY = '{PUBLIC_KEY_GOES_HERE}';

  private swRegistration!: ServiceWorkerRegistration;
  private sub: any;

  constructor(private subscriptionService: SubscriptionsService){}

  async ngOnInit(): Promise<void> {
    // This will return undefined if there is no service worker registered
    // This is to prevent navigator.serviceWorker.ready which never resolves if no service worker is registered
    if(!await navigator.serviceWorker.getRegistration()){
      return;
    }
    this.swRegistration = await navigator.serviceWorker.ready;

    // This catches cases where pushManager is not available on a browser such as older versions of iOS safari
    if(!this.swRegistration.pushManager){
      return;
    }

    try{
      this.sub = await this.swRegistration.pushManager.getSubscription();
    }
    catch(err){
      console.log('Error in getting PushManager Subscription', err);
    }
    if(this.sub === null){
      this.showButton = true;
    }

  }

  private async configurePushSub(): Promise<void> {
    if(!('serviceWorker' in navigator)){
        return;
    }

    try{
        if(!(this.sub === null)){
          return;
        }
        const convertedVapidPublicKey = this.urlBase64toUint8Array(this.VAPID_PUBLIC_KEY);
        this.sub = await this.swRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidPublicKey
        })
        const fetchResponse = await this.subscriptionService.postSubscription(this.sub).subscribe();
        this.showButton = false;
    } catch{(err: any) => {
        console.log(err);
    }};
}



  private urlBase64toUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat(( 4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for(let i = 0; i < rawData.length; i++ ){
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }


  enableNotifications(): void{
    window.Notification.requestPermission().then((result) => {
      if (result === "granted") {
        this.configurePushSub();
      }
    });
  }
}
