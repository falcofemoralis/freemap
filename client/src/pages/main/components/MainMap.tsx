import { observe } from 'mobx';
import TileLayer from 'ol/layer/Tile';
import OlMap from 'ol/Map';
import { toLonLat } from 'ol/proj';
import XYZ from 'ol/source/XYZ';
import View from 'ol/View';
import * as React from 'react';
import MapConstant from '../../../constants/map.constant';
import { MapProvider } from '../../../MapProvider';
import { mapStore } from '../../../store/map.store';
import { formatCoordinate, formatZoom } from '../../../utils/CoordinatesUtil';
import { CoordinatesFilter } from './layers/filters/CoordinatesFilter';

const COORDINATES_CHANGE_TIME = 0.25; // Изменение url каждые 250 мс

export const MainMap: React.FC = ({ children }) => {
  console.log('MainMap');

  /* Init map */
  const baseLayer = new TileLayer({
    properties: {
      name: 'Main Map'
    }
  });
  const mapView = new View({
    center: [mapStore.lonLat.lon, mapStore.lonLat.lat],
    zoom: mapStore.zoom,
    projection: 'EPSG:3857'
  });
  const map = new OlMap({
    layers: [baseLayer],
    view: mapView
  });
  const mapTarget = (element: any) => {
    map.setTarget(element);
  };

  /**
   * Установка нового слоя карты
   * @param {MapConstant} type - тип карты (Земля\OSM)
   */
  function setMapLayer(type: MapConstant) {
    baseLayer.setSource(
      new XYZ({
        url: type as string
      })
    );
  }

  /**
   * Отображение курсора на объектах
   */
  map.on('pointermove', event => {
    const pixel = map.getEventPixel(event.originalEvent);
    let hit = false;

    map.forEachFeatureAtPixel(pixel, feature => {
      if (hit) return true;
      const coordinatesFilter = new CoordinatesFilter(map).filter;
      hit = coordinatesFilter(feature);
    });

    map.getViewport().style.cursor = hit ? 'pointer' : '';
  });

  /**
   * Листенер изменения координат. Меняется текущий url с добавление координат и текущего зума
   */
  let pathChanged = false;
  mapView.on('change:center', () => {
    const coordinates = mapView.getCenter();
    const zoom = mapView.getZoom();

    if (!pathChanged) {
      if (coordinates && zoom) {
        //socket.emit('updateActiveUser', { data: { coordinates } });
        const newCoordinates = toLonLat(coordinates, 'EPSG:3857');
        mapStore.updateMapPosition(formatCoordinate(newCoordinates), formatZoom(zoom));
      }

      pathChanged = true;

      setTimeout(() => {
        pathChanged = false;
      }, COORDINATES_CHANGE_TIME * 1000);
    }
  });

  setMapLayer(mapStore.mapType);
  observe(mapStore, 'mapType', change => {
    setMapLayer(change.newValue as string);
  });

  return (
    <>
      <div ref={mapTarget} className='map' />
      <MapProvider map={map}>{children}</MapProvider>
    </>
  );
};
