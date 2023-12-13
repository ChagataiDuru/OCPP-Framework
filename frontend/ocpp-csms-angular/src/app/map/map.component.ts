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
      chargers.forEach((charger: { latitude: number; longitude: number; }) => {
        this.addMarker(charger.latitude, charger.longitude);
      });
    });
  }
  mapOptions: google.maps.MapOptions = {
    center: { lat: 40.994016, lng: 29.121954 },
    zoom: 13,
    mapTypeControl: false,
  };

  markers: MarkerProperties[] = [
    { position: { lat: 40.994016, lng: 29.121954 }},
  ];

  handleMapInitialized(map: google.maps.Map) {
    this.markers.forEach((marker: MarkerProperties) => {
      new google.maps.Marker({
        position: marker.position,
        map,
      });
    });
  }

  addMarker(lat: number, lng: number) {
    this.markers.push({ position: { lat, lng }});
  }
}