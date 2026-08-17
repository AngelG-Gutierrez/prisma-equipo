import { Test, TestingModule } from '@nestjs/testing';
import { MedicalRecordsController } from './medical-record.controller';
import { MedicalRecordService } from './medical-record.service';
import { UnauthorizedException } from '@nestjs/common';

describe('MedicalRecordsController (Pruebas Unitarias del Módulo)', () => {
  let controller: MedicalRecordsController;
  let service: MedicalRecordService;

  const mockService = {
    create: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedicalRecordsController],
      providers: [
        {
          provide: MedicalRecordService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<MedicalRecordsController>(MedicalRecordsController);
    service = module.get<MedicalRecordService>(MedicalRecordService);
  });

  it('Debe estar definido el controlador', () => {
    expect(controller).toBeDefined();
  });

  describe('create (Creación de Expediente)', () => {
    it('Debe permitir crear un expediente si el usuario es Administrador', async () => {
      const dto = { patientId: 'p-123', diagnosis: 'Sano', history: 'Ninguno', evolution: 'Favorable' };
      const req = { user: { role: 'Administrador' } };
      const expectedResult = { id: 'mr-1', ...dto };

      mockService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(dto as any, req);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });

    it('Debe lanzar UnauthorizedException si el usuario NO es Administrador', async () => {
      const dto = { patientId: 'p-123', diagnosis: 'Sano', history: 'Ninguno', evolution: 'Favorable' };
      const req = { user: { role: 'Paciente' } };

      await expect(controller.create(dto as any, req)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('update (Edición de Expediente)', () => {
    it('Debe permitir editar un expediente si el usuario es Administrador', async () => {
      const dto = { diagnosis: 'Diagnóstico actualizado' };
      const req = { user: { role: 'Administrador' } };
      const expectedResult = { id: 'mr-1', ...dto };

      mockService.update.mockResolvedValue(expectedResult);

      const result = await controller.update('mr-1', dto as any, req);

      expect(service.update).toHaveBeenCalledWith('mr-1', dto);
      expect(result).toEqual(expectedResult);
    });

    it('Debe lanzar UnauthorizedException al editar si el usuario NO es Administrador', async () => {
      const dto = { diagnosis: 'Intento de cambio' };
      const req = { user: { role: 'Medico' } };

      await expect(controller.update('mr-1', dto as any, req)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});