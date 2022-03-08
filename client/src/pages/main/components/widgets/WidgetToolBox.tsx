import ArchitectureOutlinedIcon from '@mui/icons-material/ArchitectureOutlined';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import GpsFixedOutlinedIcon from '@mui/icons-material/GpsFixedOutlined';
import StraightenOutlinedIcon from '@mui/icons-material/StraightenOutlined';
import { IconButton, Paper } from '@mui/material';
import { Feature } from 'ol';
import Geolocation from 'ol/Geolocation';
import { Geometry, LineString, Point } from 'ol/geom';
import { Draw, Modify } from 'ol/interaction';
import { Vector as VectorLayer } from 'ol/layer';
import 'ol/ol.css';
import { toLonLat } from 'ol/proj';
import RenderFeature from 'ol/render/Feature';
import VectorSource from 'ol/source/Vector';
import { getLength } from 'ol/sphere';
import { Fill, RegularShape, Stroke, Style, Text } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import * as React from 'react';
import { GeometryType } from '../../../../constants/geometry.type';
import { MapContext } from '../../../../MapProvider';
import { flyTo } from '../../../../utils/MapAnimation';
import { LocationStyle } from '../layers/styles/LocationStyle';
import { editorStore } from '../../../../store/editor.store';

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
    positionFeature.setStyle(LocationStyle);

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

    /* MEASURE */

    const style = new Style({
        fill: new Fill({
            color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new Stroke({
            color: 'rgba(0, 0, 0, 0.5)',
            lineDash: [10, 10],
            width: 2
        }),
        image: new CircleStyle({
            radius: 5,
            stroke: new Stroke({
                color: 'rgba(0, 0, 0, 0.7)'
            }),
            fill: new Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            })
        })
    });

    const labelStyle = new Style({
        text: new Text({
            font: '14px Calibri,sans-serif',
            fill: new Fill({
                color: 'rgba(255, 255, 255, 1)'
            }),
            backgroundFill: new Fill({
                color: 'rgba(0, 0, 0, 0.7)'
            }),
            padding: [3, 3, 3, 3],
            textBaseline: 'bottom',
            offsetY: -15
        }),
        image: new RegularShape({
            radius: 8,
            points: 3,
            angle: Math.PI,
            displacement: [0, 10],
            fill: new Fill({
                color: 'rgba(0, 0, 0, 0.7)'
            })
        })
    });

    const tipStyle = new Style({
        text: new Text({
            font: '12px Calibri,sans-serif',
            fill: new Fill({
                color: 'rgba(255, 255, 255, 1)'
            }),
            backgroundFill: new Fill({
                color: 'rgba(0, 0, 0, 0.4)'
            }),
            padding: [2, 2, 2, 2],
            textAlign: 'left',
            offsetX: 15
        })
    });

    const modifyStyle = new Style({
        image: new CircleStyle({
            radius: 5,
            stroke: new Stroke({
                color: 'rgba(0, 0, 0, 0.7)'
            }),
            fill: new Fill({
                color: 'rgba(0, 0, 0, 0.4)'
            })
        }),
        text: new Text({
            text: 'Drag to modify',
            font: '12px Calibri,sans-serif',
            fill: new Fill({
                color: 'rgba(255, 255, 255, 1)'
            }),
            backgroundFill: new Fill({
                color: 'rgba(0, 0, 0, 0.7)'
            }),
            padding: [2, 2, 2, 2],
            textAlign: 'left',
            offsetX: 15
        })
    });

    const segmentStyle = new Style({
        text: new Text({
            font: '12px Calibri,sans-serif',
            fill: new Fill({
                color: 'rgba(255, 255, 255, 1)'
            }),
            backgroundFill: new Fill({
                color: 'rgba(0, 0, 0, 0.4)'
            }),
            padding: [2, 2, 2, 2],
            textBaseline: 'bottom',
            offsetY: -12
        }),
        image: new RegularShape({
            radius: 6,
            points: 3,
            angle: Math.PI,
            displacement: [0, 8],
            fill: new Fill({
                color: 'rgba(0, 0, 0, 0.4)'
            })
        })
    });

    const segmentStyles = [segmentStyle];

    const formatLength = function (line: LineString) {
        const length = getLength(line);
        let output;
        if (length > 100) {
            output = Math.round((length / 1000) * 100) / 100 + ' km';
        } else {
            output = Math.round(length * 100) / 100 + ' m';
        }
        return output;
    };

    let tipPoint: Geometry | RenderFeature | undefined;

    function styleFunction(feature: Feature<Geometry> | RenderFeature, tip?: string) {
        const styles = [style];
        const type = feature?.getGeometry()?.getType();

        if (type == GeometryType.LINE_STRING) {
            const geometry = feature.getGeometry() as LineString;
            const point = new Point(geometry?.getLastCoordinate());
            const label = formatLength(geometry);

            if (true && geometry) {
                let count = 0;
                geometry.forEachSegment(function (a, b) {
                    const segment = new LineString([a, b]);
                    const label = formatLength(segment);
                    if (segmentStyles.length - 1 < count) {
                        segmentStyles.push(segmentStyle.clone());
                    }
                    const segmentPoint = new Point(segment.getCoordinateAt(0.5));
                    segmentStyles[count].setGeometry(segmentPoint);
                    segmentStyles[count].getText().setText(label);
                    styles.push(segmentStyles[count]);
                    count++;
                });
            }
            if (label) {
                labelStyle.setGeometry(point);
                labelStyle.getText().setText(label);
                styles.push(labelStyle);
            }
        } else if (tip && GeometryType.POINT && !modify.getOverlay().getSource().getFeatures().length) {
            tipPoint = feature.getGeometry();
            tipStyle.getText().setText(tip);
            styles.push(tipStyle);
        }

        return styles;
    }

    const source = new VectorSource();
    const modify = new Modify({ source, style: modifyStyle });
    const vector = new VectorLayer({
        source: source,
        properties: {
            name: 'Measure Layer'
        },
        style: function (feature) {
            return styleFunction(feature);
        }
    });
    map?.addLayer(vector);
    map?.addInteraction(modify);

    let draw: Draw | null = null; // global so we can remove it later
    function addInteraction() {
        const activeTip = 'Click to continue drawing the line';
        const idleTip = 'Click to start measuring';
        let tip = idleTip;
        draw = new Draw({
            source: source,
            type: GeometryType.LINE_STRING,
            style: function (feature) {
                return styleFunction(feature, tip);
            }
        });
        draw.on('drawstart', function () {
            //clearPrevious.checked
            source.clear();
            modify.setActive(false);
            tip = activeTip;
        });
        draw.on('drawend', function () {
            if (tipPoint) {
                modifyStyle.setGeometry(tipPoint as Geometry);
            }
            modify.setActive(true);
            map?.once('pointermove', function () {
                // modifyStyle.setGeometry();
                console.log('?');
            });
            tip = idleTip;
        });
        modify.setActive(true);
        map?.addInteraction(draw);
    }

    const measure = () => {
        if (draw) map?.removeInteraction(draw);
        addInteraction();
    };

    window.addEventListener('keyup', function (event) {
        if (event.key === 'Escape') {
            if (draw) {
                map?.removeInteraction(draw);
            }
        }
    });

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
                <IconButton onClick={measure}>
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
