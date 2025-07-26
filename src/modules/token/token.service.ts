import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TokenType } from './token.dto';
import { Token } from './token.entity';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private tokenRepo: Repository<Token>,
  ) {}

  async set(token: string, type: TokenType, value: string): Promise<boolean> {
    const newToken = this.tokenRepo.create({ token, type, value });
    try {
      await this.tokenRepo.save(newToken);

      return true;
    } catch {
      return false;
    }
  }

  async get(token: string, type: TokenType): Promise<string | null> {
    const foundToken = await this.tokenRepo.findOne({ where: { token, type } });

    if (!foundToken) {
      return null;
    }

    return foundToken.value;
  }

  async delete(token: string): Promise<boolean> {
    try {
      await this.tokenRepo.delete({ token });

      return true;
    } catch {
      return false;
    }
  }
}
