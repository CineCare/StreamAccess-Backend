import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from '../mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MailerModule.forRoot({
          // transport: 'smtps://user@example.com:topsecret@smtp.example.com',
          // or
          transport: {
            host: 'mail.codevert.org',
            secure: false,
            auth: {
              user: 'cinecare@codevert.org',
              pass: 'secret',
            },
          },
          defaults: {
            from: '"No Reply - CineCare" <cinecare@codevert.org>',
          },
          template: {
            dir: join(__dirname, '../templates'),
            adapter: new HandlebarsAdapter(), // or new PugAdapter() or new EjsAdapter()
            options: {
              strict: true,
            },
          },
        }),
      ],
      providers: [MailService],
      exports: [MailService],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send a registration mail', async () => {
    expect(() =>
      service.sendRegistrationRequest(
        'backend unit tests',
        'cinecare@codevert.org',
      ),
    ).not.toThrow();
  });

  it('should send a validation mail', async () => {
    expect(() =>
      service.sendAccountValidation(
        'backend unit tests',
        'cinecare@codevert.org',
      ),
    ).not.toThrow();
  });

  it('should send a rejection mail', async () => {
    expect(() =>
      service.sendAccountRejection(
        'backend unit tests',
        'cinecare@codevert.org',
      ),
    ).not.toThrow();
  });
});
