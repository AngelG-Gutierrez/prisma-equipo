import { PushNotificationsService } from './push-notifications.service';
import { PrismaService } from '../../core/databases/prisma.service';

describe('PushNotificationsService - Pruebas de push', () => {
    let service: PushNotificationsService;

    const mockPrisma = {
        notification: {
            create: jest.fn(),
            findMany: jest.fn(),
            updateMany: jest.fn(),
        },
        pushDevice: {
            findMany: jest.fn(),
            upsert: jest.fn(),
            updateMany: jest.fn(),
        },
    };

    const notificationPayload = {
        userId: 'paciente-prueba-123',
        type: 'APPOINTMENT_ASSIGNED' as const,
        title: 'Nueva cita programada',
        body: 'Tu fisioterapeuta te asignó una nueva cita.',
        referenceId: 'cita-prueba-456',
    };

    const savedNotification = {
        id: 'notificacion-prueba-789',
        ...notificationPayload,
        read: false,
        createdAt: new Date('2026-11-05T12:00:00Z'),
    };

    const device = {
        id: 'dispositivo-prueba',
        userId: 'paciente-prueba-123',
        token: 'ExpoPushToken[token-de-prueba]',
        platform: 'ios',
        active: true,
    };

    let fetchMock: jest.SpiedFunction<typeof fetch>;

    beforeEach(() => {
        jest.clearAllMocks();

        service = new PushNotificationsService(
            mockPrisma as unknown as PrismaService,
        );

        mockPrisma.notification.create.mockResolvedValue(savedNotification);

        mockPrisma.pushDevice.findMany.mockResolvedValue([device]);

        fetchMock = jest.spyOn(global, 'fetch');
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // ========================================================
    // PRUEBA 1: ENVÍO PUSH CORRECTO
    // ========================================================

    it('envía la push al dispositivo del paciente correcto', async () => {
        fetchMock.mockResolvedValue({
            ok: true,
            json: async () => ({
                data: {
                    status: 'ok',
                    id: 'ticket-expo-prueba',
                },
            }),
        } as Response);

        const result = await service.sendNotification(notificationPayload);

        expect(mockPrisma.notification.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                userId: notificationPayload.userId,
                type: 'APPOINTMENT_ASSIGNED',
                title: notificationPayload.title,
            }),
        });

        expect(mockPrisma.pushDevice.findMany).toHaveBeenCalledWith({
            where: {
                userId: notificationPayload.userId,
                active: true,
            },
        });

        expect(fetchMock).toHaveBeenCalledTimes(1);

        const [url, options] = fetchMock.mock.calls[0];

        expect(url).toBe('https://exp.host/--/api/v2/push/send');

        const body = JSON.parse(options?.body as string);

        expect(body.to).toBe(device.token);
        expect(body.title).toBe(notificationPayload.title);
        expect(body.body).toBe(notificationPayload.body);

        expect(body.data.type).toBe('APPOINTMENT_ASSIGNED');

        expect(result.id).toBe(savedNotification.id);
    });

    // ========================================================
    // PRUEBA 2: USUARIO SIN DISPOSITIVOS REGISTRADOS
    // ========================================================

    it('guarda la notificación aunque no haya dispositivos', async () => {
        mockPrisma.pushDevice.findMany.mockResolvedValue([]);

        const result = await service.sendNotification(notificationPayload);

        expect(mockPrisma.notification.create).toHaveBeenCalledTimes(1);

        expect(fetchMock).not.toHaveBeenCalled();

        expect(result.id).toBe(savedNotification.id);
    });

    // ========================================================
    // PRUEBA 3: EXPO RECHAZA LA SOLICITUD
    // ========================================================

    it('conserva la notificación si Expo rechaza el envío', async () => {
        fetchMock.mockResolvedValue({
            ok: true,
            json: async () => ({
                data: {
                    status: 'error',
                    message: 'DeviceNotRegistered',
                },
            }),
        } as Response);

        const result = await service.sendNotification(notificationPayload);

        expect(fetchMock).toHaveBeenCalledTimes(1);

        expect(mockPrisma.notification.create).toHaveBeenCalledTimes(1);

        expect(result.id).toBe(savedNotification.id);
    });

    // ========================================================
    // PRUEBA 4: HISTORIAL DEL USUARIO AUTENTICADO
    // ========================================================

    it('consulta las notificaciones de un usuario específico', async () => {
        mockPrisma.notification.findMany.mockResolvedValue([savedNotification]);

        await service.getNotifications('paciente-prueba-123');

        expect(mockPrisma.notification.findMany).toHaveBeenCalledWith({
            where: {
                userId: 'paciente-prueba-123',
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 50,
        });
    });

    // ========================================================
    // PRUEBA 5: MARCAR NOTIFICACIÓN COMO LEÍDA
    // ========================================================

    it('solo permite marcar notificaciones del usuario', async () => {
        mockPrisma.notification.updateMany.mockResolvedValue({
            count: 1,
        });

        await service.markAsRead('paciente-prueba-123', 'notificacion-prueba-789');

        expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
            where: {
                id: 'notificacion-prueba-789',
                userId: 'paciente-prueba-123',
            },
            data: {
                read: true,
            },
        });
    });
});
