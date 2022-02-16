import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Dropbox } from 'dropbox';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

export const DropboxProvider = {
  provide: 'DropboxService',
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    return new Dropbox({ accessToken: config.get('DROPBOX_TOKEN') });
  },
};

@Module({
  controllers: [FilesController],
  providers: [FilesService, DropboxProvider],
  exports: [FilesService],
})
export class FilesModule {}
