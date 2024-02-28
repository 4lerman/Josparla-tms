import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel } from 'amqplib';
import { EmailService } from '../email/email.service';
import { sendEmailI } from '../email/entities/email-user.entity';

@Injectable()
export class ConsumerService implements OnModuleInit {
  private channelWrapper: ChannelWrapper;
  private readonly logger = new Logger(ConsumerService.name);
  constructor(
    private emailService: EmailService,
    private configService: ConfigService,
  ) {
    const connection = amqp.connect([this.configService.get('QUEUE_URL')]);
    this.channelWrapper = connection.createChannel();
  }

  public async onModuleInit() {
    try {
      await this.channelWrapper.addSetup(async (channel: ConfirmChannel) => {
        await channel.assertQueue('emailQueue', { durable: true });
        await channel.consume('emailQueue', async (message) => {
          if (message) {
            const content: sendEmailI = JSON.parse(message.content.toString());
            this.logger.log(`Received message: ${content}`);
            await this.emailService.sendEmail(
              content.user,
              content.type,
              content.link,
            );
            channel.ack(message);
          }
        });
      });
      this.logger.log('Started and listening for messages');
    } catch (error) {
      this.logger.error('Error starting the consumer:', error);
    }
  }
}
