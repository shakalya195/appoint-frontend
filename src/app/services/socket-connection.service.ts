
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Socket } from 'ngx-socket-io';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';

export class jobModal{
  title:string;
  description:string;
  type:string;
  exp:number;
}

@Injectable({
  providedIn: 'root'
})
export class SocketConnection extends Socket {

  public jobs:jobModal[]=[];

  constructor(
    private toastr:ToastrService,
    private router:Router
  ) {

    let accessToken = localStorage.getItem('accessToken');
    console.log('accessToken',accessToken);
    super({ url: `${environment.SOCKET_END_POINT}?accessToken=${accessToken}`, options: {
      transports: ["websocket"]
    } });

    this.on('connect_error', ()=> {
      console.log('Connection failed');
      this.toastr.error('Connection failed');
      localStorage.removeItem('accessToken');
      this.router.navigate(['/login']);
    });
    this.on('reconnect_failed', ()=> {
      console.log('Reconnection failed');
    });

    console.log("SOCKET CONNECT HIT");
    this.updateJobs();
  }

  updateJobs(){
    let jobs = localStorage.getItem('jobs');
    if(jobs){
      this.jobs = JSON.parse(jobs);
    }
  }

}
