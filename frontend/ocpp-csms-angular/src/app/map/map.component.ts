import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { GoogleMap } from '@angular/google-maps';
import { Observable } from 'rxjs';
import { ConfigService } from '../config.service';

interface MarkerProperties {
  position: {
    lat: number;
    lng: number;
  }
  serial_number: string;
};

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
})
export class MapComponent {
  constructor(private http: HttpClient,private configService: ConfigService) {}
  @ViewChild('myGoogleMap', { static: true }) map!: GoogleMap;

  ngOnInit() {
    const apiUrl = this.configService.getApiUrl();
    this.http.get<any[]>(`${apiUrl}/chargers`).subscribe(chargers => {
      chargers.forEach((charger: { latitude: number; longitude: number; serialNumber: string;}) => {
        this.addMarker(charger.latitude, charger.longitude, charger.serialNumber);
      });
    });
  }
  mapOptions: google.maps.MapOptions = {
    center: { lat: 40.994016, lng: 29.121954 },
    zoom: 13,
    mapTypeControl: false,
  };

  markers: MarkerProperties[] = [];

  handleMapInitialized(map: google.maps.Map) {
    this.markers.forEach((marker: MarkerProperties) => {
      console.log(marker.position);
      new google.maps.Marker({
        position: marker.position,
        map,
      }).addListener('click', () => {
        console.log(marker.serial_number);
        window.location.href = '/detail/'+marker.serial_number;
    });
  });
  }

  addMarker(lat: number, lng: number, serialNumber: string) {
    this.markers.push({ position: { lat, lng }, serial_number: serialNumber});
  }
}