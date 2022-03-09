import { List, ListItemButton, ListSubheader, Paper } from '@mui/material';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { UserAvatar } from '../../../../components/UserAvatar';
import { GeometryType } from '../../../../constants/geometry.type';
import { MapContext } from '../../../../MapProvider';
import { activeUsersStore } from '../../../../store/active-users.store';
import { IActiveUser } from '../../../../types/IActiveUser';
import { toTuple } from '../../../../utils/CoordinatesUtil';
import { flyTo } from '../../../../utils/MapAnimation';
import '../../styles/Widget.scss';

export const WidgetUsersBox = observer(() => {
  const { map } = React.useContext(MapContext);

  const selectUser = (coords: number[][], zoom: number) => {
    flyTo(toTuple([coords], GeometryType.POLYGON), zoom, map);
  };

  const getUsers = (users: IActiveUser[]): IActiveUser[] => {
    return users.filter(user => user.clientId != activeUsersStore.currentClientId);
  };

  return (
    <Paper className='usersBox'>
      <List sx={{ width: '100%' }}>
        {getUsers(activeUsersStore.users).map(user => (
          <ListItemButton divider key={user.clientId} onClick={() => selectUser(user.coordinates, user.zoom)}>
            <UserAvatar user={{ username: user.username, userColor: user.userColor, userAvatar: user.userAvatar }} sx={{ mr: 1 }} />
            {user.username ?? 'Anonymous'}
          </ListItemButton>
        ))}
        <ListSubheader sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 25 }}>
          {getUsers(activeUsersStore.users).length} users online
        </ListSubheader>
      </List>
    </Paper>
  );
});
