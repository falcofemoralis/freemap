import { Map } from 'ol';
import { fromLonLat } from 'ol/proj';
import { Coordinate } from '../types/IMapFeature';
import { getCenter } from './CoordinatesUtil';

export const flyTo = (coordinates: Coordinate[], zoom: number, map?: Map) => {
    console.log(coordinates);

    const location = getCenter(coordinates);
    const duration = 2000;
    const view = map?.getView();

    view?.animate({
        center: fromLonLat([location.lon, location.lat]),
        duration: duration
    });
    view?.animate(
        {
            zoom: zoom - 1,
            duration: duration / 2
        },
        {
            zoom: zoom,
            duration: duration / 2
        }
    );
};
