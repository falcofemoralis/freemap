import DirectionsIcon from '@mui/icons-material/Directions';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import { Box, Divider, IconButton, InputBase, Paper } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { TabMenu } from '../../tabs/TabMenu/TabMenu';
import './WidgetSearchBox.scss';

export const WidgetSearchBox = () => {
  const { t } = useTranslation();

  const [open, setOpen] = React.useState(false);

  const toggleTab = () => {
    setOpen(!open);
  };

  return (
    <Box className='searchBox'>
      <Paper className='searchBox__container' component='form'>
        <IconButton className='searchBox__button' onClick={toggleTab} aria-label='menu'>
          <MenuIcon />
        </IconButton>
        <InputBase className='searchBox__input' placeholder={t('SEARCH_PLACEHOLDER')} />
        <IconButton className='searchBox__button' type='submit' aria-label='search'>
          <SearchIcon />
        </IconButton>
        <Divider className='searchBox__divider' orientation='vertical' />
        <IconButton className='searchBox__button' color='primary' aria-label='directions'>
          <DirectionsIcon />
        </IconButton>
      </Paper>
      <TabMenu open={open} onClose={toggleTab} onOpen={toggleTab} />
    </Box>
  );
};
