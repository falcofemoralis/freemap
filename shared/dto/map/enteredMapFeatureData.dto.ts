export interface EnteredMapFeatureDataDto {
  name: string;
  desc: string;
  coordinates: number[][][];
  zoom: number;
  typeId: number;
  address?: string;
  links?: string;
}
