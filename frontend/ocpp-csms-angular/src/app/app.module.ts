// app.module.ts
import { BrowserModule } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { GoogleMapsModule } from '@angular/google-maps';
import { FormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { NgChartsModule } from 'ng2-charts';

import { AppRoutingModule } from './app.routes';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { SidebarModule } from './sidebar/sidebar.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NavbarModule } from './navbar/navbar.module';
import { MapComponent } from './map/map.component';
import { StationsComponent } from './stations/stations.component';
import { DetailComponent } from './detail/detail.component';
import { TransactionComponent } from './transactions/transactions.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    MapComponent,
    StationsComponent,
    DetailComponent,
    TransactionComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgChartsModule,
    HttpClientModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    SidebarModule,
    NavbarModule,
    ToastrModule.forRoot({
      positionClass :'toast-bottom-right'
    }),
    GoogleMapsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
})
export class AppModule {}
