import { List, ListItemButton, ListSubheader, Paper } from '@mui/material';
import { Position } from 'geojson';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { UserAvatar } from '../../../../components/UserAvatar';
import { GeometryType } from '../../../../constants/geometry.type';
import { MapContext } from '../../../../MapProvider';
import { getCenter } from '../../../../misc/CoordinatesUtils';
import { activeUsersStore } from '../../../../store/active-users.store';
import { IActiveUser } from '../../../../types/IActiveUser';
import '../../styles/Widget.scss';
import { LayerUsers } from '../layers/LayerUsers';

export const WidgetUsersBox = observer(() => {
  const { mainMap } = React.useContext(MapContext);

  const selectUser = (coordinates: Position[], zoom: number) => {
    mainMap?.flyTo({ center: getCenter([coordinates], GeometryType.POLYGON), zoom });
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
