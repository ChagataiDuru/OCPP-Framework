import { Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQClient {
  private readonly url = 'amqp://localhost';

  async sendMessage(queue: string, message: string): Promise<string> {
    const connection = await amqp.connect(this.url);
    const channel = await connection.createChannel();

    const replyQueue = await channel.assertQueue('', { exclusive: true });

    const correlationId = Math.random().toString() + Math.random().toString();

    channel.sendToQueue(queue, Buffer.from(message), {
      correlationId,
      replyTo: replyQueue.queue,
    });

    return new Promise((resolve) => {
      channel.consume(
        replyQueue.queue,
        (msg) => {
          if (msg.properties.correlationId === correlationId) {
            resolve(msg.content.toString());
            connection.close();
          }
        },
        { noAck: true },
      );
    });
  }
}