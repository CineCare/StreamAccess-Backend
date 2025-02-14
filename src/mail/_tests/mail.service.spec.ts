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
              pass: 'Whitedog_hos44',
            },
          },
          defaults: {
            from: '"No Reply - CineCare" <cinecare@codevert.org>',
          },
          template: {
            dir: join(__dirname, 'templates'),
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
});
