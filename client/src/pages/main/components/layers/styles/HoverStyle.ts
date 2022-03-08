import { Fill, Stroke, Style } from 'ol/style';

export const HoverStyle = new Style({
    zIndex: 0,
    fill: new Fill({
        color: 'rgba(229,229,229,0.35)'
    }),
    stroke: new Stroke({
        color: '#26bae8',
        width: 5
    })
});
