// home.component.ts
import { Component, OnInit } from '@angular/core';
import { ChargeStationService } from '../charge-station.service'; // Create this service to fetch charge station data
import { ChartData, ChartOptions, ChartType } from 'chart.js';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public pieChartOptions: ChartOptions = {
    responsive: true,
  };
  public pieChartLabels: string[] = ['Online', 'In Use', 'Offline'] as string[];
  public pieChartData: ChartData<'pie', number[], string> = {
    labels: this.pieChartLabels,
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: ['#36A2EB', '#FFCE56', '#FF6384'],
      },
    ],
  };
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  public pieChartPlugins = [];

  constructor(private chargeStationService: ChargeStationService) {}

  ngOnInit(): void {
    this.chargeStationService.getChargeStationStatus().subscribe((data) => {
      this.updateChartData(data);
    });
  }

  private updateChartData(data: any): void {
    const onlineCount = data.filter((station: any) => station.status === 'online').length;
    const inUseCount = data.filter((station: any) => station.status === 'inuse').length;
    const offlineCount = data.filter((station: any) => station.status === 'offline').length;

    this.pieChartData.datasets[0].data = [onlineCount, inUseCount, offlineCount];  }
}
