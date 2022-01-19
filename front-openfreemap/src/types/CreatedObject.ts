export interface CreatedObject {
  name: string;
  desc: string;
  coordinates: number[][][];
  typeId: number;
  address?: string;
  links?: string;
  mediaFiles?: Blob[];
}