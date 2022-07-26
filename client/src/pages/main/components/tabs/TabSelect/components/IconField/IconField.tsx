import { Button, Tooltip, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './IconField.scss';

interface IconFieldProps {
  icon: React.ReactNode;
  text: string;
}
export const IconField: React.FC<IconFieldProps> = ({ icon, text }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  /**
   * Copy text to clipboard
   */
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => setOpen(true));
  };

  return (
    <Tooltip
      PopperProps={{
        disablePortal: true
      }}
      onClose={() => setOpen(false)}
      open={open}
      leaveDelay={500}
      title={t('COPIED')}
    >
      <Button className='iconField__button' onClick={copy}>
        {icon}
        <Typography className='iconField__text' variant='body1'>
          {text}
        </Typography>
      </Button>
    </Tooltip>
  );
};
