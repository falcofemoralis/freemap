import { ErrorBox } from '@/components/ErrorBox/ErrorBox';
import mapboxgl from 'mapbox-gl';
import React from 'react';
import { MainMap } from './components/map/MainMap/MainMap';
import { MapProvider } from './components/map/MapProvider';
import { TabSelect } from './components/tabs/TabSelect/TabSelect';
import { WidgetAccountBox } from './components/widgets/WidgetAccountBox/WidgetAccountBox';
import { WidgetCategoriesBox } from './components/widgets/WidgetCategoriesBox/WidgetCategoriesBox';
import { WidgetEditorBox } from './components/widgets/WidgetEditorBox/WidgetEditorBox';
import { WidgetPreviewBox } from './components/widgets/WidgetPreviewBox/WidgetPreviewBox';
import { WidgetSearchBox } from './components/widgets/WidgetSearchBox/WidgetSearchBox';
import { WidgetToolBox } from './components/widgets/WidgetToolBox/WidgetToolBox';
import './Main.scss';

const Main = () => {
  const [map, setMap] = React.useState<mapboxgl.Map>();

  return (
    <div className='main' id='main'>
      <MainMap onLoaded={setMap} />
      {map && (
        <MapProvider mainMap={map}>
          <WidgetSearchBox />
          {/* <WidgetUsersBox /> */}
          <WidgetCategoriesBox />
          <WidgetAccountBox />
          <WidgetToolBox />
          <WidgetPreviewBox />
          <WidgetEditorBox />
          <TabSelect />
          <ErrorBox />
          {/* <LayerUsers /> */}
        </MapProvider>
      )}
    </div>
  );
};

export default Main;
