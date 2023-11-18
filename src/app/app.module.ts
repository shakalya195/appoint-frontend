import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MatDialogModule} from "@angular/material/dialog";
import { MatButtonModule} from '@angular/material/button';

import { AppComponent } from './app.component';
import { RouterModule, Routes } from '@angular/router';
import { MessagingComponent } from './messaging/messaging.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { VerificationComponent } from './verification/verification.component';
import { ToastrModule } from 'ngx-toastr';
import { ApiService } from './services/api.service';
import { MessagingService } from './services/messaging.service';
import { MapComponent } from './map/map.component';
import { InternalComponent } from './internal/internal.component';
import { AuthGuard } from './services/auth.guard';
import { ProfileComponent } from './profile/profile.component';
import { AccountComponent } from './account/account.component';
import { PropertiesComponent } from './properties/properties.component';
import { InterceptorService } from './services/interceptor.service';
import { AddJobComponent } from './add-job/add-job.component';

const appRoutes: Routes = [
  { path: '',component: LoginComponent},
  { path: 'login',component: LoginComponent},
  { path: 'varification', component: VerificationComponent},
  { path: 'chat',component: MessagingComponent,canActivate:[AuthGuard]},
  { path: 'map',component: MapComponent,canActivate:[AuthGuard]},
  { path: 'profile',component: ProfileComponent,canActivate:[AuthGuard]},
  { path: '**', redirectTo: '/404' },
];

@NgModule({
  declarations: [
    AppComponent,
    MessagingComponent,
    LoginComponent,
    VerificationComponent,
    MapComponent,
    InternalComponent,
    ProfileComponent,
    AccountComponent,
    PropertiesComponent,
    AddJobComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(appRoutes),
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    MatDialogModule,
    MatButtonModule,
  ],
  providers: [
    ApiService,
    MessagingService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptorService,
      multi: true
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
