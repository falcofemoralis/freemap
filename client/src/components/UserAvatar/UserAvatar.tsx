import { FileType } from '@/constants/file.type';
import { IUser } from '@/types/IUser';
import { Avatar } from '@mui/material';
import { FC } from 'react';

interface UserAvatarProps {
  className?: string;
  user: IUser | null;
  type?: FileType;
  sx?: object;
  style?: React.CSSProperties | undefined;
}
export const UserAvatar: FC<UserAvatarProps> = ({ className, user, type, sx, style }) => {
  return (
    <Avatar
      className={className}
      style={style}
      src={user?.userAvatar ? `${user?.userAvatar}${type ? `?type=${type}` : ''}` : ''}
      sx={{ ...sx, bgcolor: user?.userColor ?? '#ff6f00' }}
    >
      {user?.username?.charAt(0).toUpperCase()}
    </Avatar>
  );
};
