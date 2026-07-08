import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: { 
            expiresIn: configService.get<string>('JWT_EXP') as any 
          },
        }),
      }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController]
})
export class AuthModule {}