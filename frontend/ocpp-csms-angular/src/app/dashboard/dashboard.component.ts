import { HttpClient } from '@angular/common/http';
import { Component, OnInit,ChangeDetectorRef } from '@angular/core';

import { ConfigService } from '../config.service';
import { SseService } from '../sse.service';

@Component({
  selector: 'app-dashboard',
  moduleId: module.id,
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  totalChargeStations = 0;
  activeClients = 0;
  occupiedChargeStations = 0;
  apiUrl: string = '';
  constructor(private http: HttpClient, private configService: ConfigService, private _sseService: SseService, private cdr: ChangeDetectorRef) {
    this.apiUrl = this.configService.getApiUrl();
    this._sseService.getServerSentEvent(`${this.apiUrl}/heartbeat`).subscribe({
      next: event => {
        console.log('Received event: ', event.data);
        const data = JSON.parse(event.data);
        if (data) {
          this.http.get<any[]>(`${this.apiUrl}/chargers/available`).subscribe(chargers => {
            this.activeClients = chargers.length;
          });
          this.cdr.detectChanges();
        }
      },
      error: error => console.error(error)
    });
  }

  ngOnInit() {
    this.http.get<any[]>(`${this.apiUrl}/chargers`).subscribe(chargers => {
      this.totalChargeStations = chargers.length;
    });
    this.http.get<any[]>(`${this.apiUrl}/chargers/available`).subscribe(chargers => {
      this.activeClients = chargers.length;
    });
    this.http.get<any[]>(`${this.apiUrl}/chargers/occupied`).subscribe(chargers => {
      this.occupiedChargeStations += chargers.length;
    });
  }
}