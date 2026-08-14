import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { AppointmentsCronService } from './cron/appointments-cron.service';

describe('AppointmentsController', () => {
  let controller: AppointmentsController;
  let service: AppointmentsService;

  // Simular los servicios que inyecta el controlador
  const mockAppointmentsService = {
    create: jest.fn(),
    cancel: jest.fn(),
    findAll: jest.fn(),
    findUpcomingByPatient: jest.fn(),
  };

  const mockAppointmentsCronService = {
    handleAppointmentReminders: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentsController],
      providers: [
        {
          provide: AppointmentsService,
          useValue: mockAppointmentsService,
        },
        {
          provide: AppointmentsCronService,
          useValue: mockAppointmentsCronService,
        },
      ],
    }).compile();

    controller = module.get<AppointmentsController>(AppointmentsController);
    service = module.get<AppointmentsService>(AppointmentsService);
  });

  // Limpiar los mocks después de cada prueba
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('Interacción entre controlador y servicio', () => {
    
    it('Debe crear una cita correctamente', async () => {
      const mockPatientId = 'paciente-123';
      const req = { user: { userId: mockPatientId } };
      const dto = { date: '2026-09-01T10:00:00Z', reason: 'Consulta general' };
      
      const expectedResult = { id: 'cita-1', ...dto, status: 'activa' };
      
      // Simular la respuesta del servicio
      mockAppointmentsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(req, dto);

      expect(result).toEqual(expectedResult);
      // Verificar que el controlador llame al servicio con los datos correctos
      expect(mockAppointmentsService.create).toHaveBeenCalledWith(mockPatientId, dto);
    });

    it('Debe cancelar una cita', async () => {
      const mockPatientId = 'paciente-123';
      const mockAppointmentId = 'cita-1';
      const req = { user: { userId: mockPatientId } };
      
      const expectedResult = { id: mockAppointmentId, status: 'cancelada' };
      
      mockAppointmentsService.cancel.mockResolvedValue(expectedResult);

      const result = await controller.cancel(req, mockAppointmentId);

      expect(result).toEqual(expectedResult);
      expect(mockAppointmentsService.cancel).toHaveBeenCalledWith(mockPatientId, mockAppointmentId);
    });

    it('Debe obtener las citas próximas del paciente', async () => {
      const mockPatientId = 'paciente-123';
      const req = { user: { userId: mockPatientId } };
      const expectedResult = [{ id: 'cita-1', status: 'activa' }];
      
      mockAppointmentsService.findUpcomingByPatient.mockResolvedValue(expectedResult);

      const result = await controller.findUpcoming(req);

      expect(result).toEqual(expectedResult);
      expect(mockAppointmentsService.findUpcomingByPatient).toHaveBeenCalledWith(mockPatientId);
    });
  });
});