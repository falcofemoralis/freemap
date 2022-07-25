import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { Fade, IconButton, Paper, Popper, Typography } from '@mui/material';
import React from 'react';
import './MapsDeck.scss';

export const MapsDeck = () => {
  const [open, setOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!open) {
      setAnchorEl(event.currentTarget);
      setOpen(true);
    } else {
      setAnchorEl(null);
      setOpen(false);
    }
  };

  return (
    <>
      <Popper open={open} anchorEl={anchorEl} placement='top' transition>
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper>
              <Typography sx={{ p: 2 }}>The content of the Popper.</Typography>
            </Paper>
          </Fade>
        )}
      </Popper>
      <Paper className='mapsDeckBox' elevation={5}>
        <IconButton sx={{ height: 30 }} onClick={handleClick}>
          <ArrowDropUpIcon />
        </IconButton>
      </Paper>
    </>
  );
};
