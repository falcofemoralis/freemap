import { UserAvatar } from '@/components/UserAvatar/UserAvatar';
import { GeometryConstant } from '@/constants/geometry.type';
import { MapContext } from '@/MapContext';
import { usersStore } from '@/store/users.store';
import { IActiveUser } from '@/types/IActiveUser';
import { getCenter } from '@/utils/CoordinatesUtils';
import { List, ListItemButton, ListSubheader, Paper } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import './WidgetUsersBox.scss';

export const WidgetUsersBox = observer(() => {
  const { t } = useTranslation();
  const { mainMap } = useContext(MapContext);

  const selectUser = (user: IActiveUser) => {
    mainMap?.flyTo({ center: getCenter([user.coordinates], GeometryConstant.POLYGON), zoom: user.zoom });
  };

  return (
    <Paper className='usersBox'>
      <List className='usersBox__list'>
        {usersStore.getUsers().map(user => (
          <ListItemButton divider key={user.clientId} onClick={() => selectUser(user)}>
            <UserAvatar className='usersBox__list-avatar' user={user} />
            {user.username ?? t('ANONYMOUS')}
          </ListItemButton>
        ))}
        <ListSubheader className='usersBox__list-online'>
          {usersStore.getUsers().length} {t('USERS_ONLINE')}
        </ListSubheader>
      </List>
    </Paper>
  );
});
