import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import FeedOutlinedIcon from '@mui/icons-material/FeedOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { Divider, Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import React from 'react';
import { TabAdmin } from './TabAdmin';

interface TabMenuProps {
    open: boolean;
    onClose: () => void;
}

export const TabMenu: React.FC<TabMenuProps> = ({ open, onClose }) => {
    console.log('TabMenu');

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
                    <ListItem button>
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
        </>
    );
};
