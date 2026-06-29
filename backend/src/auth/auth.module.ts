import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './user.entity';
import { MailService } from './mail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // Rejestrujemy encję User, by móc wstrzyknąć userRepository w AuthService
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' }, // Ważność tokenu (np. 1 dzień)
      }),
    }),
  ],
  providers: [AuthService, MailService],
  controllers: [AuthController],
})
export class AuthModule {}
