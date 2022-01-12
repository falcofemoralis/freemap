export interface MapObjectDto {
  readonly name: string;
  readonly desc: string;
  readonly coordinates: string;
  readonly typeId: number;
  readonly subtypeId: number | null;
  readonly address: string | null;
  readonly links: string | null;
}
