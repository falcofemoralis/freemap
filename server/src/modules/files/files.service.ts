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
  smallMaxWidth?: number;
}

export interface FileDownloadOptions {
  subfolder?: string;
  fileType?: FileType;
}

export enum FileType {
  ORIGINAL = '',
  THUMBNAIL = 'thumbnail',
  SMALL = 'small',
}

@Injectable()
export class FilesService {
  constructor(@Inject('DropboxService') private readonly dbx: Dropbox) {}

  async saveFiles(files: Array<Express.Multer.File>, options?: FileUploadOptions): Promise<string[]> {
    const uploadedFiles: string[] = [];
    for (const file of files) {
      try {
        const fileName = v4();

        await this.uploadFile(file.buffer, fileName, FileType.ORIGINAL, options.maxWidth, options.subfolder);
        await this.uploadFile(file.buffer, fileName, FileType.THUMBNAIL, options.previewMaxWidth, options.subfolder);
        //  await this.uploadFile(file.buffer, fileName, FileType.SMALL, options);

        uploadedFiles.push(fileName);
      } catch (e: any) {
        // TODO delete uploaded files;
        throw e;
        // console.log(e);
      }
    }

    return uploadedFiles;
  }

  /**
   * Upload file
   * @param data - what to upload
   * @param fileName - how it's called
   * @param fileType - what kind of thing is it
   * @param width - in what size should it be converted
   * @param subFolder - where it will be placed
   * @returns the thing that you wanted
   */
  private async uploadFile(data: Buffer, fileName: string, fileType: FileType, width: number, subFolder: string): Promise<number> {
    console.log(width);

    const image = await sharp(data)
      .jpeg({ mozjpeg: true, quality: fileType == FileType.ORIGINAL ? 90 : 50 })
      .resize({ width: width, withoutEnlargement: true })
      .toBuffer();
    const res = await this.dbx.filesUpload({
      path: `/${subFolder ? `${subFolder}/` : ''}${fileName}${fileType == FileType.ORIGINAL ? '' : `_${fileType}`}${EXT}`,
      contents: image.buffer,
    });

    return res.status;
  }

  async downloadFiles(filenames: string[], options?: FileDownloadOptions): Promise<Array<IFile>> {
    const files: IFile[] = [];

    for (const name of filenames) {
      try {
        const { result } = await this.dbx.filesDownload({ path: `/${options.subfolder ? `${options.subfolder}/` : ''}${name}${options.fileType ? `_${options.fileType}` : ''}${EXT}` });

        files.push({ buffer: Buffer.from((<any>result).fileBinary, 'base64'), filename: name, mimeType: FILE_TYPE });
      } catch (e: any) {
        // console.log(e);
        throw e;
      }
    }
    return files;
  }
}
