import { Module } from '@nestjs/common';
import { MapController } from './map.controller';
import { MapService } from './map.service';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeatureType } from './entities/feature-type.entity';
import { MapFeature } from './entities/map-feature.entity';
import { GeometryType } from './entities/geometry-type.entity';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([MapFeature, FeatureType, GeometryType])],
  controllers: [MapController],
  providers: [MapService],
})
export class MapModule {}
