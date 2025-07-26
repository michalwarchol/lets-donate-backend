import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { MailService } from '../mail/mail.service';
import { TokenType } from '../token/token.dto';
import { TokenService } from '../token/token.service';
import { User } from '../user/user.entity';

jest.mock('bcrypt', () => ({
  hash: jest.fn(() => Promise.resolve('hashed-password')),
  compare: jest.fn((plain, _hash) => Promise.resolve(plain === 'correct-password')),
}));

describe('AuthService', () => {
  let service: AuthService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn((dto) => dto),
    save: jest.fn((user) => Promise.resolve(user)),
  };

  const mockMailService = {
    sendEmail: jest.fn(() => Promise.resolve()),
  };

  const mockTokenService = {
    get: jest.fn(() => Promise.resolve('1')),
    set: jest.fn(() => Promise.resolve()),
    delete: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'ACCESS_SECRET',
          signOptions: { expiresIn: '15m' },
        }),
      ],
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should register user', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);
    const result = await service.register({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      password: 'Test1234!@',
      phone: '123456789',
    });
    expect(result.email).toBe('john@example.com');
    expect(mockMailService.sendEmail).toHaveBeenCalled();
    expect(mockTokenService.set).toHaveBeenCalled();
  });

  it('should not register existing user', async () => {
    mockUserRepository.findOne.mockResolvedValue({ id: 'uuid' });
    await expect(
      service.register({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'Test1234!@',
        phone: '123456789',
      }),
    ).rejects.toThrow('Email already used');
  });

  it('should login with correct credentials', async () => {
    const result = await service.login({ email: 'a@a.com', password: 'correct-password' });
    const decoded = new JwtService({ secret: 'ACCESS_SECRET' }).verify(result.access_token);

    expect(result).toHaveProperty('access_token');
    expect(typeof result.access_token).toBe('string');
    expect(decoded.sub).toBe('uuid');
  });

  it('should throw on login with wrong email', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);

    await expect(service.login({ email: 'wrong@example.com', password: 'any' })).rejects.toThrow(
      'Invalid credentials',
    );
  });

  it('should throw on login with wrong password', async () => {
    mockUserRepository.findOne.mockResolvedValue({
      id: '1',
      email: 'test@test.com',
      password: 'hashed-password',
    });

    await expect(
      service.login({ email: 'test@test.com', password: 'wrong-password' }),
    ).rejects.toThrow('Invalid credentials');
  });

  it('should logout user and blacklist token', async () => {
    const user = { id: '123' };

    const result = await service.logout(user.id);

    expect(result).toEqual({ message: 'Logged out successfully' });
    expect(mockTokenService.set).toHaveBeenCalledWith(expect.any(String), TokenType.Blacklist, '');
  });

  it('should confirm email with valid token', async () => {
    const user = { id: '1', email_verified: false };
    mockTokenService.get.mockResolvedValue('1');
    mockUserRepository.findOne.mockResolvedValue(user);

    const result = await service.confirmEmail('token');

    expect(result).toEqual({ message: 'Success' });
    expect(user.email_verified).toBe(true);
    expect(mockTokenService.delete).toHaveBeenCalledWith('token');
  });

  it('should throw on confirm email with invalid token', async () => {
    mockTokenService.get.mockResolvedValue(null);

    await expect(service.confirmEmail('invalid-token')).rejects.toThrow('Invalid or expired token');
  });

  it('should throw if user not found on confirmEmail', async () => {
    mockTokenService.get.mockResolvedValue('1');
    mockUserRepository.findOne.mockResolvedValue(null);

    await expect(service.confirmEmail('token')).rejects.toThrow('User not found');
  });

  it('should send reset link if user exists', async () => {
    mockUserRepository.findOne.mockResolvedValue({ id: '1', email: 'test@test.com' });

    const result = await service.forgotPassword({ email: 'test@test.com' });

    expect(result).toEqual({ message: 'Reset link sent' });
    expect(mockMailService.sendEmail).toHaveBeenCalled();
  });

  it('should return generic message if user not found during forgotPassword', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);

    const result = await service.forgotPassword({ email: 'notfound@test.com' });

    expect(result).toEqual({ message: 'Reset link sent if email exists' });
  });

  it('should reset password with valid token', async () => {
    const user = { id: '1', password: 'old', email: 'test@test.com' };
    mockTokenService.get.mockResolvedValue('1');
    mockUserRepository.findOne.mockResolvedValue(user);

    const result = await service.resetPassword({
      token: 'valid-token',
      newPassword: 'new-password',
    });

    expect(result).toEqual({ message: 'Password reset successful' });
    expect(mockTokenService.delete).toHaveBeenCalledWith('valid-token');
  });

  it('should throw on resetPassword with invalid token', async () => {
    mockTokenService.get.mockResolvedValue(null);

    await expect(
      service.resetPassword({
        token: 'invalid',
        newPassword: 'any',
      }),
    ).rejects.toThrow('Invalid or expired token');
  });

  it('should throw if user not found on resetPassword', async () => {
    mockTokenService.get.mockResolvedValue('1');
    mockUserRepository.findOne.mockResolvedValue(null);

    await expect(
      service.resetPassword({
        token: 'valid',
        newPassword: 'any',
      }),
    ).rejects.toThrow('User not found');
  });
});
