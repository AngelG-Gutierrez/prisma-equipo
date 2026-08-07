import { IsEmail, IsNotEmpty, IsOptional, IsString, IsDateString } from "class-validator";

export class CreateUserDto {
  @IsNotEmpty({ message: 'El email es obligatorio.' })
  @IsEmail({}, { message: 'El formato de correo no es válido.' })
  email: string;
  
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio.' })
  @IsString({ message: 'El nombre de usuario debe ser una cadena de texto.' })
  username: string;

  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  name: string;

  @IsNotEmpty({ message: 'La fecha de nacimiento es obligatoria.' })
  @IsDateString({}, { message: 'La fecha debe tener un formato válido (AAAA-MM-DD).' })
  birthDate: string;

  @IsOptional()
  @IsString({ message: 'La ruta de imagen debe ser una cadena de texto.' })
  image?: string;

  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  @IsString({ message: 'La contraseña debe ser una cadena de texto.' })
  password: string;
}