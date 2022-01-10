import { Module } from '@nestjs/common';
import { MapController } from './map.controller';
import { MapService } from './map.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MapData } from './entities/mapdata.entity';
import { ObjectType } from './entities/objectype.entity';
import { ObjectSubtype } from './entities/objectsubtype.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MapData, ObjectType, ObjectSubtype])],
  controllers: [MapController],
  providers: [MapService],
})
export class MapModule {}
