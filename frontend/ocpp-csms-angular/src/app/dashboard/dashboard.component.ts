import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../config.service';

@Component({
  selector: 'app-dashboard',
  moduleId: module.id,
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  totalChargeStations = 0;

  constructor(private http: HttpClient, private configService: ConfigService) {}

  ngOnInit() {
    const apiUrl = this.configService.getApiUrl();
    this.http.get<any[]>(`${apiUrl}/chargers`).subscribe(chargers => {
      this.totalChargeStations = chargers.length;
    });
  }
}