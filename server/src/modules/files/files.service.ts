import { Inject, Injectable } from '@nestjs/common';
import { Dropbox } from 'dropbox';
import * as Path from 'path';
import { v4 } from 'uuid';

@Injectable()
export class FilesService {
  constructor(@Inject('DropboxService') private readonly dbx: Dropbox) {}

  async saveFiles(files: Array<Express.Multer.File>, subfolder?: string): Promise<string[]> {
    const uploadedFiles: string[] = [];
    for (const file of files) {
      try {
        const fileName = v4() + Path.extname(file.originalname);
        const res = await this.dbx.filesUpload({
          path: `/${subfolder ? `${subfolder}/` : ''}${fileName}`,
          contents: file.buffer,
        });
        console.log(res.status);

        uploadedFiles.push(fileName);
      } catch (e: any) {
        // delete uploaded files;
        throw e;
        // console.log(e);
      }
    }

    return uploadedFiles;
  }

  async getFiles(filenames: string[], subfolder?: string): Promise<string[]> {
    const links: string[] = [];

    for (const name of filenames) {
      try {
        const { result } = await this.dbx.filesGetTemporaryLink({
          path: `/${subfolder ? `${subfolder}/` : ''}${name}`,
        });

        links.push(result.link);
      } catch (e: any) {
        //console.log(e);
        throw e;
      }
    }
    return links;
  }
}
