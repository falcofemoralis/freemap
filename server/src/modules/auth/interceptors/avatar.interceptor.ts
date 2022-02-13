import { FileInterceptor } from '@nestjs/platform-express';
import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import * as Path from 'path';

export const AVATAR_PATH = './uploads/avatars';

export default FileInterceptor('avatar', {
  storage: diskStorage({
    destination: AVATAR_PATH,
    filename: (req, file, cb) => {
      if (file) {
        cb(null, req.body.username + Path.extname(file.originalname));
      }
    },
  }),
  fileFilter: (request, file, cb) => {
    if (!file.mimetype.includes('image')) {
      return cb(new BadRequestException('Provide a valid image'), false);
    }
    cb(null, true);
  },
});
