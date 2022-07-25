import { CustomDrawer } from '@/components/CustomDrawer/CustomDrawer';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import FeedOutlinedIcon from '@mui/icons-material/FeedOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TabNewest } from '../TabNewest/TabNewest';

enum MenuItem {
  NEWEST
}

interface TabMenuProps {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
}
export const TabMenu: React.FC<TabMenuProps> = ({ open, onClose, onOpen }) => {
  const { t } = useTranslation();

  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);

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
            <ListItemText primary={t('NEWEST')} />
          </ListItem>
          <ListItem button>
            <ListItemIcon>{<HomeOutlinedIcon />}</ListItemIcon>
            <ListItemText primary={t('HOME')} />
          </ListItem>
          <ListItem button>
            <ListItemIcon>{<CategoryOutlinedIcon />}</ListItemIcon>
            <ListItemText primary={t('CATEGORIES')} />
          </ListItem>
          <ListItem button>
            <ListItemIcon>{<AssignmentTurnedInOutlinedIcon />}</ListItemIcon>
            <ListItemText primary={t('CHECK')} />
          </ListItem>
        </List>
        <Divider />
        <ListItem button>
          <ListItemIcon>{<SettingsOutlinedIcon />}</ListItemIcon>
          <ListItemText primary={t('SETTINGS')} />
        </ListItem>
      </CustomDrawer>
      <TabNewest open={menuItem == MenuItem.NEWEST} onClose={handleClose} onSelect={onClose} />
    </>
  );
};
