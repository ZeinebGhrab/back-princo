import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ImpressionNotificationGateway } from './impression-notification-gateway';
import { Model, Types } from 'mongoose';
import { Server, Socket } from 'socket.io';
import * as moment from 'moment';
import { User } from 'src/user/schemas/user.schema';
import { Connector } from 'src/connector/schemas/connector.schema';
import { NotificationService } from 'src/notification/notification.service';
import { PendingFilesService } from './../pending-files/pending-files.service';

@Injectable()
export class ImpressionService {
  constructor(
    private readonly notificationGateway: ImpressionNotificationGateway,
    private readonly notificationService: NotificationService,
    private readonly pendingFilesService: PendingFilesService,
    @Inject('CONNECTOR_MODEL')
    private readonly connectorModel: Model<Connector>,
    @Inject('USER_MODEL')
    private readonly userModel: Model<User>,
  ) {}

  private desktopAppConnections: Map<string, boolean> = new Map();

  onModuleInit() {
    const server: Server = this.notificationGateway.server;
    server.on('connection', (client: Socket) => {
      client.on('desktopAppConnected', (userId: string) => {
        this.desktopAppConnections.set(userId, true);
      });

      client.on('desktopAppDisconnected', (userId: string) => {
        if (this.desktopAppConnections.get(userId)) {
          this.desktopAppConnections.set(userId, false);
        }
      });
    });
  }

  async verifyAndNotify(apiKey: string, user: string, pdfBase64: string) {
    try {
      const checkConnector = await this.connectorModel.findOne({
        user,
        apiKey,
        isActive: true,
      });
      if (!checkConnector)
        throw new UnauthorizedException(
          'Connecteur est introuvable ou désactivé',
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
      throw new UnauthorizedException(
        'Une erreur est survenue lors de la vérification et de la notification',
      );
    }
  }

  async sendNotification(
    message: string,
    connector: Types.ObjectId,
    date: string,
    status: string,
    save: boolean,
    printerName: string,
    user: string,
    pdfBase64?: string,
  ): Promise<void | boolean> {
    try {
      const server: Server = this.notificationGateway.server;
      const connectedSockets = server.of('/').sockets.size;

      if (connectedSockets === 0) {
        await this.handleInternetIssue(date, user, connector);
        return false;
      }
      const notification = {
        connector,
        date,
        message,
        printerName,
        impression: !save,
        pdfBase64,
      };

      if (save) {
        await this.notificationService.createNotification({
          date,
          message,
          status,
          connector,
          user,
        });
      }

      if (!save && !this.desktopAppConnections.get(user)) {
        await this.pendingFilesService.createPendingFiles(
          user,
          connector,
          pdfBase64,
        );
      }

      if (this.desktopAppConnections.get(user)) {
        server.emit('notification', notification);
      }

      return true;
    } catch (error) {
      console.log(error);
      throw new Error(
        "Une erreur est survenue lors de l'envoi de la notification",
      );
    }
  }

  private async handleInternetIssue(
    date: string,
    user: string,
    connector: Types.ObjectId,
  ): Promise<void> {
    const server: Server = this.notificationGateway.server;
    server.emit('notification', 'Problème Connexion Internet');
    await this.notificationService.createNotification({
      date,
      message: 'Problème Connexion Internet',
      status: 'internet_issue',
      user,
      connector,
    });
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
