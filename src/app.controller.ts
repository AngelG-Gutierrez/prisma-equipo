import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
<<<<<<< HEAD
import { ApiTags } from '@nestjs/swagger';
=======
import { Public } from './core/decorators/public.decorator';
>>>>>>> ccc5456b70603c683db94415f80c80490c9c99e2

@ApiTags("Aplicación")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
