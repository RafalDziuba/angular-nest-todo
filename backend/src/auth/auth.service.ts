import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { MailService } from './mail.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const { email, password } = registerDto;

    // 1. Sprawdzenie, czy użytkownik już istnieje
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException(
        'Użytkownik o podanym adresie e-mail już istnieje.',
      );
    }

    // 2. Haszowanie hasła (sól o sile 10)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Generowanie unikalnego tokenu weryfikacyjnego oraz daty wygaśnięcia (24h)
    const verificationToken = crypto.randomUUID();
    const verificationTokenExpiresAt = new Date();
    verificationTokenExpiresAt.setHours(
      verificationTokenExpiresAt.getHours() + 24,
    );

    // 4. Zapis nowego użytkownika w bazie (z flagą isVerified = false i ważnością tokenu)
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiresAt,
      isVerified: false,
    });
    await this.userRepository.save(user);

    // 5. Wysyłka e-maila weryfikacyjnego
    await this.mailService.sendVerificationEmail(email, verificationToken);

    return {
      message:
        'Rejestracja pomyślna. Sprawdź swoją skrzynkę e-mail w celu weryfikacji konta.',
    };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    // 1. Szukamy użytkownika z pasującym tokenem
    const user = await this.userRepository.findOne({
      where: { verificationToken: token },
    });
    if (!user) {
      throw new BadRequestException(
        'Nieprawidłowy lub wygasły token weryfikacyjny.',
      );
    }

    // Sprawdzenie wygaśnięcia tokenu (24 godziny)
    if (
      user.verificationTokenExpiresAt &&
      user.verificationTokenExpiresAt < new Date()
    ) {
      throw new BadRequestException(
        'Token weryfikacyjny wygasł. Zarejestruj się ponownie lub poproś o nowy link.',
      );
    }

    // 2. Aktualizacja statusu użytkownika
    user.isVerified = true;
    user.verificationToken = null; // Token jest jednorazowy, więc go usuwamy
    user.verificationTokenExpiresAt = null;
    await this.userRepository.save(user);

    return {
      message: 'Konto zostało pomyślnie zweryfikowane. Możesz się zalogować.',
    };
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    const { email, password } = loginDto;

    // 1. Znajdź użytkownika po adresie e-mail
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Nieprawidłowy e-mail lub hasło.');
    }

    // 2. Sprawdź, czy konto jest zweryfikowane
    if (!user.isVerified) {
      throw new UnauthorizedException(
        'Konto nie zostało jeszcze zweryfikowane. Potwierdź swój e-mail.',
      );
    }

    // 3. Porównaj przesłane hasło z zahaszowanym hasłem w bazie
    const isPasswordValid = await bcrypt.compare(password, user.password || '');
    if (!isPasswordValid) {
      throw new UnauthorizedException('Nieprawidłowy e-mail lub hasło.');
    }

    // 4. Generowanie tokenu JWT (zapisujemy ID użytkownika i e-mail w ładunku tokenu)
    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken };
  }
}
