import { GeometryType } from '@/constants/geometry.type';
import { MapContext } from '@/MapContext';
import '@/pages/main/components/widgets/WidgetEditorBox/WidgetEditorBox.scss';
import { editorStore } from '@/store/editor.store';
import { Coordinates, ICreatedMapFeature } from '@/types/IMapFeature';
import { Logger } from '@/utils/Logger';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import CheckIcon from '@mui/icons-material/Check';
import { Box, IconButton } from '@mui/material';
import bbox from '@turf/bbox';
import { LineString, Polygon, Position } from 'geojson';
import { observer } from 'mobx-react-lite';
import React, { useContext, useState } from 'react';

interface LayerDrawProps {
  onFinish: (feature: Partial<ICreatedMapFeature>) => void;
  onCancel: () => void;
}
export const LayerDraw: React.FC<LayerDrawProps> = observer(({ onFinish, onCancel }) => {
  Logger.info('LayerDraw');

  const { mainMap } = useContext(MapContext);
  const [draw, setDraw] = useState<MapboxDraw | null>(null);

  /**
   * Handle complete feature creation
   */
  const onCompleteDrawing = () => {
    const features = draw?.getAll().features;
    let coordinates: Coordinates = [];
    const bboxes: number[][] = [];

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
            bboxes.push(bbox(feature.geometry as Polygon));
            break;
          case GeometryType.MULTI_LINE_STRING:
            (coordinates as Position[][]).push((feature.geometry as LineString).coordinates);
            break;
        }
      }

      console.log(JSON.stringify(bboxes));

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
   * Init draw object if drawing is active
   */
  if (editorStore.isDrawing && !draw) {
    let isLine = false;
    let isPolygon = false;
    let mode;

    /**
     * Detect drawing mode by selected geometry
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
     * Buttons listener
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
      } else if (event.key === 'p') {
        mapboxDraw.changeMode('draw_polygon');
      }
    };
    window.addEventListener('keyup', escapeListener);

    setDraw(mapboxDraw);
  } else if (!editorStore.isDrawing && draw) {
    mainMap?.removeControl(draw);
    setDraw(null);
  }

  if (editorStore.isDrawing) {
    return (
      <Box>
        {/* <IconButton className='editorBtn' size='large' onClick={undo}>
        <UndoIcon />
      </IconButton>
      <IconButton className='editorBtn' size='large' onClick={redo}>
        <RedoIcon />
      </IconButton> */}
        <IconButton className='editorBtn' size='large' onClick={onCompleteDrawing}>
          <CheckIcon />
        </IconButton>
      </Box>
    );
  } else {
    return null;
  }
});
