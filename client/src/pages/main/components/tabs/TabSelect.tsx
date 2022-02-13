import { CircularProgress, Drawer } from '@mui/material';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { observer } from 'mobx-react-lite';
import { FC, useEffect, useState } from 'react';
import MapService from '../../../../services/map.service';
import { mapStore } from '../../../../store/map.store';
import { IMapFeature } from '../../../../types/IMapFeature';

const drawerWidth = 324;
interface TabSelectProps {
    onClose: () => void;
}

export const TabSelect: FC<TabSelectProps> = observer(({ onClose }) => {
    console.log('initTab');

    return (
        <Drawer
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': { width: drawerWidth, p: 3 }
            }}
            anchor='left'
            open={Boolean(mapStore.selectedFeatureId)}
            onClose={onClose}
        >
            {mapStore.selectedFeatureId && <DrawerTab featureId={mapStore.selectedFeatureId} />}
        </Drawer>
    );
});

interface DrawerTabProps {
    featureId: string;
}
const DrawerTab: FC<DrawerTabProps> = ({ featureId }) => {
    const [mapFeature, setMapFeature] = useState<IMapFeature | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setMapFeature(await MapService.getMapFeature(featureId));
        };

        fetchData();
    }, []);

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
            </Box>
        );
    } else {
        return <CircularProgress />;
    }
};
