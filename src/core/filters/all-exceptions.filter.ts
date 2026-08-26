import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';

    // si es un error que conoce nestJS, el sistema lo maneja de manera normal
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } 
    // por si es un error conocido por prisma
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // si existe un registro no encontrado, se devuelve un 404 con un mensaje bien para el cliente
      if (exception.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        message = 'El registro solicitado no fue encontrado en la base de datos.';
      } else {
        status = HttpStatus.BAD_REQUEST;
        message = `Error en la base de datos (Prisma Code: ${exception.code})`;
      }
    } 
    // este bloques es por si existe un error completamente desconosido
    else {
      // se registra el error real en la consola para poder arreglarlo
      this.logger.error(
        `Ruta: ${request.url} | Método: ${request.method} | Error: ${exception instanceof Error ? exception.message : exception}`,
        exception instanceof Error ? exception.stack : '',
      );
    }

    // aquí se crea la respuesta final que verá el frontend o postman
    const responseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: typeof message === 'object' && 'message' in message 
        ? (message as any).message 
        : message,
    };

    response.status(status).json(responseBody);
  }
}