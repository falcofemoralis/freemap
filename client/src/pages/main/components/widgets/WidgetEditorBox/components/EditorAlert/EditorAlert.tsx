import { editorStore } from '@/store/editor.store';
import { Alert, Snackbar } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import './EditorAlert.scss';

export const EditorAlert = observer(() => {
  const { t } = useTranslation();

  return (
    <Snackbar open={editorStore.alert} onClose={() => editorStore.toggleAlert()} autoHideDuration={2000}>
      <Alert className='editorAlert' elevation={5} onClose={() => editorStore.toggleAlert()} severity='info' variant='filled'>
        {t('AUTH_REQUIRED')}
      </Alert>
    </Snackbar>
  );
});
