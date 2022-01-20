export interface CreatedObject {
  name: string;
  desc: string;
  coordinates: number[][][];
  zoom: number;
  typeId: number;
  address?: string;
  links?: string;
  mediaFiles?: Blob[];
}