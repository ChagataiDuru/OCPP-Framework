import { Injectable } from '@nestjs/common';
import { OcppClient } from '@extrawest/node-ts-ocpp';

@Injectable()
export class OcppService {
    constructor(
        private readonly MyOcppClient: OcppClient
      ) {}
    
    EstablishConnection() {
        this.MyOcppClient.connect('http://localhost:9220/ocpp/CP_1');
    }
}
