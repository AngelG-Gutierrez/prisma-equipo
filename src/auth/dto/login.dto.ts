import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    required: true,
    description: 'Nombre de usuario registrado',
    example: 'Genaro69',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    required: true,
    description: 'Contraseña de acceso',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
