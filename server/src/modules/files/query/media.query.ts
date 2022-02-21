import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { FileType } from '../files.service';

export class FileOptionsQuery {
  @ApiProperty({ enum: Object.values(FileType), description: 'Тип получаемого файла' })
  @IsEnum(FileType)
  @IsOptional()
  type: FileType;
}
