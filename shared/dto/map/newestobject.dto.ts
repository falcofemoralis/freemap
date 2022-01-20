import { MapObjectDto } from './mapobject.dto';

export interface NewestObjectDto extends MapObjectDto {
  id: number;
  userName: string;
  date: string;
}