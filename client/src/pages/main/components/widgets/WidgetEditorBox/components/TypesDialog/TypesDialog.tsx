import { FeatureTypesAutocomplete } from '@/components/AutocompleteType/AutocompleteType';
import { editorStore } from '@/store/editor.store';
import { IMapFeatureType } from '@/types/IMapFeatureType';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useTranslation } from 'react-i18next';
import './TypesDialog.scss';

interface TypesDialogProps {
  onChange: (type: IMapFeatureType | null) => void;
  onApply: () => void;
  onCancel: () => void;
}
export const TypesDialog: React.FC<TypesDialogProps> = observer(({ onChange, onCancel, onApply }) => {
  const { t } = useTranslation();

  return (
    <Dialog open={Boolean(editorStore.selectedEditType)} onClose={onCancel}>
      <DialogTitle>{t('SELECT_TYPE')}</DialogTitle>
      <DialogContent>
        <FeatureTypesAutocomplete className='typesDialog__autocomplete' onChange={onChange} selectedGeometry={editorStore.selectedEditType} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{t('CANCEL')}</Button>
        <Button onClick={onApply}>{t('SELECT')}</Button>
      </DialogActions>
    </Dialog>
  );
});
