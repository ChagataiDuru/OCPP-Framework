import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MapComponent } from './map/map.component';
import { StationsComponent } from './stations/stations.component';
import { DetailComponent } from './detail/detail.component';
import { TransactionComponent } from './transactions/transactions.component';

const routes: Routes = [
  { path: '',      component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'map',   component: MapComponent, canActivate: [AuthGuard] },
  { path: 'stations', component: StationsComponent, canActivate: [AuthGuard] },
  { path: 'detail/:cp', component: DetailComponent, canActivate: [AuthGuard] },
  { path: 'transactions', component: TransactionComponent, canActivate: [AuthGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
