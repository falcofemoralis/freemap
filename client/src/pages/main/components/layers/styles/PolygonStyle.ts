import { Fill, Stroke, Style } from 'ol/style';

export const PolygonStyle = new Style({
    fill: new Fill({
        color: 'rgba(255, 255, 255, 0.2)'
    }),
    stroke: new Stroke({
        color: '#ffcc33',
        width: 2
    })
});
