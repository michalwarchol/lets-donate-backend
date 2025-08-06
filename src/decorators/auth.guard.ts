import {
  CanActivate,
  ExecutionContext,
  Inject,
  mixin,
  Type,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';

import { TokenType } from '../modules/token/token.dto';
import { Token } from '../modules/token/token.entity';

export const AuthGuard = (): Type<CanActivate> => {
  class AuthGuardMixin {
    constructor(
      private readonly jwtService: JwtService,
      @Inject(DataSource) private readonly dataSource: DataSource,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const auth = request.headers['authorization'];
      if (!auth) throw new UnauthorizedException();

      const token = auth.replace('Bearer ', '');
      try {
        if (!token) {
          throw new UnauthorizedException('Missing token');
        }
        const blacklisted = await this.dataSource.getRepository(Token).findOne({
          where: {
            token,
            type: TokenType.Blacklist,
          },
        });

        if (blacklisted) {
          throw new UnauthorizedException('Token has been blacklisted');
        }
        const payload = this.jwtService.verify(token);
        request.user = payload;

        return true;
      } catch {
        throw new UnauthorizedException();
      }
    }
  }

  return mixin(AuthGuardMixin);
};
