import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ErrorBox } from '../../components/ErrorBox';
import MapService from '../../services/map.service';
import { mapStore } from '../../store/map.store';
import { LayerData } from './components/layers/LayerData';
import { LayerSelect } from './components/layers/LayerSelect';
import { LayerUsers } from './components/layers/LayerUsers';
import { MainMap } from './components/MainMap';
import { WidgetAccountBox } from './components/widgets/WidgetAccountBox';
import { WidgetEditorBox } from './components/widgets/WidgetEditorBox';
import { WidgetPreviewBox } from './components/widgets/WidgetPreviewBox';
import { WidgetSearchBox } from './components/widgets/WidgetSearchBox';
import { WidgetToolBox } from './components/widgets/WidgetToolBox';
import { WidgetUsersBox } from './components/widgets/WidgetUsersBox';
import { WidgetCategoriesBox } from './components/widgets/WidgetCategoriesBox';
import './styles/Main.scss';

const Main = () => {
    console.log('Main');

    /**
     * Получение данных карты из url
     */
    mapStore.parseUrl(useLocation().search);

    return (
        <div className='main'>
            <MainMap>
                <WidgetSearchBox />
                <WidgetUsersBox />
                <WidgetCategoriesBox />
                <WidgetAccountBox />
                <WidgetToolBox />
                <WidgetPreviewBox />
                <WidgetEditorBox />
                <ErrorBox />
                <LayerData />
                <LayerSelect />
                <LayerUsers />
            </MainMap>
        </div>
    );
};

export default Main;
