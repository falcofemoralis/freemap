import { Module } from '@nestjs/common';
import { MapController } from './map.controller';
import { MapService } from './map.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MapObject } from './entities/mapobject.entity';
import { GeometryType } from './entities/geometrytype.entity';
import { ObjectType } from './entities/objecttype.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MapObject, GeometryType, ObjectType]),
    AuthModule,
  ],
  controllers: [MapController],
  providers: [MapService],
})
export class MapModule {
}
