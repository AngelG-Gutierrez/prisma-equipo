import { Controller, Get, Param } from '@nestjs/common';
import { GetProjectUseCase } from './get-project.use-case';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly getProjectUseCase: GetProjectUseCase) {}

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.getProjectUseCase.execute(+id);
  }
}