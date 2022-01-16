export interface MapObjectDto {
  readonly name: string;
  readonly desc: string;
  readonly coordinates: string;
  readonly typeId: number;
  readonly subtypeId?: number;
  readonly address?: string;
  readonly links?: string;
}
