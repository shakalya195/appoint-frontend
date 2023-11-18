import { Component } from '@angular/core';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {

  user:any;
  tab:string;
  
  roles:any[];
  locations:any[]=[];
  locationsSkip = 0;
  locationsLimit = 0;

  constructor(
    private api:ApiService
  ){
    this.roles = this.api.tags.filter(item=>item.type=='PROFILE');
  }
  
  ngOnInit(){
    this.user = this.api.user;
  }

  initProfile(){
    this.tab= 'PROFILE';
  }
  
  initSecurity(){
    this.tab= 'SECURITY';
  }

  changeName(){
    this.api.putData('updateProfile',{name:this.user.name}).subscribe(res=>{
      console.log(res);
      localStorage.setItem('user',JSON.stringify(this.user));
    });
  }

  changeColor(){
    this.api.putData('updateProfile',{color:this.user.color}).subscribe(res=>{
      console.log(res);
      localStorage.setItem('user',JSON.stringify(this.user));
    });
  }

  changeRole(role){
    this.user.role = role;
    this.api.putData('updateProfile',{role:role}).subscribe(res=>{
      console.log(res);
      localStorage.setItem('user',JSON.stringify(this.user));
    });
  }

  changeCoordinates(longLat){
    this.user.loc = longLat;
    this.api.putData('updateProfile',{role:longLat}).subscribe(res=>{
      localStorage.setItem('user',JSON.stringify(this.user));
    });
  }

  initLocations(){
    this.tab = 'LOCATION'
    this.locationsSkip = 0;
    this.locationsLimit = 100;
    this.getLocations();
  }

  getLocations(){
    let input:any={};
    input.skip = this.locationsSkip;
    input.limit = this.locationsLimit;
    this.api.getData(`pointers`,input).subscribe(res=>{
      this.locations = res;
    });
  }

  removeLocation(index){
    
    let id = this.locations[index]['_id'];
    this.api.deleteData(`pointers/${id}`,{}).subscribe(res=>{
      this.locations[index]['isDeleted'] = !this.locations[index]['isDeleted'];
      setTimeout(()=>{
        this.locations.splice(index,1);
      },2000);
    });
  }

  generateKeyPair(){
    this.api.generateKeyPair();
  }

  getBackgroundColor(tagName){
    return this.api.tags.filter(item=>item.title == tagName)[0]['color'];
  }

  logout(){
    this.api.logout();
  }
}
