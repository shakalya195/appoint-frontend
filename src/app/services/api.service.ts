import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { MessagingService } from './messaging.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  user: any = {};
  apiEndpoint:any = environment.API_END_POINT;

  tags:any[]=[    
    {title:'electrician',               color:"#107844",   type:"PROFILE"},
    {title:'plumber',                   color:"#331247",   type:"PROFILE"},
    {title:'programmer',                color:"#580443",   type:"PROFILE"},
    {title:'shop',                      color:"#995832",   type:"PROFILE"},
    {title:'driver',                    color:"#320337",   type:"PROFILE"},
    {title:'mistri',                    color:"#593919",   type:"PROFILE"},
    {title:'helper',                    color:"#291901",   type:"PROFILE"},
    {title:'drycleaner',                color:"#487548",   type:"PROFILE"},
    {title:'doctor',                    color:"#132848",   type:"PROFILE"},
    {title:'builder',                   color:"#096847",   type:"PROFILE"},
    {title:'laundry',                   color:"#108441",   type:"PROFILE"},
    {title:'soldering',                 color:"#319022",   type:"PROFILE"},
    {title:'welder',                    color:"#048121",   type:"PROFILE"},
    {title:'writer',                    color:"#393575",   type:"PROFILE"},
    {title:'Child advocate',            color:"#781778",   type:"PROFILE"},
    {title:'Pest control',              color:"#030278",   type:"PROFILE"},
    {title:'Veterinarian',              color:"#933859",   type:"PROFILE"},
    {title:'mechanic',                  color:"#122871",   type:"PROFILE"},
    {title:'Interior designer',         color:"#730033",   type:"PROFILE"},
    {title:'driver',                    color:"#591751",   type:"PROFILE"},

    {title:'property',                  color:"#366302",   type:"LOCATION"},
    {title:'2bhk',                      color:"#376099",   type:"LOCATION"},
    {title:'3bhk',                      color:"#683065",   type:"LOCATION"},
    {title:'rk',                        color:"#364990",   type:"LOCATION"},
    {title:'soho',                      color:"#016195",   type:"LOCATION"},
  ];

  constructor(
    private router: Router,
    private http: HttpClient,
    private msg:MessagingService
  ) {
    let user = localStorage.getItem('user');
    if(user){
      this.user = JSON.parse(user);
      console.log(this.user);
    }
  }

  getData(url,param)
  {
    return this.http.get<any>(this.apiEndpoint+url,{params:param});
  }

  // filter is used to remove undefined null 0 keys 
  postData(url,value,filter=true)
  {
    if(filter){
      console.log("removing keys");
      Object.keys(value).forEach(key => {
        if(!value[key] || value[key] === undefined || Number.isNaN(value[key]))
        delete value[key];
      });
    }
    return this.http.post<any>(this.apiEndpoint+url,value);
  }
  
  putData(url,value)
  {
    return this.http.put<any>(this.apiEndpoint+url,value);
  }

  patchData(url,value)
  {
    return this.http.patch<any>(this.apiEndpoint+url,value);
  }

  deleteData(url,param)
  {
    return this.http.delete<any>(this.apiEndpoint+url,{params:param});
  }

  parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  }

  generateKeyPair() {
    // Let's generate the key pair first
    window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048, // can be 1024, 2048 or 4096
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: { name: "SHA-256" } // or SHA-512
      },
      true,
      ["encrypt", "decrypt"]
    ).then((keyPair) => {
      /* now when the key pair is generated we are going
        to export it from the keypair object in pkcs8
      */
      console.log('keyPair', keyPair);
      window.crypto.subtle.exportKey(
        "pkcs8",
        keyPair.privateKey
      ).then((exportedPrivateKey) => {
        // converting exported private key to PEM format
        var pem = this.toPem(exportedPrivateKey);
        console.log(pem);
      }).catch(function (err) {
        console.log(err);
      });
    });
  }

  toPem(privateKey) {
    var b64 = this.addNewLines(this.arrayBufferToBase64(privateKey));
    var pem = "-----BEGIN PRIVATE KEY-----\n" + b64 + "-----END PRIVATE KEY-----";

    return pem;
  }

  arrayBufferToBase64(arrayBuffer) {
    var byteArray = new Uint8Array(arrayBuffer);
    var byteString = '';
    for (var i = 0; i < byteArray.byteLength; i++) {
      byteString += String.fromCharCode(byteArray[i]);
    }
    var b64 = window.btoa(byteString);

    return b64;
  }


  addNewLines(str) {
    var finalString = '';
    while (str.length > 0) {
      finalString += str.substring(0, 64) + '\n';
      str = str.substring(64);
    }

    return finalString;
  }

  logout() {
    localStorage.removeItem('accessToken');
    this.router.navigate(['/login']);
    this.msg.socket.disconnect();
  }
}
