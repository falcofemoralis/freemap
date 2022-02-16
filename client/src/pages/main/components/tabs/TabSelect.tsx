import { CircularProgress, Drawer } from '@mui/material';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import Viewer from 'react-viewer';
import { DRAWER_WIDTH } from '.';
import MapService from '../../../../services/map.service';
import { mapStore } from '../../../../store/map.store';
import { IMapFeature } from '../../../../types/IMapFeature';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; // requires a loader

interface TabSelectProps {
    onClose: () => void;
}

export const TabSelect: React.FC<TabSelectProps> = observer(({ onClose }) => {
    console.log('initTab');

    return (
        <Drawer
            sx={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
                '& .MuiDrawer-paper': { width: DRAWER_WIDTH, p: 3 }
            }}
            anchor='left'
            open={Boolean(mapStore.selectedFeatureId)}
            onClose={onClose}
        >
            {mapStore.selectedFeatureId && <DrawerTab featureId={mapStore.selectedFeatureId} />}
        </Drawer>
    );
});

interface ViewerImage {
    src: string;
    alt: string;
}
interface DrawerTabProps {
    featureId: string;
}
const DrawerTab: React.FC<DrawerTabProps> = ({ featureId }) => {
    const [mapFeature, setMapFeature] = React.useState<IMapFeature | null>(null);

    React.useEffect(() => {
        const fetchData = async () => {
            setMapFeature(await MapService.getMapFeature(featureId));
        };

        fetchData();
    }, []);

    const getViewerImages = (files?: string[]): ViewerImage[] => {
        const images: ViewerImage[] = [];
        if (files) {
            for (const file of files) {
                images.push({ src: file, alt: file });
            }
        }
        console.log(images);

        return images;
    };

    if (mapFeature) {
        return (
            <Box sx={{ mt: 3 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField disabled fullWidth label='Координаты' defaultValue={mapFeature.coordinates} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField disabled fullWidth label='Имя' defaultValue={mapFeature.name} />
                    </Grid>
                </Grid>
                <Carousel>
                    {mapFeature.files?.map(file => (
                        <div key={file}>
                            <img src={file} />
                            <p className='legend'>Legend 1</p>
                        </div>
                    ))}
                </Carousel>
                {/* <Viewer
                    visible={false}
                    images={[
                        {
                            src: 'https://ucb80a6a4a2604d29742aee5e284.dl.dropboxusercontent.com/cd/0/get/Bf0HLPCYk6ufS0XR3_ZIgx4TczPwZhH75gLl1veRlKjZtn2xl8SK4SjsnpsTC0W-VzTk_G3mI8uoihtrFUq3qSi8n5h6gS3-pxUZMBUALC5S04PMbdOPTDtJ-32235O1BJCZT5NihWJxloemWmpjdDkY/file'
                        }
                    ]}
                /> */}
            </Box>
        );
    } else {
        return <CircularProgress />;
    }
};
