import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { Drawer, styled, Box } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import React from 'react';

interface CustomDrawerProps {
    open: boolean;
    onClose: () => void;
    width?: number;
    padding?: number;
}

const DrawerHeader = styled('div')(({ theme }) => ({
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
    zIndex: 10,
    right: 5
}));

export const CustomDrawer: React.FC<CustomDrawerProps> = ({ onClose, open, width, children, padding }) => {
    const DRAWER_WIDTH = 420;

    return (
        <Drawer
            sx={{
                width: width ?? DRAWER_WIDTH,
                flexShrink: 0,
                '& .MuiDrawer-paper': { width: width ?? DRAWER_WIDTH }
            }}
            anchor='left'
            open={open}
            onClose={onClose}
        >
            <DrawerHeader>
                <IconButton sx={{ background: '#ffffff45' }} onClick={onClose}>
                    <ChevronLeftIcon />
                </IconButton>
            </DrawerHeader>
            <Box sx={{ p: padding ?? 3 }}>{children}</Box>
        </Drawer>
    );
};
