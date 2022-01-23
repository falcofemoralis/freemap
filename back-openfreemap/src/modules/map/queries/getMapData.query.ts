import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class GetMapDataQuery {
  @IsNumber()
  @Type(() => Number)
  latT: number;

  @IsNumber()
  @Type(() => Number)
  lonR: number;

  @IsNumber()
  @Type(() => Number)
  latB: number;

  @IsNumber()
  @Type(() => Number)
  lonL: number;

  @IsNumber()
  @Type(() => Number)
  zoom: number;
}
