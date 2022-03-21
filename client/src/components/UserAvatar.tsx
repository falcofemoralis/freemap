import { Avatar } from '@mui/material';
import { FC } from 'react';
import { FileType } from '../constants/file.type';
import AuthService from '../services/auth.service';
import { IUser } from '../types/IUser';

interface UserAvatarProps {
  user: IUser | null;
  type?: FileType;
  sx?: object;
  style?: React.CSSProperties | undefined;
}
export const UserAvatar: FC<UserAvatarProps> = ({ user, type, sx, style }) => {
  return (
    <Avatar
      style={style}
      src={user?.userAvatar ? AuthService.getUserAvatar(user?.userAvatar, type) : user?.profileAvatarLink}
      sx={{ ...sx, bgcolor: user?.userColor ?? '#ff6f00' }}
    >
      {user?.username?.charAt(0).toUpperCase()}
    </Avatar>
  );
};
