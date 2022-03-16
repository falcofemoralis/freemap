import { List, ListItemButton, ListSubheader, Paper } from '@mui/material';
import { Position } from 'geojson';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { UserAvatar } from '../../../../components/UserAvatar';
import { GeometryType } from '../../../../constants/geometry.type';
import { MapContext } from '../../../../MapProvider';
import { getCenter } from '../../../../misc/CoordinatesUtils';
import { Logger } from '../../../../misc/Logger';
import { activeUsersStore } from '../../../../store/active-users.store';
import '../../styles/Widget.scss';

export const WidgetUsersBox = observer(() => {
  Logger.info('WidgetUsersBox');

  const { mainMap } = React.useContext(MapContext);

  const selectUser = (coordinates: Position[], zoom: number) => {
    mainMap?.flyTo({ center: getCenter([coordinates], GeometryType.POLYGON), zoom });
  };

  return (
    <Paper className='usersBox'>
      <List sx={{ width: '100%' }}>
        {activeUsersStore.getUsers().map(user => (
          <ListItemButton divider key={user.clientId} onClick={() => selectUser(user.coordinates, user.zoom)}>
            <UserAvatar user={{ username: user.username, userColor: user.userColor, userAvatar: user.userAvatar }} sx={{ mr: 1 }} />
            {user.username ?? 'Anonymous'}
          </ListItemButton>
        ))}
        <ListSubheader sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 25 }}>
          {activeUsersStore.getUsers().length} users online
        </ListSubheader>
      </List>
    </Paper>
  );
});
