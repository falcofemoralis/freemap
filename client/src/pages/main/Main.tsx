import React from 'react';
import { useLocation } from 'react-router-dom';
import { ErrorBox } from '../../components/ErrorBox';
import { mapStore } from '../../store/map.store';
import { LayerData } from './components/layers/LayerData';
import { MainMap } from './components/MainMap';
import { WidgetAccountBox } from './components/widgets/WidgetAccountBox';
import { WidgetEditorBox } from './components/widgets/WidgetEditorBox';
import { WidgetPreviewBox } from './components/widgets/WidgetPreviewBox';
import { WidgetSearchBox } from './components/widgets/WidgetSearchBox';
import { WidgetToolBox } from './components/widgets/WidgetToolBox';
import { LayerSelect } from './components/layers/LayerSelect';
import './styles/Main.scss';

const Main = () => {
    /**
     * Получение данных карты из url
     */
    mapStore.parseUrl(useLocation().search);

    return (
        <div className='main'>
            <MainMap>
                <WidgetSearchBox />
                <WidgetAccountBox />
                <WidgetToolBox />
                <WidgetPreviewBox />
                <WidgetEditorBox />
                <ErrorBox />
                <LayerData />
                <LayerSelect />
                {/* 
                <WidgetMenuBox/>*/}
            </MainMap>
        </div>
    );
};

export default Main;
