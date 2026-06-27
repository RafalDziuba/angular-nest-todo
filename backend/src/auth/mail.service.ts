import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('MAIL_HOST');
    const port = this.configService.get<number>('MAIL_PORT');
    const user = this.configService.get<string>('MAIL_USER');
    const pass = this.configService.get<string>('MAIL_PASS');
    const secure = this.configService.get<boolean>('MAIL_SECURE', false);

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(port),
        secure: String(secure) === 'true',
        auth: { user, pass },
      });
      this.logger.log(
        'Zainicjalizowano produkcyjny transporter e-mail (SMTP).',
      );
    } else {
      this.logger.log(
        'Brak pełnej konfiguracji SMTP w .env (wymagane: MAIL_HOST, MAIL_USER, MAIL_PASS). Tworzenie testowego konta Ethereal...',
      );
      // Utworzenie testowego konta Ethereal w celach deweloperskich
      nodemailer.createTestAccount().then((account) => {
        this.transporter = nodemailer.createTransport({
          host: account.smtp.host,
          port: account.smtp.port,
          secure: account.smtp.secure,
          auth: {
            user: account.user,
            pass: account.pass,
          },
        });
        this.logger.log('Utworzono testowe konto e-mail (Ethereal).');
      });
    }
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    // Czekamy na zainicjalizowanie transportera, jeśli aplikacja wywoła to tuż po starcie
    if (!this.transporter) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    if (!this.transporter) {
      this.logger.error(
        'Transporter poczty nie został jeszcze zainicjalizowany.',
      );
      return;
    }

    const url = `http://localhost:3000/auth/verify?token=${token}`;

    const mailOptions = {
      from: '"System Uwierzytelniania" <no-reply@todoapp.com>',
      to: email,
      subject: 'Potwierdź swój adres e-mail',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333;">Witaj!</h2>
          <p>Dziękujemy za rejestrację w aplikacji To-Do. Kliknij w poniższy link, aby aktywować swoje konto:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${url}" style="padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Potwierdź adres e-mail</a>
          </div>
          <p style="color: #666; font-size: 12px;">Jeśli przycisk nie działa, skopiuj poniższy adres do przeglądarki:</p>
          <p style="color: #4f46e5; word-break: break-all; font-size: 14px;">${url}</p>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Wiadomość weryfikacyjna wysłana do: ${email}`);
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        this.logger.log(`Podgląd wiadomości e-mail (Ethereal): ${previewUrl}`);
      }
    } catch (error) {
      this.logger.error(
        'Błąd podczas wysyłania e-maila weryfikacyjnego:',
        error,
      );
    }
  }
}
