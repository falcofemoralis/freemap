import { GeometryConstant } from '@/constants/geometry.type';
import { MapContext } from '@/MapContext';
import '@/pages/main/components/widgets/WidgetEditorBox/WidgetEditorBox.scss';
import { editorStore } from '@/store/editor.store';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import CheckIcon from '@mui/icons-material/Check';
import { Box, IconButton } from '@mui/material';
import { LineString, Polygon, Position } from 'geojson';
import { observer } from 'mobx-react-lite';
import React, { useContext, useEffect, useState } from 'react';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';

interface LayerDrawProps {
  onCancel: () => void;
  onComplete: () => void;
}
export const LayerDraw: React.FC<LayerDrawProps> = observer(({ onCancel, onComplete }) => {
  console.log('LayerDraw');

  const { mainMap } = useContext(MapContext);
  const [draw, setDraw] = useState<MapboxDraw | null>(null);

  /**
   * Handle complete feature creation
   */
  const onCompleteDrawing = () => {
    const features = draw?.getAll().features;
    if (!features) {
      return;
    }

    if (editorStore.drawMode == GeometryConstant.POLYGON) {
      const coordinates = (features[0].geometry as Polygon).coordinates;
      editorStore.setCreatedGeometry({ type: GeometryConstant.POLYGON, coordinates });
    } else if (editorStore.drawMode == GeometryConstant.MULTI_POLYGON) {
      const coordinates: Position[][][] = [];

      for (const feature of features) {
        coordinates.push((feature.geometry as Polygon).coordinates);
      }

      editorStore.setCreatedGeometry({ type: GeometryConstant.MULTI_POLYGON, coordinates });
    } else if (editorStore.drawMode == GeometryConstant.MULTI_LINE_STRING) {
      const coordinates: Position[][] = [];

      for (const feature of features) {
        const lineCoordinates = (feature.geometry as LineString).coordinates;
        lineCoordinates.pop();
        coordinates.push(lineCoordinates);
      }

      editorStore.setCreatedGeometry({ type: GeometryConstant.MULTI_LINE_STRING, coordinates });
    }

    onComplete();
  };

  /**
   * Init key listener
   */
  useEffect(() => {
    const escapeListener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      } else if (event.key === 'p') {
        draw?.changeMode('draw_polygon');
      }
    };
    window.addEventListener('keyup', escapeListener);

    return () => {
      if (draw) {
        mainMap?.removeControl(draw);
      }
      window.removeEventListener('keyup', escapeListener);
    };
  }, [draw]);

  /**
   * Init draw object if drawing is active
   */
  if (!draw) {
    let isLine = false;
    let isPolygon = false;
    let mode;

    /**
     * Detect drawing mode by selected geometry
     */
    switch (editorStore.drawMode) {
      case GeometryConstant.POLYGON:
        mode = 'draw_polygon';
        break;
      case GeometryConstant.MULTI_LINE_STRING:
        mode = 'draw_line_string';
        isLine = true;
        break;
      case GeometryConstant.MULTI_POLYGON:
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

    setDraw(mapboxDraw);
  }

  return (
    <Box>
      <IconButton className='editorBtn' size='large' onClick={onCancel}>
        <HighlightOffIcon />
      </IconButton>
      <IconButton className='editorBtn' size='large' onClick={() => console.log('undo')}>
        <UndoIcon />
      </IconButton>
      <IconButton className='editorBtn' size='large' onClick={() => console.log('redo')}>
        <RedoIcon />
      </IconButton>
      <IconButton className='editorBtn' size='large' onClick={onCompleteDrawing}>
        <CheckIcon />
      </IconButton>
    </Box>
  );
});
