import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../config.service';
import { SseService } from '../sse.service';
import { Observable } from 'rxjs';

export enum ConnectorType {
  ACType1 = 'AC Type1',
  ACType2 = 'AC Type2',
  ACGT = 'AC GB/T',
  DCCSS = 'DC CSS',
  DCCSS2 = 'DC CSS 2',
  CHAdeMO = 'CHAdeMO',
  DCGT = 'DC GB/T'
}

export enum Status {
  Available = 'Available',
  Preparing = 'Preparing',
  Charging = 'Charging',
  SuspendedEVSE = 'SuspendedEVSE',
  SuspendedEV = 'SuspendedEV',
  Finishing = 'Finishing',
  Reserved = 'Reserved',
  Unavailable = 'Unavailable',
  Faulted = 'Faulted'
}

export interface Connector {
  type: ConnectorType;
  status: Status;
  startMeterValue?: number;
  currentMeterValue?: number;
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
  connectors: Connector[];
}

export interface MeterValueRequestDto {
  cpId: number;
  connectorId: number;
}

export interface MeterValueResponseDto {
  currentMeterValue: number;
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
    connectors_name: [] as ConnectorType[],
    connectors_status: [] as Status[],
    connectors: [] as Connector[]
  };
  
  constructor(private route: ActivatedRoute,private http: HttpClient, private configService: ConfigService, private _sseService: SseService) {}

  ngOnInit() {
    const apiUrl = this.configService.getApiUrl();
    const cpId = this.route.snapshot.paramMap.get('cp');
    this.http.get<CPDto>(`${apiUrl}/chargers/${cpId}`).subscribe(charger => {
      const connectorsNameArray = Object.values(charger.connectors).map(connector => connector.type);
      const connectorStatusArray = Object.values(charger.connectors).map(connector => connector.status);
      console.log('Connector Status Array:', connectorStatusArray);
      this.chargerDetail = {
        cpId: charger.cpId,
        description: charger.description,
        status: charger.status,
        manufacturer: charger.manufacturer,
        serial_number: charger.serial_number,
        connectors_name: connectorsNameArray,
        connectors_status: connectorStatusArray,
        connectors: charger.connectors
      };
    });
    setInterval(() => {
      this.chargerDetail.connectors.forEach((connector, index) => {
        if (connector.status === 'Charging') {
          this._sseService.getConnectorCurrentMeterValue(this.chargerDetail.cpId, index).subscribe(response => {
            connector.currentMeterValue = response.currentMeterValue;
          });
        }
      });
    }, 5000);
  }

  currentConnectorIndex = 0;

  previousConnector() {
    if (this.currentConnectorIndex > 0) {
      this.currentConnectorIndex--;
      console.log('Current Connector Index:', this.currentConnectorIndex);
    }
  }

  nextConnector() {
    if (this.currentConnectorIndex < this.chargerDetail.connectors_name.length - 1) {
      this.currentConnectorIndex++;
      console.log('Current Connector Index:', this.currentConnectorIndex);
    }
  }

  getConnectorStatusClass(index: number): string {
    const status = this.chargerDetail.connectors_status[index];
    
    switch (status) {
      case 'Available':
        return 'status-available';
      case 'Charging':
        return 'status-charging';
      case 'Unavailable':
      case 'Faulted':
        return 'status-unavailable';
      default:
        return ''; 
    }
  }

  getConnectorCurrentMeterValue(cpId: number, connectorId: number): Observable<MeterValueResponseDto> {
    return this.http.get<MeterValueResponseDto>(`${this.configService.getApiUrl()}/chargers/${cpId}/connectors/${connectorId}/meterValue`);
  }

}