import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient} from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../services/api.service';
import { MessagingService } from '../services/messaging.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  tab='LOGIN';
  user:any={
    dialCode:'+91',
    country:'in',
  };
  environment:any=environment;
  loginError:any;

  constructor(
    private router:Router,
    private HttpClient: HttpClient,
    private toastr: ToastrService,
    private api:ApiService,
    private msg:MessagingService
  ) { }

  ngOnInit(): void {
    if(localStorage.getItem('accessToken')){
      this.router.navigate(['chat']);
    }
    if(navigator && navigator.geolocation){
      navigator.geolocation.getCurrentPosition((location)=> {
        this.user.loc = [location.coords.longitude,location.coords.latitude];
      });
    }
  }

  login(){
    if(!this.user.phone){
      this.toastr.error('Please enter phone');
      return false;
    }
    if(this.user.phone.length != 10){
      this.toastr.error('Please enter a valid phone');
      return false;
    }
    if(!this.user.password){
      this.toastr.error('Please enter password');
      return false;
    }
    // let user = JSON.stringify(this.user);
    // localStorage.setItem('user',user);
    // this.router.navigate(['/chat']);
    let input:any={};
    input.phone = this.user.phone;
    input.password = this.user.password;
    input.country = this.user.country;
    input.dialCode = this.user.dialCode;
    input.loc = this.user.loc;
    input.playerId = this.msg.playerId;
    console.log('input',input);
    this.HttpClient.post(environment.API_END_POINT+'login',input).subscribe(res=>{
      if(res && res['user'] && !res['user']['phoneVarified']){
        this.api.user = res['user'];
        this.api.user.loc = this.user.loc;
        this.router.navigate(['/varification']);
        this.toastr.error('Phone number is not verified');
        return false;
      }
      if(res && res['accessToken']){
        this.api.user = res['user'];
        localStorage.setItem('accessToken',res['accessToken']);
        localStorage.setItem('user',JSON.stringify(res['user']));
        this.msg.socket = {};
        this.router.navigate(['/chat']);
        this.toastr.success('Successfully Logged In');
      }
 
    },(error)=>{
      console.log("LOGIN ERROR",error.error.message);
      this.loginError = error.error.message;
      setTimeout(()=>{
        this.loginError = '';
      },3000);
      this.toastr.error(error.error.message);
    });

  }

  register(){
    if(!this.user.name){
      this.toastr.error('Please enter user name');
      return false;
    }
    if(!this.user.phone){
      this.toastr.error('Please enter phone');
      return false;
    }
    if(!this.validatePhone(this.user.phone)){
      this.toastr.error('Please enter a valid phone');
      return false;
    }
    if(!this.user.password){
      this.toastr.error('Please enter password');
      return false;
    }
    let input:any={};
    input.name = this.user.name;
    input.phone = this.user.phone;
    input.country = this.user.country;
    input.dialCode = this.user.dialCode;
    input.password = this.user.password;
    input.loc = this.user.loc;
    input.playerId = this.msg.playerId;
    console.log(input);
    this.HttpClient.post(environment.API_END_POINT+'register',input).subscribe(res=>{
      console.log(res);
      this.tab='LOGIN';
    },(error)=>{
      this.loginError = error.error.message;
      setTimeout(()=>{
        this.loginError = '';
      },3000);
      this.toastr.error(error.error.message);
    });
  }

  validatePhone(str){
    return /^\d{10}$/.test(str);
  }

  validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

}
