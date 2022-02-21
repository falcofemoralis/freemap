import { Inject, Injectable } from '@nestjs/common';
import { Dropbox } from 'dropbox';
import * as sharp from 'sharp';
import { v4 } from 'uuid';
import { IFile } from './types/IFile';

const EXT = '.jpg';
const FILE_TYPE = 'image/jpeg';

export interface FileUploadOptions {
  subfolder?: string;
  maxWidth?: number;
  previewMaxWidth?: number;
}

export interface FileDownloadOptions {
  subfolder?: string;
  fileType?: FileType;
}

export enum FileType {
  THUMBNAIL = 'thumbnail',
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

  async downloadFiles(filenames: string[], options?: FileDownloadOptions): Promise<Array<IFile>> {
    const files: IFile[] = [];

    for (const name of filenames) {
      try {
        const { result } = await this.dbx.filesDownload({ path: `/${options.subfolder ? `${options.subfolder}/` : ''}${name}${options.fileType ? `_${options.fileType}` : ''}${EXT}` });

        files.push({ buffer: Buffer.from((<any>result).fileBinary, 'base64'), filename: name, mimeType: FILE_TYPE });
      } catch (e: any) {
        //console.log(e);
        throw e;
      }
    }
    return files;
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
      path: `/${options?.subfolder ? `${options.subfolder}/` : ''}${fileName}_${FileType.THUMBNAIL}${EXT}`,
      contents: thumbnail.buffer,
    });

    return res.status;
  }
}
