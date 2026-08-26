import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { GetProjectUseCase } from './get-project.use-case';

describe('ProjectsController (Ejercicio 1)', () => {
  let controller: ProjectsController;
  let getProjectUseCase: GetProjectUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        {
          provide: GetProjectUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
    getProjectUseCase = module.get<GetProjectUseCase>(GetProjectUseCase);
  });

  it('Debe estar definido el controlador', () => {
    expect(controller).toBeDefined();
  });

  describe('findById', () => {
    it('Debe retornar la estructura del proyecto simulado cuando se consulta por id', async () => {
      const mockProject = { id: 1, name: 'Proyecto Sinergia' };
      jest.spyOn(getProjectUseCase, 'execute').mockResolvedValue(mockProject);

      const result = await controller.findById('1');

      expect(getProjectUseCase.execute).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockProject);
    });
  });
});