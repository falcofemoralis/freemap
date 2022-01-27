import { Coordinate } from '@/dto/map/map-data.dto';

export interface CreatedObject {
  name: string;
  description: string;
  coordinates: Coordinate[];
  zoom: number;
  typeId: string;
  address?: string;
  links?: string[];
  mediaFiles?: Blob[];
}
