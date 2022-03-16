import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import CheckIcon from '@mui/icons-material/Check';
import { Box, IconButton } from '@mui/material';
import { LineString, Polygon, Position } from 'geojson';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { GeometryType } from '../../../../constants/geometry.type';
import { MapContext } from '../../../../MapProvider';
import { Logger } from '../../../../misc/Logger';
import { editorStore } from '../../../../store/editor.store';
import { Coordinates, ICreatedMapFeature } from '../../../../types/IMapFeature';
import '../../styles/Widget.scss';

interface LayerDrawProps {
  onFinish: (feature: Partial<ICreatedMapFeature>) => void;
  onCancel: () => void;
}
export const LayerDraw: React.FC<LayerDrawProps> = observer(({ onFinish, onCancel }) => {
  Logger.info('LayerDraw');

  const { mainMap } = React.useContext(MapContext);
  const [draw, setDraw] = React.useState<MapboxDraw | null>(null);

  /**
   * Завершение создания объекта
   */
  const completeDrawing = () => {
    const features = draw?.getAll().features;
    let coordinates: Coordinates = [];

    if (features) {
      /**
       * Преобразование координат с разных типов геометрии. Например преобразование координат нескольких фич Polygon в вид координат Multi_Polygon
       */
      for (const feature of features) {
        const geometryType = editorStore.selectedFeatureType?.geometry as GeometryType;

        switch (geometryType) {
          case GeometryType.POLYGON:
            coordinates = (feature.geometry as Polygon).coordinates;
            break;
          case GeometryType.MULTI_POLYGON:
            (coordinates as Position[][][]).push((feature.geometry as Polygon).coordinates);
            break;
          case GeometryType.MULTI_LINE_STRING:
            (coordinates as Position[][]).push((feature.geometry as LineString).coordinates);
            break;
        }
      }

      if (editorStore.selectedFeatureType) {
        const createdFeature: Partial<ICreatedMapFeature> = {
          type: editorStore.selectedFeatureType,
          coordinates
        };

        onFinish(createdFeature);
      }
    }
  };

  /**
   * Инициализация объекта draw если режим создания был включен
   */
  if (editorStore.isDrawing && !draw) {
    let isLine = false;
    let isPolygon = false;
    let mode;

    /**
     * Определение режима рисования по выбранной геометрии
     */
    switch (editorStore.selectedFeatureType?.geometry) {
      case GeometryType.POLYGON:
        mode = 'draw_polygon';
        break;
      case GeometryType.MULTI_LINE_STRING:
        mode = 'draw_line_string';
        isLine = true;
        break;
      case GeometryType.MULTI_POLYGON:
        isPolygon = true;
        mode = 'draw_polygon';
        break;
    }

    const mapboxDraw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        line_string: isLine,
        polygon: isPolygon,
        trash: true
      },
      defaultMode: mode
    });
    mainMap?.addControl(mapboxDraw, 'bottom-right');

    /**
     * Листенер на кнопку Esq для отмены создания объекта
     */
    const escapeListener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (mapboxDraw) {
          onCancel();
          try {
            mainMap?.removeControl(mapboxDraw);
          } catch (e) {
            // skip
          }
          setDraw(null);

          window.removeEventListener('keyup', escapeListener);
        }
      }
    };
    window.addEventListener('keyup', escapeListener);

    setDraw(mapboxDraw);
  } else if (!editorStore.isDrawing && draw) {
    /**
     * Если объекта draw существует и режим создания был выключен - удалить объект draw
     */
    mainMap?.removeControl(draw);
    setDraw(null);
  }

  return (
    <>
      {editorStore.isDrawing && (
        <Box>
          {/* <IconButton className='editorBtn' size='large' onClick={undo}>
            <UndoIcon />
          </IconButton>
          <IconButton className='editorBtn' size='large' onClick={redo}>
            <RedoIcon />
          </IconButton> */}
          <IconButton className='editorBtn' size='large' onClick={completeDrawing}>
            <CheckIcon />
          </IconButton>
        </Box>
      )}
    </>
  );
});
