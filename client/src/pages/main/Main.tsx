import mapboxgl from 'mapbox-gl';
import React from 'react';
import { ErrorBox } from '../../components/ErrorBox';
import { MapProvider } from '../../MapProvider';
import { Logger } from '../../misc/Logger';
import { LayerUsers } from './components/layers/LayerUsers';
import { MainMap } from './components/MainMap';
import { TabSelect } from './components/tabs/TabSelect';
import { WidgetAccountBox } from './components/widgets/WidgetAccountBox';
import { WidgetCategoriesBox } from './components/widgets/WidgetCategoriesBox';
import { WidgetEditorBox } from './components/widgets/WidgetEditorBox';
import { WidgetPreviewBox } from './components/widgets/WidgetPreviewBox';
import { WidgetSearchBox } from './components/widgets/WidgetSearchBox';
import { WidgetToolBox } from './components/widgets/WidgetToolBox';
import { WidgetUsersBox } from './components/widgets/WidgetUsersBox';
import './styles/Main.scss';

const Main = () => {
  Logger.info('Main');

  const [map, setMap] = React.useState<mapboxgl.Map>();

  return (
    <div className='main' id='main'>
      <MainMap onLoaded={setMap} />
      {map && (
        <MapProvider mainMap={map}>
          <WidgetSearchBox />
          <WidgetUsersBox />
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
