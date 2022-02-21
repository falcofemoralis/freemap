import { BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

export default FileInterceptor('avatar', {
  storage: memoryStorage(),
  fileFilter: (request, file, cb) => {
    if (!file.mimetype.includes('image')) {
      return cb(new BadRequestException('Provide a valid file'), false);
    }
    cb(null, true);
  },
});
