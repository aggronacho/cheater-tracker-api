import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clan } from './entities/clan.entity';
import { Alias } from './entities/alias.entity';
import { Cheater } from './entities/cheater.entity';
import { CheaterService } from './services/cheater.service';
import { CheaterController } from './controllers/cheater.controller';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    TypeOrmModule.forFeature([Cheater, Alias, Clan]),
  ],
  controllers: [CheaterController],
  providers: [CheaterService],
})
export class CheaterModule {}
