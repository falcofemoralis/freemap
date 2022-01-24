import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class GetMapDataQuery {
  @IsNumber()
  @Type(() => Number)
  latT: number; // верхняя точка широты

  @IsNumber()
  @Type(() => Number)
  lonR: number; // правая точка долготы

  @IsNumber()
  @Type(() => Number)
  latB: number; // нижняя точка широты

  @IsNumber()
  @Type(() => Number)
  lonL: number; // левая точка долготы

  @IsNumber()
  @Type(() => Number)
  zoom: number; // приближение пользователя
}
