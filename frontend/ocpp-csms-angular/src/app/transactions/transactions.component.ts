import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { SseService } from '../sse.service';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../config.service';

@Component({
  moduleId: module.id,
  selector: 'app-transaction',
  templateUrl: './transactions.component.html',
})
export class TransactionComponent implements OnInit{
  constructor(private _sseService: SseService,private http: HttpClient,private configService: ConfigService) {}
  displayedColumns: string[] = ['id', 'station','connector','user','start','end','kwh','status'];
  dataSource = new MatTableDataSource();
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  ngOnInit() {
    const apiUrl = this.configService.getApiUrl();
    this.dataSource.paginator = this.paginator!;
    //this.http.get(`${apiUrl}/transactions`)
  }
}