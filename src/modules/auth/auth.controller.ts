import { Controller, Post, Body, Get, Query, Req, UseGuards } from '@nestjs/common';

import { RegisterDto, LoginDto, ResetPasswordDto, ForgotPasswordDto } from './auth.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from '../../decorators/auth.guard';
import { User } from '../user/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto): Promise<User> {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto): Promise<{ access_token: string }> {
    return this.authService.login(dto);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  logout(@Req() req): Promise<{ message: string }> {
    return this.authService.logout(req.user.id);
  }

  @Get('confirm-email')
  confirmEmail(@Query('token') token: string): Promise<{ message: string }> {
    return this.authService.confirmEmail(token);
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto): Promise<{ message: string }> {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto): Promise<{ message: string }> {
    return this.authService.resetPassword(dto);
  }
}
