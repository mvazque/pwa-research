import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionsService {

  constructor(private http: HttpClient) { }

  postSubscription(subscription: any): Observable<any>{
    return this.http.post<any>('api/postSubscription', JSON.stringify(subscription));
  }
}
