import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';
import { ChargePoint } from './schemas/charge.point.schemas';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter } from 'events';

@Injectable()
export class OcppService {

  private readonly logger = new Logger('OcppManager');
  public heartbeatEvent = new EventEmitter();


  constructor(@InjectModel(ChargePoint.name) private readonly chargePointModel: Model<ChargePoint>,) {}

  @RabbitSubscribe({
    exchange: 'management.system',
    routingKey: 'heartbeat.routing.key',
    queue: 'heartbeat_queue',
  })
  public async handleHeartbeat(msg: {}, amqpMsg: ConsumeMessage) {
    this.logger.log(`Received heartbeat: ${JSON.stringify(msg)}`);
    this.heartbeatEvent.emit('heartbeat', msg);
  }

  async getAllChargePoints(): Promise<ChargePoint[]> {
    return this.chargePointModel.find().exec();
  }

  async getChargePoint(serial_number: string): Promise<ChargePoint> {
    return this.chargePointModel.findOne({ serial_number }).exec();
  }

  async getAvailableChargePoints(): Promise<ChargePoint[]> {
    return this.chargePointModel.find({ status: 'available' }).exec();
  }

}