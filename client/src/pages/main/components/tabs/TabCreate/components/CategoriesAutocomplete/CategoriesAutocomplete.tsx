import { editorStore } from '@/store/editor.store';
import { ICategory } from '@/types/ICategory';
import { Autocomplete, Box, TextField } from '@mui/material';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface CategoriesAutocompleteProps {
  errorText: string;
  onChange: (type: ICategory) => void;
}
export const CategoriesAutocomplete: React.FC<CategoriesAutocompleteProps> = observer(({ errorText, onChange }) => {
  const { t } = useTranslation();

  if (!editorStore.categories) {
    editorStore.getCategories();
  }

  return (
    <Autocomplete
      options={editorStore.categories ?? []}
      autoHighlight
      getOptionLabel={type => type.name}
      onChange={(event, value) => value && onChange(value)}
      renderOption={(props, type) => (
        <Box component='li' sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
          <img loading='lazy' width='20' src={`https://flagcdn.com/w20/aq.png`} srcSet={`https://flagcdn.com/w40/aq.png 2x`} alt='' />
          {type.name}
        </Box>
      )}
      renderInput={params => (
        <TextField
          error={Boolean(errorText)}
          helperText={errorText}
          {...params}
          label={t('CATEGORY')}
          inputProps={{
            ...params.inputProps,
            autoComplete: 'type' // disable autocomplete and autofill
          }}
        />
      )}
    />
  );
});
