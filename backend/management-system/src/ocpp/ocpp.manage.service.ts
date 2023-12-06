import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';
import { ChargePoint } from './schemas/charge.point.schemas';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class OcppService {

  private readonly logger = new Logger('OcppManager');

  constructor(@InjectModel(ChargePoint.name) private readonly chargePointModel: Model<ChargePoint>,) {}

  @RabbitSubscribe({
    exchange: 'management.system',
    routingKey: 'heartbeat.routing.key',
    queue: 'heartbeat_queue',
  })
  public async handleHeartbeat(msg: {},amqpMsg: ConsumeMessage) {
    this.logger.log(`Received heartbeat: ${JSON.stringify(msg)}`);
  }
  
  async getAllChargePoints(): Promise<ChargePoint[]> {
    return this.chargePointModel.find().exec();
  }

}