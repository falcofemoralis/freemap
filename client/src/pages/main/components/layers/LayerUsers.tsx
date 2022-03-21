import { Feature, Geometry, Polygon, Position } from 'geojson';
import { GeoJSONSource } from 'mapbox-gl';
import { observe } from 'mobx';
import React from 'react';
import { io } from 'socket.io-client';
import { GeometryType } from '../../../../constants/geometry.type';
import { MapContext } from '../../../../MapProvider';
import { Logger } from '../../../../misc/Logger';
import { MAP_SOCKET } from '../../../../services';
import { activeUsersStore } from '../../../../store/active-users.store';
import { authStore } from '../../../../store/auth.store';
import { IActiveUser } from '../../../../types/IActiveUser';
import { IUser } from '../../../../types/IUser';

const SHOW_ON_ZOOM = 3;
interface IActiveFeatureProps {
  name: string;
  clientId: string;
  userAvatar?: string;
  userColor?: string;
}

export const LayerUsers = () => {
  Logger.info('LayerUsers');

  const { mainMap } = React.useContext(MapContext);
  const featureCollection: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
    type: 'FeatureCollection',
    features: []
  };
  let currentCoordinates: number[][];
  let currentZoom: number;

  const updatePosition = () => {
    const bounds = mainMap?.getBounds();
    if (bounds) {
      currentCoordinates = [
        bounds.getSouthEast().toArray(),
        bounds.getNorthEast().toArray(),
        bounds.getNorthWest().toArray(),
        bounds.getSouthWest().toArray(),
        bounds.getSouthEast().toArray()
      ];
    }

    currentZoom = mainMap?.getZoom() ?? 1;
  };

  /**
   * Если клиент находится "внутри" другого клиента - фича будет удалена
   * @param coordinates - координаты фичи
   * @returns true - оставить, false - удалить
   */
  const featureFilter = (coordinates: number[][]) => {
    if (!coordinates || !currentCoordinates) {
      return false;
    }

    // check if this user inside - SE lon && NW lat
    if (currentCoordinates[0][0] < coordinates[0][0] && currentCoordinates[2][1] < coordinates[2][1]) {
      return false;
    }

    return true;
  };

  const initSocket = (user?: IUser) => {
    console.log('Инициализация сокета');

    updatePosition();

    activeUsersStore.socket = io(MAP_SOCKET, {
      query: {
        coordinates: currentCoordinates,
        zoom: currentZoom,
        username: user?.username ?? 'Anonymous',
        userAvatar: user?.userAvatar ?? '',
        userColor: user?.userColor ?? ''
      }
    });

    activeUsersStore.socket.on('getActiveUsers', (data: IActiveUser[]) => {
      activeUsersStore.updatesUsers(data);

      for (const user of data) {
        // if owner - skip
        if (user.clientId == activeUsersStore.currentClientId) {
          continue;
        }

        // remove bigger feature
        if (!featureFilter(user.coordinates)) {
          console.log('remove');

          (featureCollection.features.find(f => f?.properties?.clientId == user.clientId)?.geometry as Polygon).coordinates = [[[0, 0]]];
          (mainMap?.getSource('users') as GeoJSONSource).setData(featureCollection);
          continue;
        }

        if (user.coordinates.length > 1) {
          if (!featureCollection.features.find(f => f?.properties?.clientId == user.clientId)) {
            /**
             * if user feature not exists - create new
             */
            const feature: Feature<Geometry, IActiveFeatureProps> = {
              type: 'Feature',
              geometry: {
                type: GeometryType.POLYGON,
                coordinates: [currentCoordinates as Position[]]
              },
              properties: {
                name: user.username,
                clientId: user.clientId,
                userAvatar: user.userAvatar,
                userColor: user.userColor
              }
            };
            featureCollection.features.push(feature);
            (mainMap?.getSource('users') as GeoJSONSource).setData(featureCollection);
          } else {
            /**
             * update exist feature coordinates
             */
            (featureCollection.features.find(f => f?.properties?.clientId == user.clientId)?.geometry as Polygon).coordinates = [user.coordinates];
            (mainMap?.getSource('users') as GeoJSONSource).setData(featureCollection);
          }
        }
      }

      // if client was removed - delete feature
      for (const f of featureCollection.features) {
        if (!data.find(d => d.clientId == f.properties?.clientId)) {
          featureCollection.features = featureCollection.features.filter(ff => ff.properties?.clientId != f.properties?.clientId);
          (mainMap?.getSource('users') as GeoJSONSource).setData(featureCollection);
        }
      }
    });

    console.log('Инициализация сокета окончена');
  };

  React.useEffect(() => {
    if (authStore.isAuth) {
      observe(authStore, 'user', change => {
        initSocket(change.newValue as IUser);
      });
    } else {
      initSocket();
    }

    mainMap?.addSource('users', { type: 'geojson', data: featureCollection });

    // Add a new layer to visualize the polygon.
    mainMap?.addLayer({
      id: 'maine',
      type: 'fill',
      source: 'users', // reference the data source
      layout: {},
      paint: {
        'fill-color': '#0080ff', // blue color fill
        'fill-opacity': 0.5
      }
    });
    // Add a black outline around the polygon.
    mainMap?.addLayer({
      id: 'outline',
      type: 'line',
      source: 'users',
      layout: {},
      paint: {
        'line-color': '#000',
        'line-width': 3
      }
    });

    mainMap?.addLayer({
      id: `maine-username`,
      type: 'symbol',
      source: `users`,
      layout: {
        'text-field': ['get', 'name'],
        'icon-image': ['get', 'userAvatar']
      }
    });

    // listener for map coordinates change
    mainMap?.on('moveend', () => {
      if (mainMap) {
        updatePosition();

        if (currentCoordinates && currentZoom && currentZoom > SHOW_ON_ZOOM) {
          // update active users on server
          const data = {
            coordinates: currentCoordinates,
            zoom: currentZoom
          };
          activeUsersStore.socket?.emit('updateActiveUser', { data });
        }
      }
    });
  }, [mainMap]);

  return <></>;
};
