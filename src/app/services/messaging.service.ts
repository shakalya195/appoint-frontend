import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as io from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class MessagingService {

  playerId:any;
  socket:any={};

  constructor(
  ) { 
    // this.initSocket();
    // this.initOneSignal();
  }
  

  initSocket(){
    console.log('this.socket.connected',this.socket.connected);
    if(!this.socket.connected){
      let accessToken = localStorage.getItem('accessToken');
      if(accessToken){
        this.socket = io.connect(`${environment.SOCKET_END_POINT}?accessToken=${accessToken}`,{transports: ['websocket'],secure: true } );

        this.socket.on('note',(res)=>{
          console.log(res);
        });
      }
    }else{
      console.log('socket already connected');
    }
  }
  
  initOneSignal(){
    var OneSignal = window['OneSignal'] || [];
    console.log("Init OneSignal");
    OneSignal.push(["init", {
      appId: environment.ONESIGNAL_APP_ID,
      autoRegister: false,
      allowLocalhostAsSecureOrigin: true,
      notifyButton: {
        enable: false
      }
    }]);
    
    console.log('OneSignal Initialized');
    if(window['OneSignal']){
      OneSignal.showNativePrompt();
      // OneSignal.on('notificationDisplay',(res)=>{
      //   console.log('PUSH DATA',res);
      // });
      window['OneSignal'].getUserId().then((userId)=> {
        this.playerId = userId;
        // this.socket.emit('updatePlayerId',this.playerId);
        console.log('playerId',this.playerId, 'updatePlayerId');
      });
    }
  }
}
