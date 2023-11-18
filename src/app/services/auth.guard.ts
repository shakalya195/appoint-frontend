import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(private router: Router){}
  canActivate()
  {
    let token = localStorage.getItem("accessToken");
    if (token) {
      return true;
    }
    this.router.navigate(['']);
    return false;
  }
}
