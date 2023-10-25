import { Injectable } from '@nestjs/common';
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { ManagementSystemTransactionEvent } from './dtos/management-system-transaction-event.dto';
import { OcppService as OcppLegacy } from './ocpp.service';

@Injectable()
export class RabbitMQConsumerService {
  constructor(
    private readonly chargePointService: OcppLegacy,
    private readonly amqpConnection: AmqpConnection
  ) {}

  @RabbitSubscribe({
    exchange: 'management-system',
    routingKey: 'transaction.event.#',
  })
  async handleTransactionEvent(event: ManagementSystemTransactionEvent) {
    const chargePointId = event.chargePointId;
    const transactionId = event.transactionId;
    const status = event.status;

    await this.chargePointService.updateTransactionStatus(
      chargePointId,
      transactionId,
      status,
    );
  }
}
