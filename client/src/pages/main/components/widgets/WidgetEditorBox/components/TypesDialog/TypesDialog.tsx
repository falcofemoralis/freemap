import { FeatureTypesAutocomplete } from '@/components/AutocompleteType/AutocompleteType';
import { editorStore } from '@/store/editor.store';
import { IFeatureType } from '@/types/IFeatureType';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import './TypesDialog.scss';

interface TypesDialogProps {
  open: boolean;
  onApply: (type: IFeatureType | null) => void;
  onCancel: () => void;
}
export const TypesDialog: React.FC<TypesDialogProps> = observer(({ open, onCancel, onApply }) => {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState<IFeatureType | null>(null);

  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{t('SELECT_TYPE')}</DialogTitle>
      <DialogContent>
        <FeatureTypesAutocomplete className='typesDialog__autocomplete' onChange={setSelectedType} drawMode={editorStore.drawMode} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{t('CANCEL')}</Button>
        <Button onClick={() => onApply(selectedType)}>{t('SELECT')}</Button>
      </DialogActions>
    </Dialog>
  );
});
