import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { SseService } from '../sse.service';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../config.service';
import { ActivatedRoute } from '@angular/router';

interface Transaction {
  connectorId: string;
  idTag: string;
  meterStart: number;
  startTimestamp: string;
  transactionId: string;
  meterStop: number;
  stopTimestamp: string;
  stopReason: string;
}

@Component({
  moduleId: module.id,
  selector: 'app-transaction',
  templateUrl: './transactions.component.html',
})
export class TransactionComponent implements OnInit{
  transactions: Transaction[] = [];
  constructor(private route: ActivatedRoute,private http: HttpClient, private configService: ConfigService, private _sseService: SseService) {}
  ngOnInit() {
    const apiUrl = this.configService.getApiUrl();
    this.http.get<Transaction[]>(`${apiUrl}/transactions`).subscribe(data => {
      console.log(data);
      this.transactions = data;
    });
  }
}