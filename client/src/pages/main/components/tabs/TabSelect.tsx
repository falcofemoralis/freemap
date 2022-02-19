import { Button, CircularProgress, Divider, Drawer, TextFieldProps, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; // requires a loader
import { DRAWER_WIDTH } from '.';
import MapService from '../../../../services/map.service';
import { mapStore } from '../../../../store/map.store';
import { IMapFeature } from '../../../../types/IMapFeature';
import RoomIcon from '@mui/icons-material/Room';
import { formatCoordinate, getCenter, toText } from '../../../../utils/CoordinatesUtil';
import { FileUpload } from '../../../../components/FileUpload';
import HomeIcon from '@mui/icons-material/Home';
import LinkIcon from '@mui/icons-material/Link';
import PhoneEnabledIcon from '@mui/icons-material/PhoneEnabled';

interface TabSelectProps {
    onClose: () => void;
}

export const TabSelect: React.FC<TabSelectProps> = observer(({ onClose }) => {
    console.log('TabSelect');

    return (
        <Drawer
            sx={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
                '& .MuiDrawer-paper': { width: DRAWER_WIDTH }
            }}
            anchor='left'
            open={Boolean(mapStore.selectedFeatureId)}
            onClose={onClose}
        >
            {mapStore.selectedFeatureId && <TabSelectDrawer featureId={mapStore.selectedFeatureId} />}
        </Drawer>
    );
});

interface IconFieldProps {
    icon: React.ReactNode;
    text: string;
}
const IconField: React.FC<IconFieldProps> = ({ icon, text }) => {
    return (
        <Button sx={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'flex-start', pl: 3, pr: 3, pt: 1, pb: 1 }}>
            {icon}
            <Typography variant='body1' sx={{ ml: 3, wordBreak: 'break-all', textTransform: 'none', textAlign: 'start', color: 'black' }}>
                {text}
            </Typography>
        </Button>
    );
};

interface ViewerImage {
    src: string;
    alt: string;
}
interface DrawerTabProps {
    featureId: string;
}
const TabSelectDrawer: React.FC<DrawerTabProps> = ({ featureId }) => {
    console.log('TabSelectDrawer');

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
            <Box>
                <Carousel showThumbs={false} swipeable={true}>
                    {mapFeature.files?.map(file => (
                        <div key={file}>
                            <img loading='lazy' src={file} style={{ height: '240px', objectFit: 'cover' }} />
                        </div>
                    ))}
                </Carousel>
                <Grid container spacing={2} sx={{ p: 3 }}>
                    <Grid item xs={12}>
                        <Box>
                            <Typography variant='caption' gutterBottom>
                                {mapFeature.type.name}
                            </Typography>
                            <Typography variant='h5' gutterBottom>
                                {mapFeature.name}
                            </Typography>
                            <Typography variant='body1' gutterBottom>
                                {mapFeature.description}
                            </Typography>
                            <Typography variant='caption' gutterBottom>
                                2,517 комментариев
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
                <Divider />
                <Grid container spacing={1} sx={{ mt: 2, mb: 2 }}>
                    {mapFeature.address && (
                        <Grid item xs={12}>
                            <IconField icon={<HomeIcon />} text={mapFeature.address} />
                        </Grid>
                    )}
                    {mapFeature.wiki && (
                        <Grid item xs={12}>
                            <IconField icon={<LinkIcon />} text={mapFeature.wiki} />
                        </Grid>
                    )}
                    {mapFeature.phone && (
                        <Grid item xs={12}>
                            <IconField icon={<PhoneEnabledIcon />} text={mapFeature.phone} />
                        </Grid>
                    )}
                    <Grid item xs={12}>
                        <IconField icon={<RoomIcon />} text={toText(formatCoordinate(getCenter(mapFeature.coordinates)))} />
                    </Grid>
                    {mapFeature.links?.map(link => (
                        <Grid item xs={12} key={link}>
                            <IconField icon={<LinkIcon />} text={link} />
                        </Grid>
                    ))}
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                        <FileUpload onUpload={files => console.log(files)} />
                    </Grid>
                </Grid>
                <Divider />
                <Grid container spacing={2} sx={{ p: 3 }}>
                    <Grid item xs={12}>
                        <Typography variant='h6'>Комментарии</Typography>
                    </Grid>
                </Grid>
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
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
            </Box>
        );
    }
};
