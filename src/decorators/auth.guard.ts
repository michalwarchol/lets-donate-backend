import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const auth = request.headers['authorization'];
    if (!auth) throw new UnauthorizedException();

    const token = auth.replace('Bearer ', '');
    try {
      const payload = this.jwtService.verify(token);
      request.user = payload;

      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
