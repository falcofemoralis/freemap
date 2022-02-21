import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { FilesModule } from '../files/files.module';
import { FeatureType, FeatureTypeSchema } from './entities/feature-type.entity';
import { MapFeature, MapFeatureSchema } from './entities/map-feature.entity';
import { MapController } from './map.controller';
import { MapService } from './map.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: MapFeature.name, schema: MapFeatureSchema },
      { name: FeatureType.name, schema: FeatureTypeSchema },
    ]),
    FilesModule,
  ],
  controllers: [MapController],
  providers: [MapService],
})
export class MapModule {}
