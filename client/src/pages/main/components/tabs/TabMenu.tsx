import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import FeedOutlinedIcon from '@mui/icons-material/FeedOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { Divider, Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import React from 'react';
import { TabAdmin } from './TabAdmin';
import { TabNewest } from './TabNewest';

interface TabMenuProps {
    open: boolean;
    onClose: () => void;
}

enum MenuItem {
    NEWEST
}

export const TabMenu: React.FC<TabMenuProps> = ({ open, onClose }) => {
    console.log('TabMenu');
    const [menuItem, setMenuItem] = React.useState<MenuItem | null>(null);
    const handleOpen = (item: MenuItem) => setMenuItem(item);
    const handleClose = () => setMenuItem(null);

    return (
        <>
            <Drawer
                sx={{
                    width: 320,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': { width: 320, p: 3 }
                }}
                anchor='left'
                open={open}
                onClose={onClose}
            >
                <List>
                    <ListItem button onClick={() => handleOpen(MenuItem.NEWEST)}>
                        <ListItemIcon>{<FeedOutlinedIcon />}</ListItemIcon>
                        <ListItemText primary={'Новинки'} />
                    </ListItem>
                    <ListItem button>
                        <ListItemIcon>{<HomeOutlinedIcon />}</ListItemIcon>
                        <ListItemText primary={'Главная'} />
                    </ListItem>
                    <ListItem button>
                        <ListItemIcon>{<CategoryOutlinedIcon />}</ListItemIcon>
                        <ListItemText primary={'Категории'} />
                    </ListItem>
                    <ListItem button>
                        <ListItemIcon>{<AssignmentTurnedInOutlinedIcon />}</ListItemIcon>
                        <ListItemText primary={'Проверка'} />
                    </ListItem>
                </List>
                <Divider />
                <ListItem button>
                    <ListItemIcon>{<SettingsOutlinedIcon />}</ListItemIcon>
                    <ListItemText primary={'Настройки'} />
                </ListItem>
            </Drawer>
            <TabAdmin />
            <TabNewest open={menuItem == MenuItem.NEWEST} onClose={handleClose} />
        </>
    );
};
