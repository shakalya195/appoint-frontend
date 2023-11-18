import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-add-job',
  templateUrl: './add-job.component.html',
  styleUrls: ['./add-job.component.css']
})
export class AddJobComponent {

  user:any;
  point:any={};
  tags:any[]=[];
  selectedTag:any;

  constructor(
    private api:ApiService,
    public dialogRef: MatDialogRef<AddJobComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ){
    this.point.center = data.center;
    this.tags = this.api.tags.filter(item=>item.type=='LOCATION');
    this.user = this.api.user;
  }

  selectTag(tag){
    this.selectedTag = tag;
  }

  save(){
    let d = new Date();
    let input:any = {}
    input.loc = this.data.center;
    input.name = 'Fully furnished 2bhk kothi';
    input.description = "We are doing all kind of plumbing jobs";
    input.type = "LOCATION";
    this.selectedTag ? input.tag = this.selectedTag.title : delete input.tag;
    input.tags = ["property","2bhk"];
    input.phone = this.user.phone;
    input.expireAt = d.setHours(d.getHours()+24);
    this.api.postData('pointers',input).subscribe(res=>{
        console.log('res',res);
    });
  }

  close(){
    this.dialogRef.close(this.data)
  }


}
