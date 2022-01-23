export interface CreatedObject {
  name: string;
  description: string;
  coordinates: number[][];
  zoom: number;
  typeId: string;
  address?: string;
  links?: string;
  mediaFiles?: Blob[];
}