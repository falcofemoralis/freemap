export interface MapObjectDto {
  name: string;
  desc: string;
  coordinates: string;
  typeId: number;
  subtypeId?: number;
  address?: string;
  links?: string;
}
