import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { User } from './user.entity';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  const mockUserRepository = {
    create: jest.fn((dto) => dto),
    save: jest.fn((user) => Promise.resolve({ id: 'uuid', ...user })),
    find: jest.fn(() => Promise.resolve([{ id: 'uuid', first_name: 'John' }])),
    findOne: jest.fn(({ where: { id } }) =>
      id === 'uuid' ? Promise.resolve({ id, first_name: 'John' }) : Promise.resolve(null),
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const user = await service.create({ first_name: 'John' });
    expect(user).toEqual(expect.objectContaining({ first_name: 'John' }));
  });

  it('should return all users', async () => {
    const users = await service.findAll();
    expect(users.length).toBeGreaterThan(0);
  });

  it('should return one user by id', async () => {
    const user = await service.findOneById('uuid');
    expect(user.id).toBe('uuid');
  });

  it('should throw if user not found', async () => {
    await expect(service.findOneById('notfound')).rejects.toThrow('User not found');
  });
});
