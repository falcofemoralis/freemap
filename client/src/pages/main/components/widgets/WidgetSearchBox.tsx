import * as React from 'react';
import '../../styles/Widget.scss';
import { Box } from '@mui/material';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsIcon from '@mui/icons-material/Directions';

export const WidgetSearchBox = () => {
    return (
        <Box className='searchBox'>
            <Paper className='searchBox__paper' component='form' sx={{ p: '2px 4px', display: 'flex', alignItems: 'center' }}>
                <IconButton sx={{ p: '10px' }} aria-label='menu'>
                    <MenuIcon />
                </IconButton>
                <InputBase sx={{ ml: 1, flex: 1 }} placeholder='Search Open Free Map' inputProps={{ 'aria-label': 'search google maps' }} />
                <IconButton type='submit' sx={{ p: '10px' }} aria-label='search'>
                    <SearchIcon />
                </IconButton>
                <Divider sx={{ height: 28, m: 0.5 }} orientation='vertical' />
                <IconButton color='primary' sx={{ p: '10px' }} aria-label='directions'>
                    <DirectionsIcon />
                </IconButton>
            </Paper>
        </Box>
    );
};
