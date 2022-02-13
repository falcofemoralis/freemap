import ArchitectureOutlinedIcon from '@mui/icons-material/ArchitectureOutlined';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import GpsFixedOutlinedIcon from '@mui/icons-material/GpsFixedOutlined';
import StraightenOutlinedIcon from '@mui/icons-material/StraightenOutlined';
import { IconButton, Paper } from '@mui/material';
import * as React from 'react';

export const WidgetToolBox = () => {
    return (
        <>
            <Paper className='toolBox__compass'>
                <IconButton>
                    <ExploreOutlinedIcon />
                </IconButton>
            </Paper>
            <Paper className='toolBox__z'>
                <IconButton>
                    <ArchitectureOutlinedIcon />
                </IconButton>
            </Paper>
            <Paper className='toolBox__ruler'>
                <IconButton>
                    <StraightenOutlinedIcon />
                </IconButton>
            </Paper>
            <Paper className='toolBox__geolocation'>
                <IconButton>
                    <GpsFixedOutlinedIcon />
                </IconButton>
            </Paper>
        </>
    );
};
