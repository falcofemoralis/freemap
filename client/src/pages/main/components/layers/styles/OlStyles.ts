import { Feature } from 'ol';
import { Geometry, MultiPolygon, Polygon } from 'ol/geom';
import RenderFeature from 'ol/render/Feature';
import { Fill, Stroke, Style, Text } from 'ol/style';
import { StyleType } from '../../../../../constants/style.type';
import { ITypeStyle } from '../../../../../types/ITypeStyle';
import { GeometryType } from './../../../../../constants/geometry.type';
import { IMapFeatureType } from '../../../../../types/IMapFeatureType';

export class OlStyles {
    getStyleFunction(styles: Style[]) {
        return (feature: Feature<Geometry> | RenderFeature, arg: number) => {
            const labelStyle = new OlStyles().createLabelStyle(feature.get('name'), feature.get('icon'), 1, feature.getGeometry());
            return [...styles, labelStyle];
        };
    }

    getFeatureStyle() {
        return (feature: Feature<Geometry> | RenderFeature, arg: number) => {
            const olStyles = new OlStyles();
            const styles = olStyles.createStyles((feature.getProperties().type as IMapFeatureType).styles);
            const labelStyle = olStyles.createLabelStyle(
                feature.get('name'),
                feature.get('icon'),
                styles.length + 1,
                feature.getGeometry()
            );
            return [...styles, labelStyle];
        };
    }

    createStyles = (styles: ITypeStyle[][]): Style[] => {
        const newStyles: Style[] = [];

        styles.forEach((style, i) => {
            const createdStyle = new Style({ zIndex: i });

            for (const option of style) {
                if (option.type == StyleType.FILL) {
                    const fill = new Fill({ ...option });
                    createdStyle.setFill(fill);
                } else if (option.type == StyleType.STROKE) {
                    const stroke = new Stroke({ ...option });
                    createdStyle.setStroke(stroke);
                }
            }

            newStyles.push(createdStyle);
        });

        return newStyles;
    };

    createLabelStyle = (name: string, icon: string, zIndex: number, geometry: Geometry | RenderFeature | undefined): Style => {
        let point;

        switch (geometry?.getType()) {
            case GeometryType.MULTI_POLYGON:
                point = (geometry as MultiPolygon)?.getInteriorPoints();
                break;
            case GeometryType.POLYGON:
                point = (geometry as Polygon)?.getInteriorPoint();
                break;
        }

        return new Style({
            geometry: point,
            text: new Text({
                text: name,
                font: '14px Calibri,sans-serif',
                fill: new Fill({ color: '#000' }),
                stroke: new Stroke({
                    color: '#fff',
                    width: 2
                })
            }),
            // image: new Icon({
            //     src: 'https://flagcdn.com/256x192/za.png' ?? 'https://flagcdn.com/w20/aq.png', //'https://flagcdn.com/w20/aq.png'
            //     crossOrigin: '',
            //     anchor: [0.5, -1.5]
            // }),
            zIndex: zIndex
        });
    };

    createTextStyle = (name: string) => {
        return new Style({
            text: new Text({
                text: name,
                font: '14px Calibri,sans-serif',
                fill: new Fill({ color: '#000' }),
                stroke: new Stroke({
                    color: '#fff',
                    width: 2
                })
            })
        });
    };
}
