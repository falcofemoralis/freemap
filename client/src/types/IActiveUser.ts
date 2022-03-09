export interface IActiveUser {
  clientId: string;
  coordinates: number[][];
  zoom: number;
  username: string;
  userColor?: string;
  userAvatar?: string;
}
