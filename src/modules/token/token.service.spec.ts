import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { TokenType } from './token.dto';
import { Token } from './token.entity';
import { TokenService } from './token.service';

describe('TokenService', () => {
  let service: TokenService;

  const mockTokenRepository = {
    create: jest.fn((dto) => dto),
    save: jest.fn((tokenEntity) => Promise.resolve({ id: 'uuid', ...tokenEntity })),
    findOne: jest.fn(({ where: { token, type } }) =>
      token === 'token' && type === TokenType.Email
        ? Promise.resolve({
            id: 'uuid',
            token,
            type,
            value: 'user-id',
            created_at: '2004-10-19 10:23:54',
          })
        : Promise.resolve(null),
    ),
    delete: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: getRepositoryToken(Token),
          useValue: mockTokenRepository,
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should set token', async () => {
    const result = await service.set('token', TokenType.Email, 'user-id');
    expect(result).toBe(true);
  });

  it('should get token value', async () => {
    const result = await service.get('token', TokenType.Email);
    expect(result).toBe('user-id');
  });

  it('should not find row with given token', async () => {
    const result = await service.get('wrong token', TokenType.Email);
    expect(result).toBe(null);
  });

  it('should not find row with given token type', async () => {
    const result = await service.get('token', TokenType.Refresh);
    expect(result).toBe(null);
  });

  it('should delete token', async () => {
    const result = await service.delete('token');
    expect(result).toBe(true);
  });
});
