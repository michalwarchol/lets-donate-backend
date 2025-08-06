import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';

import { MailService } from './mail.service';

const sendMailMock = jest.fn();
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: sendMailMock,
  })),
}));

describe('MailService', () => {
  let service: MailService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'mail.user') return 'testuser@gmail.com';
      if (key === 'mail.pass') return 'testpass';

      return null;
    }),
  };

  beforeEach(async () => {
    sendMailMock.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call sendMail with correct params', async () => {
    sendMailMock.mockResolvedValue({});

    await service.sendEmail('recipient@example.com', 'Hello', 'Test message');

    expect(sendMailMock).toHaveBeenCalledWith({
      from: {
        name: "Let's donate",
        address: 'testuser@gmail.com',
      },
      to: ['recipient@example.com'],
      subject: 'Hello',
      text: 'Test message',
    });
  });

  it('should throw InternalServerErrorException if sendMail fails', async () => {
    sendMailMock.mockRejectedValue(new Error('SMTP error'));

    await expect(service.sendEmail('fail@example.com', 'Fail', 'Nope')).rejects.toThrow(
      InternalServerErrorException,
    );

    expect(sendMailMock).toHaveBeenCalled();
  });
});
