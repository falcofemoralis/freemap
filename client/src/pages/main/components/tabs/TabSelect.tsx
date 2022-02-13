import { Drawer, Alert } from '@mui/material';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { errorStore } from '../../../../store/error.store';
import { FC, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { authStore } from '../../../../store/auth.store';
import { EditSharp } from '@mui/icons-material';
import { editorStore } from '../../../../store/editor.store';
import { mapStore } from '../../../../store/map.store';
import MapService from '../../../../services/map.service';
import { IMapFeature } from '../../../../types/IMapFeature';

const drawerWidth = 324;

interface TabSelectProps {
    featureId: string;
    onClose: () => void;
}

export const TabSelect: FC<TabSelectProps> = ({ onClose, featureId }) => {
    const [mapFeature, setMapFeature] = useState<IMapFeature | null>(null);
    useEffect(() => {
        const anyNameFunction = async () => {
            setMapFeature(await MapService.getMapFeature(featureId));
        };

        // Execute the created function directly
        anyNameFunction();
    }, []);

    console.log(mapFeature);

    return (
        <Drawer
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': { width: drawerWidth, p: 3 }
            }}
            anchor='left'
            open={true}
            onClose={onClose}
        >
            {mapFeature && (
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
            )}
        </Drawer>
    );
};
function useFetch(arg0: string, arg1: { headers: { accept: string } }): { data: any; error: any } {
    throw new Error('Function not implemented.');
}

function useAsync(arg0: { promiseFn: any; id: any }): { data: any; error: any } {
    throw new Error('Function not implemented.');
}
