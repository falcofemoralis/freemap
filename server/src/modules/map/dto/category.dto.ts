import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CategoryDto {
  @ApiProperty({ example: 'qwerty', description: 'Название категории' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '1.png', description: 'Иконка категории' })
  @IsString()
  @IsOptional()
  icon?: string;
}
