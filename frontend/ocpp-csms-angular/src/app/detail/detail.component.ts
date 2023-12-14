import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../config.service';
import { SseService } from '../sse.service';
import { connect } from 'http2';

export enum ConnectorType {
  ACType1 = 'AC Type1',
  ACType2 = 'AC Type2',
  ACGT = 'AC GB/T',
  DCCSS = 'DC CSS',
  DCCSS2 = 'DC CSS 2',
  CHAdeMO = 'CHAdeMO',
  DCGT = 'DC GB/T'
}

export interface CPDto {
  cpId: number;
  description: string;
  status: 'unavailable' | 'available' | 'occupied';
  manufacturer: string;
  latitude?: number;
  longitude?: number;
  serial_number: string;
  comment?: string;
  cpmodel: string;
  password?: string;
  connectors?: ConnectorType[];
}

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
})
export class DetailComponent implements OnInit {

  chargerDetail = {
    cpId: 0,
    description: '',
    status: 'unavailable',
    manufacturer: '',
    serial_number: '',
    connectors: [] as ConnectorType[],
  };
  
  constructor(private route: ActivatedRoute,private http: HttpClient, private configService: ConfigService, private _sseService: SseService) {}

  ngOnInit() {
    const apiUrl = this.configService.getApiUrl();
    const cpId = this.route.snapshot.paramMap.get('cp');
    this.http.get<CPDto>(`${apiUrl}/chargers/${cpId}`).subscribe(charger => {
      console.log('Charger: ', charger);

      const connectorsArray = Object.values(charger.connectors || {});
      
      console.log('Connectors array: ', connectorsArray);
      this.chargerDetail = {
        cpId: charger.cpId,
        description: charger.description,
        status: charger.status,
        manufacturer: charger.manufacturer,
        serial_number: charger.serial_number,
        connectors: connectorsArray as ConnectorType[],
      };
    });
    console.log('Charger detail: ', this.chargerDetail.connectors);
  }
}