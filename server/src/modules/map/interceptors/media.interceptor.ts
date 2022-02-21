import { BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

export const MEDIA_PATH = './uploads/media';

export default FilesInterceptor('files', 20, {
  storage: memoryStorage(),
  fileFilter: (request, file, cb) => {
    if (!file.mimetype.includes('image') && !file.mimetype.includes('video')) {
      return cb(new BadRequestException('Provide a valid file'), false);
    }
    cb(null, true);
  },
});
