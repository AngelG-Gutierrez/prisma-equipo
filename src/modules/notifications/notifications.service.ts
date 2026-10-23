import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly mailerService: MailerService) {}

  /**
   * Procesa de forma asíncrona el envío de correos electrónicos.
   * @param {string} to - Dirección de correo electrónico del destinatario.
   * @param {string} subject - Asunto del correo.
   * @param {string} message - Cuerpo del mensaje en texto plano.
   * @returns {Promise<boolean>} Retorna true si el correo se entregó con éxito, o false si falló.
   */
  async sendEmail(
    to: string,
    subject: string,
    message: string,
  ): Promise<boolean> {
    try {
      this.logger.log(`Enviando correo asíncrono a: ${to}...`);

      await this.mailerService.sendMail({
        to: to,
        subject: subject,
        text: message,
      });

      this.logger.log(`¡Correo entregado con éxito a ${to}!`);
      return true;
    } catch (error) {
      this.logger.error(`Error enviando correo a ${to}:`, error);
      return false;
    }
  }
}
