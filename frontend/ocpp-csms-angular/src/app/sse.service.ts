import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SseService {
  constructor(private _zone: NgZone) {}

  getServerSentEvent(url: string): Observable<any> {

    const eventSource = new EventSource(url);

    return new Observable(observer => {
      console.log('eventSource: ', eventSource);
      
      eventSource.onmessage = event => {
        this._zone.run(() => {
          observer.next(event);
        });
      };

      eventSource.onerror = error => {
        this._zone.run(() => {
          observer.error(error);
        });
      };
    });
  }


}