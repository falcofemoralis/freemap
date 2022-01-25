import { IsNotEmpty, MaxLength } from 'class-validator';

export class ObjectTypeDto {
  id: string;
  geometryId: string;
  name: string;
}
