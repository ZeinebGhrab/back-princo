import {
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ImpressionNotificationGateway } from './impression-notification-gateway';
import { Model, Types } from 'mongoose';
import { Server } from 'socket.io';
import * as moment from 'moment';
import { User } from 'src/user/schemas/user.schema';
import { Connector } from 'src/connector/schemas/connector.schema';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class ImpressionService {
  constructor(
    private readonly notificationGateway: ImpressionNotificationGateway,
    private readonly notificationService: NotificationService,
    @Inject('CONNECTOR_MODEL')
    private readonly connectorModel: Model<Connector>,
    @Inject('USER_MODEL')
    private readonly userModel: Model<User>,
  ) {}

  async verifyAndNotify(apiKey: string, user: string, pdfBase64: string) {
    try {
      const checkConnector = await this.connectorModel.findOne({
        user,
        apiKey,
        isActive: true,
      });
      if (!checkConnector)
        throw new HttpException(
          'Connecteur est introuvable ou désactivé',
          HttpStatus.NOT_FOUND,
        );

      const checkUser = await this.userModel.findById(user);
      const date = new Date();
      let message = '';
      let status: string = 'sent';
      let save = false;

      if (checkUser.tickets === 0) {
        message = 'Crédit épuisé';
        status = 'credit_issue';
        save = true;
      } else if (!checkConnector.printerName) {
        message = 'Problème imprimante indisponible';
        status = 'printer_issue';
        save = true;
      } else {
        message = 'Impression déclenchée';
        await this.userModel.findByIdAndUpdate(user, { $inc: { tickets: -1 } });
      }

      await this.sendNotification(
        message,
        checkConnector._id,
        moment(date).format('YYYY-MM-DD HH:mm:ss'),
        status,
        save,
        checkConnector.printerName,
        user,
        status === 'sent' ? pdfBase64 : undefined,
      );
      if (!save) {
        return true;
      }
    } catch (error) {
      console.log(error);
      throw new Error(
        'Une erreur est survenue lors de la vérification et de la notification',
      );
    }
  }

  private async sendNotification(
    message: string,
    connectorId: Types.ObjectId,
    date: string,
    status: string,
    save: boolean,
    printerName: string,
    user: string,
    pdfBase64?: string,
  ): Promise<void> {
    try {
      const server: Server = this.notificationGateway.server;
      const connectedSockets = server.of('/').sockets.size;
      const notification = {
        connectorId,
        date,
        message,
        printerName,
        impression: !save,
        pdfBase64,
      };

      if (connectedSockets === 0) {
        server.emit('notification', 'Problème Connexion Internet');
        await this.notificationService.createNotification({
          date,
          message: 'Problème Connexion Internet',
          status: 'internet_issue',
          user,
          connector: connectorId,
        });
        notification.impression = false;
      } else {
        if (save) {
          await this.notificationService.createNotification({
            date,
            message,
            status,
            connector: connectorId,
            user,
          });
        }
        server.emit('notification', notification);
      }
    } catch (error) {
      console.log(error);
      throw new Error(
        "Une erreur est survenue lors de l'envoi de la notification",
      );
    }
  }

  async integrationService(user: string, pdf: string, apiKey?: string) {
    if (apiKey) {
      const connector = await this.connectorModel.findOne({ apiKey, user });
      if (!connector) {
        throw new ConflictException("L'API Key est introuvable ou incorrecte");
      }
    }
    const documentation = `
      api_key = 'Entrez l'API Key spécifiée pour le connecteur désiré afin d'effectuer l'impression.'
      pdf = 'Entrez votre ticket à imprimer décodé selon le format Base64.'
      // Mettez votre API Key, ticket et userId dans le corps de la requête
      body:
      {
        "apiKey": ${apiKey ? apiKey : 'api_key'}, 
        "userId": ${user},
        "pdf": ${pdf},
      }
      // URL de vérification
      url: '${process.env.SERVER_URL}/impression'
      method: POST
    `;
    return documentation;
  }
}
