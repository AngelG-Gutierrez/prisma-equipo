import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendNotificationDto {
  @ApiProperty({
    required: true,
    description: 'Dirección de correo electrónico del destinatario',
    example: 'genaroutv@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  to: string;

  @ApiProperty({
    required: true,
    description: 'Asunto principal del correo',
    example: 'Prueba de Integración Sinergia',
  })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiPropertyOptional({
    description: 'Cuerpo del mensaje en texto plano.',
  })
  @IsString()
  @IsOptional()
  body?: string;
}
