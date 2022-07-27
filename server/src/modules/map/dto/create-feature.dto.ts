import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateFeaturePropsDto {
  @ApiProperty({ example: '6202777bb6932aedd0883e35', description: 'id типа' })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty({ example: '6202777bb6932aedd0883e35', description: 'id категории' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ example: 'qwerty', description: 'Название' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'Lorem Ipsum Dolor', description: 'Описание' })
  @IsOptional()
  @MaxLength(1200)
  description?: string;

  @ApiProperty({ example: 'qwerty', description: 'Адрес' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: '[url1, url2]', description: 'Доп. ссылки' })
  @IsOptional()
  @IsArray()
  links?: string[];

  @ApiProperty({ example: '3809153355', description: 'Телефон' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'wiki.com/...', description: 'Ссылка на википедию' })
  @IsOptional()
  @IsString()
  wiki?: string;
}
