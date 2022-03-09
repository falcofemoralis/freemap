import { Feature } from 'ol';
import { Polygon } from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import React, { useEffect } from 'react';
import { io } from 'socket.io-client';
import { FileType } from '../../../../constants/file.type';
import { MapContext } from '../../../../MapProvider';
import AuthService from '../../../../services/auth.service';
import { MAP_SOCKET } from '../../../../services/index';
import { activeUsersStore } from '../../../../store/active-users.store';
import { authStore } from '../../../../store/auth.store';
import { IActiveUser } from '../../../../types/IActiveUser';
import { getCurrentCoordinates } from '../../../../utils/CoordinatesUtil';
import { OlStyles } from './styles/OlStyles';
import { PolygonStyle } from './styles/PolygonStyle';
import { observe } from 'mobx';
import { mapStore } from '../../../../store/map.store';

const SHOW_ON_ZOOM = 3;

interface IActiveFeature {
  clientId: string;
  feature: Feature<Polygon>;
}

export const LayerUsers = () => {
  console.log('LayerUsers');

  const { map } = React.useContext(MapContext);
  const activeFeatures: IActiveFeature[] = [];
  let coordinatesTimeoutEnd = false;
  let currentCoordinates: number[][];
  let currentZoom: number;

  const source = new VectorSource();
  const baseLayer = new VectorLayer({
    source,
    properties: {
      name: 'Users Layer'
    },
    style: function (feature) {
      const olStyles = new OlStyles();
      const labelStyle = olStyles.createLabelStyle(
        feature.get('username'),
        AuthService.getUserAvatar(feature.get('avatar'), FileType.THUMBNAIL),
        1,
        feature.getGeometry()
      );
      return [PolygonStyle, labelStyle];
    },
    renderBuffer: 5000
  });
  map?.addLayer(baseLayer);

  // listener for map coordinates change
  map?.getView()?.on('change:center', () => {
    if (!coordinatesTimeoutEnd && map) {
      currentZoom = map.getView().getZoom() ?? 1;
      currentCoordinates = getCurrentCoordinates(window, document, map);

      if (currentCoordinates && currentZoom && currentZoom > SHOW_ON_ZOOM) {
        // update active users on server
        const data = {
          coordinates: currentCoordinates,
          zoom: currentZoom
        };
        activeUsersStore.socket?.emit('updateActiveUser', { data });
      }

      coordinatesTimeoutEnd = true;

      setTimeout(() => {
        coordinatesTimeoutEnd = false;
      }, 0.25 * 1000);
    }
  });

  const featureFilter = (coordinates: number[][]) => {
    if (!coordinates || !currentCoordinates) {
      return false;
    }

    if (currentCoordinates[3][0] > coordinates[3][0] && currentCoordinates[2][0] < coordinates[2][0]) {
      return false;
    }

    return true;
  };

  const initSocket = () => {
    // init start coordinates
    currentCoordinates = getCurrentCoordinates(window, document, map);
    currentZoom = map?.getView().getZoom() ?? 1;

    console.log(authStore.user);

    // socket connect
    activeUsersStore.socket = io(MAP_SOCKET, {
      query: {
        coordinates: currentCoordinates,
        zoom: currentZoom,
        username: authStore.user?.username ?? 'Anonymous',
        userAvatar: authStore.user?.userAvatar,
        userColor: authStore.user?.userColor
      }
    });
    // subscribe on getActiveUsers
    activeUsersStore.socket.on('getActiveUsers', (data: IActiveUser[]) => {
      activeUsersStore.updatesUsers(data);

      for (const user of data) {
        // if owner - skip
        if (user.clientId == activeUsersStore.currentClientId) {
          continue;
        }

        if (!featureFilter(user.coordinates)) {
          const feature = activeFeatures.find(f => f.clientId == user.clientId)?.feature;
          feature?.getGeometry()?.setCoordinates([[[0, 0]]]);
          continue;
        }

        if (user.coordinates.length > 1) {
          if (!activeFeatures.find(f => f.clientId == user.clientId)) {
            // if user feature not exists - create new
            const feature = new Feature(new Polygon([user.coordinates]));
            feature.setProperties({
              username: user.username,
              userAvatar: user.userAvatar,
              userColor: user.userColor
            });

            source.addFeature(feature);
            activeFeatures.push({ clientId: user.clientId, feature });
          } else {
            // update exist feature coordinates
            const feature = activeFeatures.find(f => f.clientId == user.clientId)?.feature;
            feature?.getGeometry()?.setCoordinates([user.coordinates]);
          }
        }
      }

      // if client was removed - delete feature
      for (const f of activeFeatures) {
        if (!data.find(d => d.clientId == f.clientId)) {
          const activeFeature = activeFeatures.find(ff => ff.clientId == f.clientId);
          if (activeFeature) {
            source.removeFeature(activeFeature.feature);

            activeFeatures.splice(activeFeatures.indexOf(activeFeature), 1);
          }
        }
      }
    });
  };

  useEffect(() => {
    if (authStore.isAuth) {
      observe(authStore, 'user', change => {
        initSocket();
      });
    } else {
      initSocket();
    }
  });

  return <></>;
};