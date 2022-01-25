import { Module } from '@nestjs/common';
import { MapController } from './map.controller';
import { MapService } from './map.service';
import { AuthModule } from '../auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MapFeature, MapFeatureSchema } from './schemas/map-feature.schema';
import { GeometryType, GeometryTypeSchema } from './schemas/geometry-type.schema';
import { ObjectType, ObjectTypeSchema } from './schemas/object-type.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: MapFeature.name, schema: MapFeatureSchema },
      { name: GeometryType.name, schema: GeometryTypeSchema },
      { name: ObjectType.name, schema: ObjectTypeSchema },
    ]),
  ],
  controllers: [MapController],
  providers: [MapService],
})
export class MapModule {}
