import { errorStore } from '@/store/error.store';
import MuiAlert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { observer } from 'mobx-react-lite';

export const ErrorBox = observer(() => {
  const handleClose = () => (errorStore.message = null);

  // autoHideDuration={6000}
  return (
    <Snackbar open={Boolean(errorStore.message)} onClose={handleClose}>
      <MuiAlert elevation={6} onClose={handleClose} severity='error' sx={{ width: '100%' }} variant='filled'>
        {errorStore.message}
      </MuiAlert>
    </Snackbar>
  );
});
