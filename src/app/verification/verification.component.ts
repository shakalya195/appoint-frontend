import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ApiService } from '../services/api.service';
import { HttpClient} from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-verification',
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.css']
})
export class VerificationComponent implements OnInit {

  otp:any;
  user:any;
  environment:any=environment;

  skip:boolean = false;
  
  constructor(
    private api:ApiService,
    private HttpClient: HttpClient,
    private router:Router,
    private toastr:ToastrService
  ) { 

    
  }

  ngOnInit(): void {
    if(this.api.user && this.api.user._id){
      console.log(this.api.user);
      this.user = this.api.user;
      this.generateOTP();
    }
  }

  generateOTP(){
    let skip = true;
    let input:any={};
    input._id = this.user._id;
    if(skip){
      input.skip = true;
    }
    this.HttpClient.post(environment.API_END_POINT+'generateOTP', input ).subscribe(res=>{
      console.log(res);
      this.toastr.success(res['message']);
      if(skip){
        this.toastr.success(`OTP is: ${res['OTP']}`);
      }
    },(error)=>{
      this.toastr.error(error.error.message);
    });
  }

  validateOTP(){
    this.HttpClient.post(environment.API_END_POINT+'validateOTP',{_id:this.user._id, otp: this.otp}).subscribe(res=>{
      console.log(res);
      if(res && res['accessToken']){
        console.log(2);
        localStorage.setItem('accessToken',res['accessToken']);
        this.router.navigate(['/chat']);
      }
    },(error)=>{
      console.log(error);
      this.toastr.error(error.error.message);
    });
  }


  parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  };

}
