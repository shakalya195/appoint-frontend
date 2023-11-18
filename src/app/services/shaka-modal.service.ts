import { ApplicationRef, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ShakaModalService {

  constructor(
    private _appRef: ApplicationRef,
  ) { }

  open(){
    this._appRef;
  }
}
