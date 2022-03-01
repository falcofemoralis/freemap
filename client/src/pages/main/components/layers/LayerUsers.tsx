import { Feature } from 'ol';
import { Polygon, Geometry } from 'ol/geom';
import { toLonLat, transformExtent } from 'ol/proj';
import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { authStore } from '../../../../store/auth.store';
import { mapStore } from '../../../../store/map.store';
import { formatCoordinate, formatZoom } from '../../../../utils/CoordinatesUtil';
import React from 'react';
import { MapContext } from '../../../../MapProvider';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { IMapFeatureType } from '../../../../types/IMapFeatureType';
import { createLabelStyle, createStyles, createTextStyle, createPolygonStyle } from './styles/OlStyles';
import { getVectorContext } from 'ol/render';
import { unByKey } from 'ol/Observable';
import { json } from 'stream/consumers';

interface ActiveUser {
    clientId: string;
    coordinates: number[][];
    username: string;
}

const SHOW_ON_ZOOM = 3;

export const LayerUsers = () => {
    console.log('LayerUsers');

    const { map } = React.useContext(MapContext);
    const source = new VectorSource();
    const baseLayer = new VectorLayer({
        source,
        properties: {
            name: 'Users Layer'
        },
        style: function (feature) {
            const labelStyle = createTextStyle(feature.get('username'));
            return [labelStyle, createPolygonStyle()];
        },
        renderBuffer: 5000
    });
    map?.addLayer(baseLayer);

    let socket: Socket;
    const activeUserFeatures: Map<string, Feature<Polygon>> = new Map();
    let pathChanged = false;
    let currentCoordinates: number[][];

    const handleCoordinatesChange = () => {
        if (!pathChanged && map) {
            const zoom = map.getView().getZoom();

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

            if (coordinates && zoom && zoom > SHOW_ON_ZOOM) {
                currentCoordinates = coordinates;
                socket.emit('updateActiveUser', { data: { coordinates, username: authStore.user?.username } });
            }

            pathChanged = true;

            setTimeout(() => {
                pathChanged = false;
            }, 0.25 * 1000);
        }
    };

    function featureFilter(coordinates: number[][]) {
        console.log(coordinates);
        console.log(currentCoordinates);
        console.log('--------------------------');

        if (!coordinates || !currentCoordinates) {
            return false;
        }

        if (currentCoordinates[3][0] > coordinates[3][0] && currentCoordinates[2][0] < coordinates[2][0]) {
            return false;
        }

        return true;
    }

    map?.getView()?.on('change:center', handleCoordinatesChange);

    useEffect(() => {
        socket = io('http://localhost:3001/map');
        socket.on('getActiveUsers', (data: ActiveUser[]) => {
            for (const user of data) {
                if (user.clientId == socket.id) {
                    continue;
                }

                if (!featureFilter(user.coordinates)) {
                    activeUserFeatures
                        .get(user.clientId)
                        ?.getGeometry()
                        ?.setCoordinates([[[0, 0]]]);
                    continue;
                }

                if (user.coordinates.length > 1) {
                    if (activeUserFeatures.has(user.clientId)) {
                        activeUserFeatures.get(user.clientId)?.getGeometry()?.setCoordinates([user.coordinates]);
                    } else {
                        const feature = new Feature(new Polygon([user.coordinates]));
                        feature.setProperties({ hover: false, select: false, username: user.username ?? `user ${user.clientId}` });
                        source.addFeature(feature);
                        activeUserFeatures.set(user.clientId, feature);
                    }
                }
            }
        });
    });

    return <></>;
};
