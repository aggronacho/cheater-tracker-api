import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { CheaterModule } from './cheater/cheater.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbUsername = configService.get<string>('dbUsername');
        const dbPassword = configService.get<string>('dbPassword');
        const dbPort = parseInt(configService.get<string>('dbPort'));
        const dbName = configService.get<string>('dbName');
        const dbServer = configService.get<string>('dbServer');

        return {
          port: dbPort,
          type: 'mysql',
          username: dbUsername,
          password: dbPassword,
          database: dbName,
          host: dbServer,
          synchronize: true,
          autoLoadEntities: true,
        };
      },
    }),
    CheaterModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
