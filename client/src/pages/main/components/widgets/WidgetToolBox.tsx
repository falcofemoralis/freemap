import * as React from 'react';
import { IconButton, Paper } from '@mui/material';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import GpsFixedOutlinedIcon from '@mui/icons-material/GpsFixedOutlined';
import StraightenOutlinedIcon from '@mui/icons-material/StraightenOutlined';
import ArchitectureOutlinedIcon from '@mui/icons-material/ArchitectureOutlined';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';

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
