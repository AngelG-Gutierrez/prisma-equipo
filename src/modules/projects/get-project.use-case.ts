import { Injectable } from '@nestjs/common';

@Injectable()
export class GetProjectUseCase {
  async execute(id: number) {
    return { id, name: 'Proyecto Sinergia' };
  }
}