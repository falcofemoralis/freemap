import ArchitectureOutlinedIcon from '@mui/icons-material/ArchitectureOutlined';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import GpsFixedOutlinedIcon from '@mui/icons-material/GpsFixedOutlined';
import StraightenOutlinedIcon from '@mui/icons-material/StraightenOutlined';
import { IconButton, Paper } from '@mui/material';
import { Feature } from 'ol';
import Geolocation from 'ol/Geolocation';
import { Geometry, Point } from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import { toLonLat } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import { Fill, Stroke, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import * as React from 'react';
import { MapContext } from '../../../../MapProvider';
import { flyTo } from '../../../../utils/MapAnimation';

export const WidgetToolBox = () => {
    console.log('WidgetToolBox');

    const { map } = React.useContext(MapContext);
    const view = map?.getView();
    const geolocation = new Geolocation({
        // enableHighAccuracy must be set to true to have the heading value.
        trackingOptions: {
            enableHighAccuracy: true
        },
        projection: view?.getProjection()
    });

    const accuracyFeature = new Feature();
    geolocation.on('change:accuracyGeometry', function () {
        accuracyFeature.setGeometry(geolocation.getAccuracyGeometry() as Geometry);
    });

    const positionFeature = new Feature();
    positionFeature.setStyle(
        new Style({
            image: new CircleStyle({
                radius: 6,
                fill: new Fill({
                    color: '#3399CC'
                }),
                stroke: new Stroke({
                    color: '#fff',
                    width: 2
                })
            })
        })
    );

    geolocation.on('change:position', function () {
        const coordinates = geolocation.getPosition();

        if (coordinates) {
            positionFeature.setGeometry((coordinates ? new Point(coordinates) : null) as Geometry);

            const [lon, lat] = toLonLat(coordinates, 'EPSG:3857');
            flyTo([{ lon, lat }], 15, map);
        }
    });

    const baseLayer = new VectorLayer({
        source: new VectorSource({
            features: [accuracyFeature, positionFeature]
        }),
        properties: {
            name: 'Geolocation Layer'
        }
    });
    map?.addLayer(baseLayer);

    const geolocate = () => {
        geolocation.setTracking(true);
    };

    return (
        <>
            <Paper className='toolBox__compass'>
                <IconButton>
                    <ExploreOutlinedIcon />
                </IconButton>
            </Paper>
            <Paper className='toolBox__z'>
                <IconButton>
                    <ArchitectureOutlinedIcon />
                </IconButton>
            </Paper>
            <Paper className='toolBox__ruler'>
                <IconButton>
                    <StraightenOutlinedIcon />
                </IconButton>
            </Paper>
            <Paper className='toolBox__geolocation'>
                <IconButton onClick={geolocate}>
                    <GpsFixedOutlinedIcon />
                </IconButton>
            </Paper>
        </>
    );
};
