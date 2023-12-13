import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { SseService } from '../sse.service';

interface ChargeStation {
  id: string;
  model: string;
  status: string;
  location: string;
  lastActivity: Date;
}

@Component({
  moduleId: module.id,
  selector: 'app-stations',
  templateUrl: './stations.component.html',
})
export class StationsComponent implements OnInit{
  constructor(private _sseService: SseService) {}

  displayedColumns: string[] = ['id', 'model', 'status', 'location', 'lastActivity'];
  dataSource = new MatTableDataSource<ChargeStation>(ELEMENT_DATA);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

ngOnInit() {
  this._sseService.getServerSentEvent('http://localhost:4000/heartbeat').subscribe({
    next: event => {
      const data = JSON.parse(event.data);
      const index = this.dataSource.data.findIndex(station => station.id === data.id);
      if (index >= 0) {
        // Update the lastActivity of the station with the same id
        this.dataSource.data[index].lastActivity = new Date(data.lastActivity);
        this.dataSource._updateChangeSubscription(); // Refresh the table
      }
    },
    error: error => console.error(error)
  });
}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
}

const ELEMENT_DATA: ChargeStation[] = [

  {id: '1', model: 'Tesla Model S', status: 'Available', location: 'Paris', lastActivity: new Date()},
  {id: '2', model: 'Tesla Model 3', status: 'Charging', location: 'Paris', lastActivity: new Date()},
  {id: '3', model: 'Tesla Model X', status: 'Available', location: 'Paris', lastActivity: new Date()},
  {id: '4', model: 'Tesla Model Y', status: 'Charging', location: 'Paris', lastActivity: new Date()},
  {id: '5', model: 'Tesla Model S', status: 'Available', location: 'Paris', lastActivity: new Date()},
  {id: '6', model: 'Tesla Model 3', status: 'Charging', location: 'Paris', lastActivity: new Date()},
  {id: '7', model: 'Tesla Model X', status: 'Available', location: 'Paris', lastActivity: new Date()},
  {id: '8', model: 'Tesla Model Y', status: 'Charging', location: 'Paris', lastActivity: new Date()},
];