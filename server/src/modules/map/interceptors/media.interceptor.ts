import { BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage, memoryStorage } from 'multer';
import * as Path from 'path';
import { v4 } from 'uuid';
import * as fs from 'fs';

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

// export default FilesInterceptor('files', 20, {
//   storage: diskStorage({
//     destination: async (req, file, cb) => {
//       const path = Path.join(MEDIA_PATH, req.params.id);
//       if (!fs.existsSync(path)) {
//         fs.mkdirSync(path, { recursive: true });
//       }

//       console.log(file);

//       cb(null, path);
//     },
//     filename: (req, file, cb) => {
//       const fileName: string = v4() + Path.extname(file.originalname);

//       cb(null, fileName);
//     },
//   }),
//   fileFilter: (request, file, cb) => {
//     if (!file.mimetype.includes('image') && !file.mimetype.includes('video')) {
//       return cb(new BadRequestException('Provide a valid file'), false);
//     }
//     cb(null, true);
//   },
// });
