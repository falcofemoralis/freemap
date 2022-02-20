import { Inject, Injectable } from '@nestjs/common';
import { Dropbox } from 'dropbox';
import * as sharp from 'sharp';
import { v4 } from 'uuid';

const THUMBNAIL = '_thumbnail';
const EXT = '.jpg';

export interface FileUploadOptions {
  subfolder?: string;
  maxWidth?: number;
  previewMaxWidth?: number;
}

@Injectable()
export class FilesService {
  constructor(@Inject('DropboxService') private readonly dbx: Dropbox) {}

  async saveFiles(files: Array<Express.Multer.File>, options?: FileUploadOptions): Promise<string[]> {
    const uploadedFiles: string[] = [];
    for (const file of files) {
      try {
        const fileName = v4();
        await this.uploadFile(file.buffer, fileName, options);
        await this.uploadPreview(file.buffer, fileName, options);

        uploadedFiles.push(fileName);
      } catch (e: any) {
        // delete uploaded files;
        throw e;
        // console.log(e);
      }
    }

    return uploadedFiles;
  }

  private async uploadFile(data: Buffer, fileName: string, options?: FileUploadOptions): Promise<number> {
    const image = await sharp(data)
      .jpeg({ mozjpeg: true, quality: 90 })
      .resize({ width: options.maxWidth ?? 1000, withoutEnlargement: true })
      .toBuffer();
    const res = await this.dbx.filesUpload({
      path: `/${options?.subfolder ? `${options.subfolder}/` : ''}${fileName}${EXT}`,
      contents: image.buffer,
    });

    return res.status;
  }

  private async uploadPreview(data: Buffer, fileName: string, options?: FileUploadOptions): Promise<number> {
    const thumbnail = await sharp(data)
      .jpeg({ mozjpeg: true, quality: 70 })
      .resize({ width: options.previewMaxWidth ?? 420, withoutEnlargement: true })
      .toBuffer();
    const res = await this.dbx.filesUpload({
      path: `/${options?.subfolder ? `${options.subfolder}/` : ''}${fileName}${THUMBNAIL}${EXT}`,
      contents: thumbnail.buffer,
    });

    return res.status;
  }

  async getFiles(filenames: string[], subfolder?: string): Promise<string[]> {
    const links: string[] = [];

    for (const name of filenames) {
      try {
        const { result } = await this.dbx.filesGetTemporaryLink({
          path: `/${subfolder ? `${subfolder}/` : ''}${name}${EXT}`,
        });

        links.push(result.link);
      } catch (e: any) {
        //console.log(e);
        throw e;
      }
    }
    return links;
  }

  async getPreview(filenames: string[], subfolder?: string): Promise<string[]> {
    const names: string[] = [];
    for (const file of filenames) {
      names.push(file + THUMBNAIL);
    }

    const links = await this.getFiles(names, subfolder);

    return links;
  }
}
