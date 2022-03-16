import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import FeedOutlinedIcon from '@mui/icons-material/FeedOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import React from 'react';
import { CustomDrawer } from '../../../../components/CustomDrawer';
import { Logger } from '../../../../misc/Logger';
import { TabAdmin } from './TabAdmin';
import { TabNewest } from './TabNewest';

interface TabMenuProps {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
}

enum MenuItem {
  NEWEST
}

export const TabMenu: React.FC<TabMenuProps> = ({ open, onClose, onOpen }) => {
  Logger.info('TabMenu');

  const [menuItem, setMenuItem] = React.useState<MenuItem | null>(null);
  const handleOpen = (item: MenuItem) => {
    setMenuItem(item);
    onClose();
  };
  const handleClose = () => {
    setMenuItem(null);
    onOpen();
  };

  return (
    <>
      <CustomDrawer width={320} open={open} onClose={onClose}>
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
      </CustomDrawer>
      <TabAdmin />
      <TabNewest open={menuItem == MenuItem.NEWEST} onClose={handleClose} onSelect={onClose} />
    </>
  );
};
