import { IsNotEmpty, MaxLength } from 'class-validator';

export class ObjectTypeDto {
  id: string;

  @IsNotEmpty()
  geometryId: string;

  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}
