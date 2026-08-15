import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

describe('AppointmentsController', () => {
  let controller: AppointmentsController;
  let service: AppointmentsService;

  // Mock del Servicio
  const mockAppointmentsService = {
    create: jest.fn(),
    cancel: jest.fn(),
    findAll: jest.fn(),
    findUpcomingByPatient: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentsController],
      providers: [
        {
          provide: AppointmentsService,
          useValue: mockAppointmentsService,
        },
      ],
    }).compile();

    controller = module.get<AppointmentsController>(AppointmentsController);
    service = module.get<AppointmentsService>(AppointmentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe llamar a appointmentsService.create con el userId del request y el DTO', async () => {
      const dto: CreateAppointmentDto = {
        date: new Date(Date.now() + 86400000).toISOString(),
        reason: 'Consulta médica',
      };
      const req = { user: { userId: 'patient-123' } };
      const expectedResult = { id: 'app-1', ...dto, status: 'activa' };

      mockAppointmentsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(req, dto);

      expect(service.create).toHaveBeenCalledWith('patient-123', dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('cancel', () => {
    it('debe llamar a appointmentsService.cancel con el userId y el appointmentId', async () => {
      const req = { user: { userId: 'patient-123' } };
      const appointmentId = 'app-1';
      const expectedResult = { id: appointmentId, status: 'cancelada' };

      mockAppointmentsService.cancel.mockResolvedValue(expectedResult);

      const result = await controller.cancel(req, appointmentId);

      expect(service.cancel).toHaveBeenCalledWith('patient-123', appointmentId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('debe llamar a appointmentsService.findAll y retornar las citas', async () => {
      const req = { user: { role: 'Administrador' } };
      const expectedResult = [{ id: 'app-1' }, { id: 'app-2' }];

      mockAppointmentsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(req);

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findUpcoming', () => {
    it('debe llamar a appointmentsService.findUpcomingByPatient con el userId del request', async () => {
      const req = { user: { userId: 'patient-123' } };
      const expectedResult = [{ id: 'app-1', status: 'activa' }];

      mockAppointmentsService.findUpcomingByPatient.mockResolvedValue(expectedResult);

      const result = await controller.findUpcoming(req);

      expect(service.findUpcomingByPatient).toHaveBeenCalledWith('patient-123');
      expect(result).toEqual(expectedResult);
    });
  });
});