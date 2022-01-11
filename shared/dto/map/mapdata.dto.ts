export interface MapDataDto {
  readonly name: string;
  readonly coordinates: string;
  readonly typeId: number;
  readonly subtypeId: number | null;
  readonly address: string | null;
  readonly links: string | null;
}
