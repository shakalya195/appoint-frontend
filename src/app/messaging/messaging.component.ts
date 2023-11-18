import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../services/api.service';
import { MessagingService } from '../services/messaging.service';
import { SocketConnection } from '../services/socket-connection.service';


@Component({
  selector: 'app-messaging',
  templateUrl: './messaging.component.html',
  styleUrls: ['./messaging.component.css']
})
export class MessagingComponent implements OnInit {

  listMode:boolean=true;
  data:any;
  user:any;
  text:string;

  conversations:any=[];

  conversation:any;

  request:any;
  db:any;
  contacts:any;
  version = 1;
  tab='CHAT';
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  
  constructor(
    private msg:MessagingService,
    private router: Router,
    private toastr: ToastrService,
    private api:ApiService,
    // private socket:SocketConnection
  ) { }

  ngOnInit(): void {

    this.user = this.api.user;
    console.log('RECONNECT',this.msg.socket);
    this.msg.initSocket();

    // const request = indexedDB.open('CRM', 1);
    // request.onupgradeneeded = (event:any) => {
    //   const db = event.target.result;
    //   let store = db.createObjectStore('messages', {
    //     autoIncrement: true
    //   });
    // };
    // this.msg.socket.disconnect();
    // this.msg.socket.connect();
    
    this.checkConversations();

    this.updateLocation();

    this.msg.socket.on("note",(data)=>{
      console.log("NOTE",data);
    });
    this.msg.socket.on("messageFromServer",(data)=>{
      console.log('messageFromServer',data);
      if(data.receiver == this.user.phone){
        let findIndex = this.conversations.findIndex(item=>item.phone == data.sender);
        // console.log('findIndex',findIndex);
        if(findIndex > -1){

            let messageIndex = this.conversations[findIndex]['messages'].findIndex(m=>m.uid == data.uid);
            if(messageIndex > -1){
              this.conversations[findIndex]['messages'][messageIndex] = data
            }else{
              this.conversations[findIndex]['messages'].push(data);
              // console.log(this.conversation.phone , data.sender)
              if(this.conversation && this.conversation.phone == data.sender){
                // open converation DO NOTHING
                this.scrollToBottom();
              }else{
                this.conversations[findIndex]['unread']++;
              }
            }
            if(data.close){
              this.insertDBMessage(data.sender, data);
              delete this.conversations[data.sender];
            }else{
              this.conversations[data.sender]=data;
            }
          
        }else{
          if(data.close){
            let newConversation = {
              id: data.sender,
              name:data.sender,
              phone:data.sender,
              unread: 0,
              messages:[]
            }
            this.insertDBContacts(newConversation);

            newConversation.unread = 1;
            newConversation.messages = [data];
            this.conversations.push(newConversation);
            this.insertDBMessage(data.sender, data);
          }
        }
      }

    });


    this.msg.socket.on("note",(data)=>{
      console.log("note",data);
      if(data && data['status'] == 401){
        this.toastr.error(data['message']);
        console.log('UNAUTHORISED');
        localStorage.clear();
        this.router.navigate(['/']);
      }
    });

    if (!window.indexedDB) {
      console.log("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
    }

  }

  checkConversations(){
    if(localStorage.getItem('contacts')){
      this.conversations = JSON.parse(localStorage.getItem('contacts'));
    }else{
      localStorage.setItem('contacts','[]');
    }
  }

  selectConversation(item){
    this.conversation = item;
    this.conversation.unread = 0;
    this.conversation.messages = [];
    this.geDBMessages(item);
    this.listMode = !this.listMode;
    this.scrollToBottom();
  }

  addNewConversation(){
    let phone = prompt('Enter phone number');
    if(!phone){
      return false;
    }
    if(phone == this.user.phone){
      return false;
    }
    let newConversation = {
      id: phone,
      name:phone,
      phone:phone,
      unread: 0,
      messages:[]
    }
    this.conversations.push(newConversation);
    this.insertDBContacts(newConversation);
  }

  newMessage:any={};
  uid;
  sendMessage(close = false){
    if(!this.uid){
      this.uid = Math.random().toString(16).slice(2);
    }
    if(!this.text || !this.conversation){
      return false;
    }
    this.newMessage.uid = this.uid;
    this.newMessage.sender = this.user.phone,
    this.newMessage.receiver = this.conversation.phone,
    this.newMessage.text = this.text,
    this.newMessage.time = new Date().getTime(),
    this.newMessage.close = close;

    console.log('sendMessage', this.newMessage);
    this.msg.socket.emit('sendMessage', this.newMessage );
    if(close){
      this.conversation.messages.push(this.newMessage);
      this.scrollToBottom();
      this.insertDBMessage(this.newMessage.receiver, this.newMessage);
      this.newMessage = {};
      this.text = '';
      this.uid = null;
    }
    
  }

  scrollToBottom(): void {
    setTimeout(()=>{
      try {
        this.myScrollContainer.nativeElement.scrollTo({ top: this.myScrollContainer.nativeElement.scrollHeight, behavior: 'smooth' })
      } catch(err) { }  
    },500)
               
  }


  generateProfilePicture(name:string = 'Anonymous'){
    let text = name.substring(0, 2);
    var c = <HTMLCanvasElement>document.createElement("CANVAS");
    c.setAttribute('height','100');
    c.setAttribute('width','100');
    var ctx = c.getContext("2d");
    var arrayColor = [
      'IndianRed','LightCoral','Salmon','Crimson','FireBrick','DarkRed',
      'DeepPink','MediumVioletRed','Coral','Tomato','DarkOrange',
      'DarkKhaki','Orchid','MediumOrchid','MediumPurple','RebeccaPurple','Purple','Indigo',
      'Lime','LimeGreen','SeaGreen','ForestGreen','DarkGreen','Olive','DarkOliveGreen','DarkCyan',
      'CadetBlue','SteelBlue','DodgerBlue','Blue','DarkBlue',
      'RosyBrown','SandyBrown','Goldenrod','Peru','Chocolate','Sienna','Brown','Maroon'
    ];
    var color = arrayColor[Math.floor(Math.random() * arrayColor.length)];
    
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 100, 100);
    ctx.font = "bold 80px sans-serif";
    ctx.fillStyle = 'white';
    ctx.textAlign = "center";
    ctx.fillText(text,50,80,90);
    let dataURL = c.toDataURL();
    document.body.append(c)
    c.remove();
    return dataURL;
  }

  removeConversation(conversation){
    this.deleteDBContact(conversation.phone);
    var DBDeleteRequest = window.indexedDB.deleteDatabase(conversation.phone);
    DBDeleteRequest.onerror = (event)=> {
      console.log("Error deleting database.");
    };
    DBDeleteRequest.onsuccess = (event)=>{
      console.log("Database deleted successfully");
      let findIndex = this.conversations.findIndex(item=>item.phone == conversation.phone)
      if(findIndex > -1){
        this.conversations.splice(findIndex,1);
        this.conversation = undefined;
        this.listMode = !this.listMode;
      }
    };
  }

  insertDBContacts(contact){
    let contacts = [];
    if(localStorage.getItem('contacts')){
      contacts = JSON.parse(localStorage.getItem('contacts'));
    }
    contacts.push(contact);
    localStorage.setItem('contacts',JSON.stringify(contacts));
  }

  changeName(phone, name){
    let contacts = JSON.parse(localStorage.getItem('contacts'));
    let findIndex = contacts.findIndex(item=>item.phone == phone);
    if(findIndex >= -1){
      contacts[findIndex]['name'] = name;
    }
    localStorage.setItem('contacts',JSON.stringify(contacts));
  }

  deleteDBContact(phone){
    let contacts = JSON.parse(localStorage.getItem('contacts'));
    let findIndex = contacts.findIndex(item=>item.phone == phone);
    if(findIndex >= -1){
      contacts.splice(findIndex,1);
    }
    localStorage.setItem('contacts',JSON.stringify(contacts));
  }


  ngOnDestroy(){
    this.msg.socket.removeListener('messageFromServer');
  }


  geDBMessages(conversation){

    const request = indexedDB.open( conversation.phone , 1);

    request.onupgradeneeded = (event:any) => {
      let db = event.target.result;
      let store = db.createObjectStore('messages', {
          autoIncrement: true
      });
    };

    request.onsuccess = (event:any) => {
      let db = event.target.result;
      let txn = db.transaction('messages', "readonly");
      let objectStore = txn.objectStore('messages');

      objectStore.openCursor().onsuccess = (event) => {
          let cursor = event.target.result;
          if (cursor) {
              let item = cursor.value;
              // console.log(item);
              conversation.messages.push(item);
              cursor.continue();
          }
      };
      // close the database connection
      txn.oncomplete = function () {
          db.close();
      };
    };
  }

  insertDBMessage(DB, message){
    const request = indexedDB.open( DB , 1);
    request.onupgradeneeded = (event:any) => {
      let db = event.target.result;
      let store = db.createObjectStore('messages', {
          autoIncrement: true
      });
    };

    request.onsuccess = (event:any) => {
      let db = event.target.result;
      const txn = db.transaction('messages', 'readwrite');

      // get the Contacts object store
      const store = txn.objectStore('messages');
      //
      let query = store.put( message );

      // handle success case
      query.onsuccess = function (event) {
          console.log(event);
      };

      // handle the error case
      query.onerror = function (event) {
          console.log(event.target.errorCode);
      }

      // close the database once the 
      // transaction completes
      txn.oncomplete = function () {
          db.close();
      };

    };

  }
  
  generateKeyPair(){
    this.api.generateKeyPair();
  }

  updateLocation(){
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition( async (position) => {
        console.log(position);
        this.msg.socket.emit('locationChange', [position.coords.longitude,position.coords.latitude]);
      });
    }
  }

  logout(){
    this.api.logout();
  }

}
