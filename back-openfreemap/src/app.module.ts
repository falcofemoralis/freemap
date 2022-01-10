import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MapModule } from './modules/map/map.module';

@Module({
  imports: [TypeOrmModule.forRoot(), MapModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
