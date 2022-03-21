import { Position } from 'geojson';

export interface IActiveUser {
  clientId: string;
  coordinates: Position[];
  zoom: number;
  username: string;
  userColor?: string;
  userAvatar?: string;
  profileAvatarLink?: string;
}
