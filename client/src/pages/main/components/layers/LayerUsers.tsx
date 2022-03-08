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
import { OlStyles } from './styles/OlStyles';
import { PolygonStyle } from './styles/PolygonStyle';

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

  const source = new VectorSource();
  const baseLayer = new VectorLayer({
    source,
    properties: {
      name: 'Users Layer'
    },
    style: function (feature) {
      const olStyles = new OlStyles();
      const labelStyle = olStyles.createLabelStyle(feature.get('username'), AuthService.getUserAvatar(feature.get('avatar'), FileType.THUMBNAIL), 1, feature.getGeometry());
      return [PolygonStyle, labelStyle];
    },
    renderBuffer: 5000
  });
  map?.addLayer(baseLayer);

  const getCurrentCoordinates = (): number[][] => {
    if (map) {
      const w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        x = w.innerWidth || e.clientWidth || g.clientWidth,
        y = w.innerHeight || e.clientHeight || g.clientHeight;
      const topleft = map.getCoordinateFromPixel([0, 0]);
      const topright = map.getCoordinateFromPixel([x, 0]);
      const bottomleft = map.getCoordinateFromPixel([0, y]);
      const bottomright = map.getCoordinateFromPixel([x, y]);
      const coordinates = [topleft, topright, bottomright, bottomleft];
      return coordinates;
    }

    return [];
  };

  const handleCoordinatesChange = () => {
    if (!coordinatesTimeoutEnd && map) {
      const zoom = map.getView().getZoom();
      currentCoordinates = getCurrentCoordinates();

      if (currentCoordinates && zoom && zoom > SHOW_ON_ZOOM) {
        activeUsersStore.socket?.emit('updateActiveUser', {
          data: {
            coordinates: currentCoordinates,
            zoom: zoom,
            username: authStore.user?.username,
            avatar: authStore.user?.userAvatar
          }
        });
      }

      coordinatesTimeoutEnd = true;

      setTimeout(() => {
        coordinatesTimeoutEnd = false;
      }, 0.25 * 1000);
    }
  };

  const featureFilter = (coordinates: number[][]) => {
    if (!coordinates || !currentCoordinates) {
      return false;
    }

    if (currentCoordinates[3][0] > coordinates[3][0] && currentCoordinates[2][0] < coordinates[2][0]) {
      return false;
    }

    return true;
  };

  map?.getView()?.on('change:center', handleCoordinatesChange);

  useEffect(() => {
    currentCoordinates = getCurrentCoordinates();

    activeUsersStore.socket = io(MAP_SOCKET);
    activeUsersStore.socket.on('getActiveUsers', (data: IActiveUser[]) => {
      activeUsersStore.updatesUsers(data);

      for (const user of data) {
        if (user.clientId == activeUsersStore.currentClientId) {
          continue;
        }

        if (!featureFilter(user.coordinates)) {
          activeFeatures
            .find(f => f.clientId == user.clientId)
            ?.feature?.getGeometry()
            ?.setCoordinates([[[0, 0]]]);
          continue;
        }

        if (user.coordinates.length > 1) {
          if (!activeFeatures.find(f => f.clientId == user.clientId)) {
            const feature = new Feature(new Polygon([user.coordinates]));
            feature.setProperties({
              username: user.username ?? 'Anonymous',
              avatar: user.avatar ?? ''
            });
            source.addFeature(feature);
            activeFeatures.push({ clientId: user.clientId, feature });
          } else {
            activeFeatures
              .find(f => f.clientId == user.clientId)
              ?.feature?.getGeometry()
              ?.setCoordinates([user.coordinates]);
          }
        }
      }

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
  });

  return <></>;
};
