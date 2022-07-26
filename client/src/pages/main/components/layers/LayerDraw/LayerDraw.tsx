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
import React, { useContext, useState } from 'react';

interface LayerDrawProps {
  onCancel: () => void;
}
export const LayerDraw: React.FC<LayerDrawProps> = observer(({ onCancel }) => {
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
      //const bboxes: number[][] = []; // for test

      for (const feature of features) {
        coordinates.push((feature.geometry as Polygon).coordinates);
        //bboxes.push(bbox(feature.geometry as Polygon));
      }

      editorStore.setCreatedGeometry({ type: GeometryConstant.MULTI_POLYGON, coordinates });
      //console.log(JSON.stringify(bboxes));
    } else if (editorStore.drawMode == GeometryConstant.MULTI_LINE_STRING) {
      const coordinates: Position[][] = [];

      for (const feature of features) {
        coordinates.push((feature.geometry as LineString).coordinates);
      }

      editorStore.setCreatedGeometry({ type: GeometryConstant.MULTI_LINE_STRING, coordinates });
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

    const escapeListener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
        setDraw(null);
        mainMap?.removeControl(mapboxDraw);
        window.removeEventListener('keyup', escapeListener);
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
