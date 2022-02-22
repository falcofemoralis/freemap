import { ApiProperty } from '@nestjs/swagger';
import { StyleType } from './../constants/style.type';

export class TypeStyle {
  @ApiProperty({ enum: Object.values(StyleType), description: 'Тип стиля' })
  type: StyleType;

  @ApiProperty({ example: '#fff', description: 'Цвет' })
  color?: string;

  @ApiProperty({ example: '4', description: 'Ширина' })
  width?: number;

  @ApiProperty({ example: '[4, 6, 8]', description: 'Черты' })
  lineDash?: number[];

  @ApiProperty({ example: '2', description: 'Смещение черт' })
  lineDashOffset?: number;
}
