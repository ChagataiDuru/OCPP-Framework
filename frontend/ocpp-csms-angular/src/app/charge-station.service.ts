// charge-station.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class ChargeStationService {
  constructor(private http: HttpClient,private configService: ConfigService) {}
  
  private apiUrl = this.configService.getApiUrl();

  getChargeStationStatus(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/charge-stations`);
  }
}
