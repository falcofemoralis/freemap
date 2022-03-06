import { Box } from '@mui/material';
import { Feature } from 'ol';
import { LineString, Polygon } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import Map from 'ol/Map';
import { fromLonLat } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import { Fill, Stroke, Style } from 'ol/style';
import View from 'ol/View';
import { CustomDrawer } from '../../../../components/CustomDrawer';
import './styles/TabAdmin.scss';

export const TabAdmin = () => {
    // eslint-disable-next-line no-constant-condition
    if (false) {
        const style = [
            new Style({
                fill: new Fill({
                    color: [255, 255, 255, 0.6]
                }),
                stroke: new Stroke({
                    color: [255, 255, 255, 0.6],
                    width: 4
                })
            })
        ];

        // const style = [
        //     new Style({
        //         stroke: new Stroke({
        //             color: '#fab824',
        //             width: 10
        //         }),
        //         zIndex: 0
        //     }),
        //     new Style({
        //         stroke: new Stroke({
        //             color: '#fde293',
        //             width: 8
        //         }),
        //         zIndex: 1
        //     })
        // ];

        // INIT
        const map = new Map({
            view: new View({
                center: fromLonLat([-12, 0]),
                zoom: 4
            })
        });

        const mapTarget = (element: any) => {
            map.setTarget(element);
        };

        const lineFeature = new Feature(
            new LineString([
                [-1e1, -1e6],
                [1e1, 1e6]
            ])
        );
        const polygonFeature = new Feature(
            new Polygon([
                [
                    [-3e6, -1e6],
                    [-3e6, 1e6],
                    [-1e6, 1e6],
                    [-1e6, -1e6],
                    [-3e6, -1e6]
                ]
            ])
        );

        const vectorLayer = new VectorLayer({
            background: 'black',
            source: new VectorSource({
                features: [lineFeature, polygonFeature]
            }),
            style: function (feature) {
                /*         style[1].getText().setText(feature.get('name'));
            style[1].setGeometry(
                feature?.getGeometry()?.getType() === 'MultiPolygon'
                    ? (feature?.getGeometry() as MultiPolygon)?.getInteriorPoints()
                    : (feature?.getGeometry() as Polygon)?.getInteriorPoint()
            ); */
                return style;
            },
            renderBuffer: 5000
        });

        map.addLayer(vectorLayer);

        return (
            <CustomDrawer open={false} onClose={() => console.log('close')}>
                <Box>
                    <div ref={mapTarget} id='example-map' className='example-map'></div>
                </Box>
            </CustomDrawer>
        );
    } else {
        return <></>;
    }
};
