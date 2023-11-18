import { Component, OnInit } from '@angular/core';
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import Feature from 'ol/Feature.js';
import Map from 'ol/Map.js';
import Point from 'ol/geom/Point.js';
import Overlay from 'ol/Overlay.js';
import Polyline from 'ol/format/Polyline.js';
import View from 'ol/View.js';
import XYZ from 'ol/source/XYZ.js';
import {OSM, Vector as VectorSource} from 'ol/source.js';
import {
  Circle as CircleStyle,
  Fill,
  Icon,
  RegularShape,
  Stroke,
  Style,
  Text
} from 'ol/style.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {getVectorContext} from 'ol/render.js';
import * as olProj from 'ol/proj';
import {fromLonLat, toLonLat} from 'ol/proj.js';
import {unByKey} from 'ol/Observable.js';
import {easeOut} from 'ol/easing.js';
import { ApiService } from '../services/api.service';
import { MessagingService } from '../services/messaging.service';
import { find, Observable, Subscription } from 'rxjs';
import { ShakaModalService } from '../services/shaka-modal.service';
import { AddJobComponent } from '../add-job/add-job.component';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css','../../../node_modules/ol/ol.css']
})
export class MapComponent implements OnInit {

  Object=Object;
  waitingTime=1000;
  duration=5000;
  defaultColor="#ff8899";
  searchGlobal$$:Subscription;
  map:any;
  tileLayer:any;
  overlay:any;
  center:any = [30.7227062,76.6990167];
  source:any;
  vector:any;

  jobs=[];

  user:any;
  userPointers:any={};
  users:any={};
  tags:any[];
  onwait = false;
  selectedTag:any;
  tagString:string;
  radius = 1000;
  featureCircle;
  skip=0;
  limit=100;
  centerStyle = new Style({
    image: new RegularShape({
      stroke: new Stroke({
        color: '#0d0887',
        width: 1,
      }),
      points: 4,
      radius: 10,
      radius2: 0,
      angle: 0,
    }),
  })

  userStyle = new Style({
    image: new CircleStyle({
      radius: 5,
      stroke: new Stroke({
        color: 'rgba(0, 255, 0, 1)',
        width: 1,
      }),
      fill: new Fill({
        color: '#0d0887',
      }),
    }),
  });

  propertyStyle = new Style({
    image: new CircleStyle({
      radius: 5,
      stroke: new Stroke({
        color: 'rgba(0, 255, 0, 1)',
        width: 1,
      }),
      fill: new Fill({
        color: '#ff0000',
      }),
    }),
  });

  constructor(
    private api:ApiService,
    private msg:MessagingService,
    private shaka:ShakaModalService,
    private dialog: MatDialog
  ) {
    this.tags = this.api.tags;
  }

  ngOnInit(): void {
    this.user = this.api.user;
    this.msg.initSocket();
    this.initMap();
    this.addUser();
    // update listensers
    this.msg.socket.on('update',point=>{
      console.log('POINTER PING',point);
      // this.addPointer(point);
    });
  }

  updateUser(){
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition( async (position) => {
        this.user.loc = [position.coords.longitude,position.coords.latitude];
        this.emitUser();
        this.searchGlobal();
      });
    }
  }

  updateMyLocation(){
    this.user.loc = this.center;
    this.api.putData('updateProfile',{loc:this.user.loc}).subscribe(res=>{
      localStorage.setItem('user',JSON.stringify(this.user));
    });
  }

  emitUser(){
    let user:any={};
    user._id = this.user._id;
    user.name = this.user.name;
    user.phone = this.user.phone;
    user.role = this.user.role;
    user.loc = this.user.loc;
    user.type = 'USER';
    this.msg.socket.emit('update', user );
  }

  async initMap(){
    this.source = new VectorSource({
      wrapX: false,
    });
    this.vector = new VectorLayer({
      source: this.source,
    });

    this.tileLayer = new TileLayer({
      source: new OSM({
        wrapX: false,
      }),
    });

    this.overlay = new Overlay({
      element: document.getElementById('pop'),
      autoPan: {
        animation: {
          duration: 250,
        },
      },
    });

    let position:any = await this.getLocation();
    // this.center = [position.coords.longitude,position.coords.latitude];
    this.center = olProj.fromLonLat( [position.coords.longitude,position.coords.latitude])
    console.log('center',this.center);
    this.map = new Map({
      target: document.getElementById('map'),
      view: new View({
        center: this.center,
        zoom: 16,
        minZoom: 2,
        maxZoom: 19,
      }),
      layers: [
        this.tileLayer,
        this.vector
      ],
      overlays: [
        this.overlay
      ],
    });

    this.map.on('moveend', ()=> {
      if(!this.onwait){
        this.onwait = true;
        setTimeout(() => {
          this.onwait = false;
        }, this.waitingTime); // awaid time
        const view = this.map.getView();
        const center = view.getCenter();
        this.center = olProj.toLonLat(center);
        console.log('center',this.center);
        this.updateCenterCircle(this.center);
        this.emitUser();
        this.searchGlobal();
        // this.openOverlay(center,'<p>center is here'+center+'</p>')
      }
    });

    this.source.on('addfeature', (e)=> {
       this.flash(e.feature);
      //  setTimeout(() => {
      //   this.flash(e.feature);
      //  }, 3000);
      //  setTimeout(() => {
      //   this.flash(e.feature);
      //  }, 6000);
      //  setTimeout(() => {
      //   this.flash(e.feature);
      //  }, 9000);
    });

    this.map.on('click', (event)=> {
      console.log('map',this.map);
      this.map.forEachFeatureAtPixel(event.pixel, (feature,layer)=> {
        console.log('feature',feature);
        const data = feature.values_.data;
        const html = `<span class="tag tiny">${data.tags[0]}</span> ${data.name}`;
        this.openOverlay(feature.values_.geometry.flatCoordinates, html);
      });
    });

    this.map.on('singleclick', (evt)=> {
      const coordinate = evt.coordinate;
      const view = this.map.getView();
      view.animate({
        center: coordinate,
        duration: 2000,
      });
      const hdms = toLonLat(coordinate);
      console.log(hdms);
    });

    document.getElementById('popup-closer').onclick = ()=> {
      this.overlay.setPosition(undefined);
      document.getElementById('popup-closer').blur();
      return false;
    };

  }

  getLocation() {
    return new Promise(async (resolve,reject)=>{
      if (navigator.geolocation) {
        await navigator.geolocation.getCurrentPosition((position)=>{
          console.log('position',position);
          resolve(position);
        });
      } else {
        console.log("Geolocation is not supported by this browser.");
        // reject({coords:{latitude:30.7121008 ,longitude:76.6965248}, timestamp: Date.now()});
      }
    });
  }

  // searchInit(){
  //   this.skip=0;
  //   this.limit=100;
  //   this.searchGlobal();
  // }

  searchGlobal(){
    let input:any={};
    input.loc = this.center;
    input.radius = this.radius;
    input.tag = this.tagString;
    input.skip = this.skip;
    input.limit = this.limit;
    if(this.searchGlobal$$){
      this.searchGlobal$$.unsubscribe();
    }
    this.searchGlobal$$ = this.api.postData('searchGlobal', input, false).subscribe(res=>{
      res['data'].map(item=>{
        this.addPointer(item);
      });
    });
  }

  updateCenterCircle(lngLat){
    if(this.featureCircle){
      this.source.removeFeature(this.featureCircle);
    }
    this.featureCircle = new Feature({
      geometry: new Point(fromLonLat(lngLat)),
      labelPoint: new Point(fromLonLat(lngLat)),
    });
    this.source.addFeature(this.featureCircle);
    this.featureCircle.setStyle(this.centerStyle);
  }

  addPointer(user){
    let lngLat = user.loc;
    if(this.userPointers[user._id]){
      console.log('FOUND');
      // this.source.removeFeature(this.userPointers[user._id]);
    }else{
      this.userPointers[user._id] = new Feature({
        geometry: new Point(fromLonLat(lngLat)),
        labelPoint: new Point(fromLonLat(lngLat)),
        name: user.name,
        data: user
      });
      this.source.addFeature(this.userPointers[user._id]);
      
      if(user.type=='PROPERTY'){
        let style = new Style({
          
          text: new Text({
              text: [user.tag,'bold 12px sans-serif'],
              fill: new Fill({
                  color: '#fff'
              }),
              backgroundFill: new Fill({
                color: this.getTagColor(user.tag),
              }),
              padding:[2,5,2,5]
          })
        });
        this.userPointers[user._id].setStyle(style);
      }else{
        let style = new Style({
          image: new CircleStyle({
            radius: 10,
            fill: new Fill({
                color: 'rgba(100,50,200,0.5)'
            }),
            stroke: new Stroke({
                color: 'rgba(120,30,100,0.8)',
                width: 3
            })
        }),
          text: new Text({
              text: [user.tag,'bold 12px sans-serif'],
              fill: new Fill({
                  color: '#fff'
              }),
              backgroundFill: new Fill({
                color: 'rgba(181, 81, 81, 0.7)',
              }),
              padding:[2,5,2,5],
              offsetY:20,
          })
        });
        this.userPointers[user._id].setStyle(style);
      }
      
    
    }
  }

  getTagColor(tagName){
    let findIndex = this.tags.findIndex(item=>item.title==tagName);
    console.log('findIndex',findIndex,tagName);
    if(findIndex > -1){
      return this.api.tags[findIndex]['color'];
    }
    return this.defaultColor;
  }

  flash(feature) {
    const start = Date.now();
    const flashGeom = feature.getGeometry().clone();
    const listenerKey = this.tileLayer.on('postrender', (event)=> {
      const frameState = event.frameState;
      const elapsed = frameState.time - start;
      if (elapsed >= this.duration) {
        unByKey(listenerKey);
        return;
      }
      const vectorContext = getVectorContext(event);
      const elapsedRatio = elapsed / this.duration;
      // radius will be 5 at start and 30 at end.
      const radius = easeOut(elapsedRatio) * 25 + 5;
      const opacity = easeOut(1 - elapsedRatio);
  
      const style = new Style({
        image: new CircleStyle({
          radius: radius,
          stroke: new Stroke({
            color: 'rgba(255, 0, 0, ' + opacity + ')',
            width: 0.25 + opacity,
          }),
        }),
      });
  
      vectorContext.setStyle(style);
      vectorContext.drawGeometry(flashGeom);
      // tell OpenLayers to continue postrender animation
      this.map.render();
    });
  }

  log(){
    console.log(this.map);
  }

  addUser(){
    let d = new Date();
    let input:any = {}
    input.loc = this.user.loc;
    input.name = this.user.name;
    input.description = this.user.description;
    input.type = "USER";
    input.tag = this.user.role;
    input.tags = [];
    input.tags.unshift(this.user.role);
    input.phone = this.user.phone;
    input.expireAt = d.setMinutes(d.getMinutes()+10);
    this.api.postData('pointers',input).subscribe(res=>{
        console.log('res',res);
    });
  }

  addJob(){
    // this.shaka.
    this.openDialog();
    // let d = new Date();
    // let input:any = {}
    // input.loc = this.center;
    // input.name = 'Fully furnished 2bhk kothi';
    // input.description = "We are doing all kind of plumbing jobs";
    // input.type = "PROPERTY";
    // this.selectedTag ? input.tag = this.selectedTag.title : delete input.tag;
    // input.tags = ["property","2bhk"];
    // input.phone = this.user.phone;
    // input.expireAt = d.setHours(d.getHours()+24);
    // this.api.postData('pointers',input).subscribe(res=>{
    //     console.log('res',res);
    // });
  }

  openDialog() {
    this.dialog.open(AddJobComponent,{
      panelClass: ['no-padding-dialog'],
      width: '60%',
      data: {
        center: this.center,
        tags:this.tags
      }
    }).afterClosed().subscribe(data => {
      console.log(data);
  }); 
}


  selectTag(tag){
    this.selectedTag = tag;
    this.tagString = this.selectedTag.title;
    Object.keys(this.userPointers).forEach((key)=>{
      this.source.removeFeature(this.userPointers[key]);
    })
    this.userPointers = {};
    this.searchGlobal();
  }


  openOverlay(center,html){
    document.getElementById('popup-content').innerHTML = html;
    this.overlay.setPosition(center);
  }

  ngOnDestroy(){
    this.msg.socket.off('update');
  }

}
