import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter } from 'events';

import { ChargePoint,Status } from './schemas/charge.point.schemas';
import { Transaction } from './schemas/transaction.schemas';

@Injectable()
export class OcppService {

  private readonly logger = new Logger('OcppManager');
  public heartbeatEvent = new EventEmitter();
  public transactionEvent = new EventEmitter();
  public meterValueEvent = new EventEmitter();


  constructor(
    @InjectModel(Transaction.name) private readonly transactionModel: Model<Transaction>,
    @InjectModel(ChargePoint.name) private readonly chargePointModel: Model<ChargePoint>,) {}

  @RabbitSubscribe({
    exchange: 'management.system',
    routingKey: 'heartbeat.routing.key',
    queue: 'heartbeat_queue',
  })
  public async handleHeartbeat(msg: {}, amqpMsg: ConsumeMessage) {
    this.logger.log(`Received heartbeat: ${JSON.stringify(msg)}`);
    this.heartbeatEvent.emit('heartbeat', msg);
  }
  
  @RabbitSubscribe({
    exchange: 'management.system',
    routingKey: 'transaction.routing.key',
    queue: 'transaction_queue',
  })
  public async handleTransaction(msg: {}, amqpMsg: ConsumeMessage) {
    this.logger.log(`Received transaction: ${JSON.stringify(msg)}`);
    this.transactionEvent.emit('transaction', msg);
  }

  @RabbitSubscribe({
    exchange: 'management.system',
    routingKey: 'charging.routing.key',
    queue: 'charging_queue',
  })
  public async handleCharging(msg: {}, amqpMsg: ConsumeMessage) {
    //this.logger.log(`Received charging: ${JSON.stringify(msg)}`);
  }

  async getAllChargePoints(): Promise<ChargePoint[]> {
    return this.chargePointModel.find().exec();
  }

  async getChargePoint(serial_number: string): Promise<ChargePoint> {
    return this.chargePointModel.findOne({ serial_number }).exec();
  }

  async getAvailableChargePoints(): Promise<ChargePoint[]> {
    return this.chargePointModel.find({ status: Status.Available }).exec();
  }

  async getOccupiedChargePoints(): Promise<ChargePoint[]> {
    return this.chargePointModel.find({ status: Status.Charging }).exec();
  }

  async getTransactions(): Promise<Transaction[]> {
    return this.transactionModel.find().exec();
  }

}