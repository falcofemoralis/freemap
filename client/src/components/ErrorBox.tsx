import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { errorStore } from '../store/error.store';
import { observer } from 'mobx-react-lite';

export const ErrorBox = observer(() => {
    const handleClose = () => (errorStore.message = null);

    return (
        <Snackbar open={Boolean(errorStore.message)} autoHideDuration={6000} onClose={handleClose}>
            <MuiAlert elevation={6} onClose={handleClose} severity='error' sx={{ width: '100%' }} variant='filled'>
                {errorStore.message}
            </MuiAlert>
        </Snackbar>
    );
});
