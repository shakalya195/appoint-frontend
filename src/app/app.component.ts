import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient} from '@angular/common/http';
import { ApiService } from './services/api.service';
import { MessagingService } from './services/messaging.service';
import { fromEvent } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'socket-frontend';
  environment=environment;
  analyticsData:any;

  user:any;
  isOnline:boolean;

  constructor(
    private HttpClient: HttpClient,
    private api:ApiService,
    private msg:MessagingService,
    private toastr:ToastrService,
  ){
    this.getCoordinates();
    fromEvent(window, 'online').subscribe(e=>{
      this.isOnline = true;
      this.toastr.success("You are Online");
    });
    fromEvent(window, 'online').subscribe(e=>{
      this.isOnline = false;
      this.toastr.error("You are Offline");
    });
  }

  getCoordinates(){
    if(navigator && navigator.geolocation){
      navigator.geolocation.getCurrentPosition((location)=> {
        this.api.user.loc = [location.coords.longitude,location.coords.latitude];
        console.log('APP INIT USER LOCATION',this.api.user);
        this.user = this.api.user;
        this.api.putData('updateProfile',{loc:this.user.loc}).subscribe(res=>{
          localStorage.setItem('user',JSON.stringify(this.user));
        });
      });
    }
  }
  
  analytics(){
    this.HttpClient.get(environment.API_END_POINT+'analytics',{}).subscribe(res=>{
      this.analyticsData = res;
    });
  }

}
