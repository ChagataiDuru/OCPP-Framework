import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { SseService } from '../sse.service';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../config.service';

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

interface ChargeStationUI {
  id: string;
  model: string;
  serial_number: string;
  status: Status;
  lastActivity: Date;
}

interface ChargeStation {
  cpId: number;
  description: string;
  serial_number: string;
  status: Status;
  lastActivity: Date;
}

@Component({
  moduleId: module.id,
  selector: 'app-stations',
  templateUrl: './stations.component.html',
})
export class StationsComponent implements OnInit{
  constructor(private _sseService: SseService,private http: HttpClient,private configService: ConfigService) {}

  displayedColumns: string[] = ['id', 'model', 'serial_number', 'status', 'lastActivity'];
  dataSource = new MatTableDataSource<ChargeStationUI>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit() {
  const apiUrl = this.configService.getApiUrl();
  this.http.get<ChargeStation[]>(`${apiUrl}/chargers`).subscribe(chargeStations => {
    chargeStations.sort((a, b) => a.cpId - b.cpId);
    this.dataSource.data = chargeStations.map(station => ({
      id: station.cpId.toString(),
      model: station.description,
      serial_number: station.serial_number,
      status: station.status,
      lastActivity: station.lastActivity
    }));
  });

  this._sseService.getServerSentEvent(`${apiUrl}/heartbeat`).subscribe({
    next: event => {
      const data = JSON.parse(event.data);
      console.log('Received event: ', data);
      console.log('Data ID: ', data.id.toString());
      const index = this.dataSource.data.findIndex(station => station.id === data.charger.cpId.toString());
      console.log('Index: ', index);
      if (index >= 0) {
        this.dataSource.data[index].lastActivity = new Date(data.lastActivity);
        this.dataSource._updateChangeSubscription(); // <-- Refresh the datasource
      }
    },
    error: error => console.error(error)
  });
}

getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'unavailable':
      return 'red';
    case 'available':
      return 'green';
    case 'charging':
      return 'yellow';
    default:
      return '';
  }
 }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}