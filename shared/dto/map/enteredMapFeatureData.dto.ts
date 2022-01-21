export interface EnteredMapFeatureDataDto {
  name: string;
  desc: string;
  coordinates: string;
  zoom: number;
  typeId: number;
  address?: string;
  links?: string;
}
