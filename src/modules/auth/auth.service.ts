import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { RegisterDto, LoginDto, ResetPasswordDto, ForgotPasswordDto } from './auth.dto';
import { MailService } from '../mail/mail.service';
import { TokenType } from '../token/token.dto';
import { TokenService } from '../token/token.service';
import { User } from '../user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private tokenService: TokenService,
    private jwtService: JwtService,
    private MailService: MailService,
  ) {}

  async register(dto: RegisterDto): Promise<User> {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new BadRequestException('Email already used');

    const hash = await bcrypt.hash(dto.password, 10);
    const user = await this.userRepo.save(this.userRepo.create({ ...dto, password: hash }));

    const token = uuidv4();
    await this.tokenService.set(token, TokenType.Email, user.id);

    await this.MailService.sendEmail(
      dto.email,
      'Confirm your email',
      `Click: http://localhost:3000/auth/confirm-email?token=${token}`,
    );

    return user;
  }

  async login(dto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
      select: ['id', 'email', 'password'],
    });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new BadRequestException('Invalid credentials');
    }
    const token = this.jwtService.sign({ sub: user.id });
    const refresh_token = uuidv4();
    await this.tokenService.set(refresh_token, TokenType.Refresh, user.id);

    return { access_token: token };
  }

  async logout(token: string): Promise<{ message: string }> {
    await this.tokenService.set(token, TokenType.Blacklist, '');

    return { message: 'Logged out successfully' };
  }

  async confirmEmail(token: string): Promise<{ message: string }> {
    const userId = await this.tokenService.get(token, TokenType.Email);
    if (!userId) throw new BadRequestException('Invalid or expired token');

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    user.email_verified = true;
    await this.userRepo.save(user);
    await this.tokenService.delete(token);

    return { message: 'Success' };
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) return { message: 'Reset link sent if email exists' };

    const token = uuidv4();
    await this.tokenService.set(token, TokenType.Reset, user.id);
    await this.MailService.sendEmail(
      dto.email,
      'Reset your password',
      `Reset link: http://localhost:3000/auth/reset-password?token=${token}`,
    );

    return { message: 'Reset link sent' };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const userId = await this.tokenService.get(dto.token, TokenType.Reset);
    if (!userId) throw new BadRequestException('Invalid or expired token');

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    user.password = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepo.save(user);
    await this.tokenService.delete(dto.token);

    return { message: 'Password reset successful' };
  }
}
