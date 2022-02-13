import { Module } from '@nestjs/common';
import { MapController } from './map.controller';
import { MapService } from './map.service';
import { AuthModule } from '../auth/auth.module';
import { FeatureType, FeatureTypeSchema } from './entities/feature-type.entity';
import { MapFeature, MapFeatureSchema } from './entities/map-feature.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: MapFeature.name, schema: MapFeatureSchema },
      { name: FeatureType.name, schema: FeatureTypeSchema },
    ]),
  ],
  controllers: [MapController],
  providers: [MapService],
})
export class MapModule {}
