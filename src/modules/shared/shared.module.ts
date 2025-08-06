// shared.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { TokenModule } from '../token/token.module';

@Module({
  imports: [
    ConfigModule,
    TokenModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('jwtSecret'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  exports: [JwtModule],
})
export class SharedModule {}
