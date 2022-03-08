import { Fill, Stroke, Style } from 'ol/style';

export const SelectStyle = new Style({
    zIndex: 0,
    fill: new Fill({
        color: 'rgba(255,0,0,0.17)'
    }),
    stroke: new Stroke({
        color: 'rgba(255,26,26,0.7)',
        width: 2
    })
});
