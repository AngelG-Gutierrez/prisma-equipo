import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../core/databases/prisma.service';

export type PushNotificationType =
    | 'APPOINTMENT_CREATED'
    | 'APPOINTMENT_ASSIGNED'
    | 'EXERCISE_PLAN_ASSIGNED';

interface NotificationPayload {
    userId: string;
    type: PushNotificationType;
    title: string;
    body: string;
    referenceId?: string;
}

@Injectable()
export class PushNotificationsService {
    private readonly logger = new Logger(PushNotificationsService.name);

    private readonly expoUrl = 'https://exp.host/--/api/v2/push/send';

    constructor(private readonly prisma: PrismaService) { }

    // Registrar un dispositivo del usuario
    async registerDevice(
        userId: string,
        token: string,
        platform: 'ios' | 'android',
    ) {
        if (
            !(
                token.startsWith('ExpoPushToken[') ||
                token.startsWith('ExponentPushToken[')
            ) ||
            !token.endsWith(']')
        ) {
            throw new Error('Token Expo inválido');
        }

        return this.prisma.pushDevice.upsert({
            where: { token },
            update: {
                userId,
                platform,
                active: true,
            },
            create: {
                userId,
                token,
                platform,
                active: true,
            },
        });
    }

    // Desactivar el dispositivo al cerrar sesión
    async deactivateDevice(userId: string, token: string) {
        return this.prisma.pushDevice.updateMany({
            where: { userId, token },
            data: { active: false },
        });
    }

    // Consultar el historial del usuario
    async getNotifications(userId: string) {
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }

    // Marcar una notificación propia como leída
    async markAsRead(userId: string, notificationId: string) {
        return this.prisma.notification.updateMany({
            where: {
                id: notificationId,
                userId,
            },
            data: { read: true },
        });
    }

    // Enviar aviso y guardarlo en el historial
    async sendNotification(payload: NotificationPayload) {
        const notification = await this.prisma.notification.create({
            data: {
                userId: payload.userId,
                type: payload.type,
                title: payload.title,
                body: payload.body,
                referenceId: payload.referenceId ?? null,
            },
        });

        const devices = await this.prisma.pushDevice.findMany({
            where: {
                userId: payload.userId,
                active: true,
            },
        });

        for (const device of devices) {
            try {
                const response = await fetch(this.expoUrl, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        to: device.token,
                        title: payload.title,
                        body: payload.body,
                        sound: 'default',
                        data: {
                            notificationId: notification.id,
                            type: payload.type,
                            referenceId: payload.referenceId ?? null,
                        },
                    }),
                });

                const result = await response.json();

                if (!response.ok || result?.data?.status !== 'ok') {
                    this.logger.warn(
                        `Expo rechazó la solicitud push: ${JSON.stringify(result)}`,
                    );
                } else {
                    this.logger.log(
                        `Solicitud push aceptada para usuario ${payload.userId}`,
                    );
                }
            } catch (error) {
                this.logger.error(
                    'Error enviando solicitud push',
                    error instanceof Error ? error.stack : String(error),
                );
            }
        }

        return notification;
    }
}
