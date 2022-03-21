export interface ActiveUser {
  clientId: string;
  coordinates: number[][];
  zoom: number;
  username: string;
  userColor?: string;
  userAvatar?: string;
  profileAvatarLink?: string;
}
