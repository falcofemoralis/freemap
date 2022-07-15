import { Category, CategorySchema } from './entities/category.entity';
import { UsersModule } from './../users/users.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
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
      { name: Category.name, schema: CategorySchema },
    ]),
    FilesModule,
    UsersModule,
    HttpModule,
  ],
  controllers: [MapController],
  providers: [MapService],
})
export class MapModule {}
