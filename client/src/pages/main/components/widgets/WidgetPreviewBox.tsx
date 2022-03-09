import { Paper, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { OverviewMap } from 'ol/control';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import React from 'react';
import MapConstant from '../../../../constants/map.constant';
import { MapContext } from '../../../../MapProvider';
import { mapStore } from '../../../../store/map.store';
import '../../styles/Widget.scss';

const PreviewMapLabel = observer(() => {
  return <>{mapStore.mapType === MapConstant.GOOGLE ? <Typography variant='subtitle2'>Земля</Typography> : <Typography variant='subtitle2'>Карта</Typography>}</>;
});

export const WidgetPreviewBox = () => {
  console.log('WidgetPreviewBox');

  const { map } = React.useContext(MapContext);

  /* Map preview init */
  const baseLayer = new TileLayer();
  const mapPreview = new OverviewMap({
    className: 'previewMap',
    collapsed: false,
    collapsible: false,
    rotateWithView: false
  });

  /**
   * Установка нового слоя превью карты
   * @param {MapConstant} type - тип карты
   */
  const setPreviewMapLayer = (type: MapConstant) => {
    baseLayer.setSource(
      new XYZ({
        url: type as string
      })
    );
  };

  /**
   * Изменение типа текущей карты (Земля\OSM\etc)
   */
  const changeMapType = async () => {
    setPreviewMapLayer((await mapStore.toggleMapType()) as string);
  };

  if (map) {
    mapPreview.getOverviewMap().addLayer(baseLayer);
    mapPreview.setMap(map); // attach main map
    setPreviewMapLayer(mapStore.mapType as string);
  }

  return (
    <Paper className='previewMapBox' elevation={5} onClick={changeMapType}>
      <div className='previewMapBox__label'>
        <PreviewMapLabel />
      </div>
    </Paper>
  );
};
