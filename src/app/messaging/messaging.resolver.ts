import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessagingResolver implements Resolve<boolean> {


  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    console.log('RESOLVER')
    // return new Observable((observer) => {
    //   observer.next(true);
    // });

  
    let conversations = [
      {
        id:'8077705125',
        name:'shaka',
        phone:'8077705125',
        unread:0,
        messages:[]
      }
    ];

    return of(conversations);
  }

}
