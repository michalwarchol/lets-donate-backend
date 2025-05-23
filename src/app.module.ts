import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

import configuration from './config/configuration';
import { User } from './modules/user/user.entity';
import { UserModule } from './modules/user/user.module';
import { isDev } from './utils/isDev';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) =>
        ({
          type: 'postgres',
          host: config.get('database.host'),
          port: config.get('database.port'),
          username: config.get('database.username'),
          password: config.get('database.password'),
          database: config.get('database.database'),
          entities: [User],
          autoLoadEntities: true,
          synchronize: isDev,
        }) as PostgresConnectionOptions,
    }),
    UserModule,
  ],
})
export class AppModule {}
