import { Autocomplete, Box, SxProps, TextField, Theme } from '@mui/material';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { GeometryType } from '../constants/geometry.type';
import { Logger } from '../misc/Logger';
import { editorStore } from '../store/editor.store';
import { IMapFeatureType } from '../types/IMapFeatureType';

interface FeatureTypesAutocompleteProps {
  error?: boolean;
  helperText?: string;
  onChange: (type: IMapFeatureType | null) => void;
  selectedGeometry: GeometryType | string | undefined | null;
  selectedType?: IMapFeatureType | undefined | null;
  sx?: SxProps<Theme> | undefined;
}
export const FeatureTypesAutocomplete: React.FC<FeatureTypesAutocompleteProps> = observer(
  ({ error, helperText, onChange, selectedGeometry, selectedType, sx }) => {
    Logger.info('FeatureTypesAutocomplete');

    if (!editorStore.featureTypes) {
      editorStore.getFeatureTypes();
    }

    const getDefaultValue = () => {
      if (selectedType) {
        return selectedType;
      }

      return null;
    };

    return (
      <Autocomplete
        sx={{ ...sx }}
        options={editorStore.featureTypes ?? []}
        autoHighlight
        defaultValue={getDefaultValue()}
        getOptionLabel={type => type.name}
        onChange={(event, value) => onChange(value)}
        renderOption={(props, type) =>
          type.geometry == selectedGeometry && (
            <Box component='li' sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
              <img loading='lazy' width='20' src={`https://flagcdn.com/w20/aq.png`} srcSet={`https://flagcdn.com/w40/aq.png 2x`} alt='' />
              {type.name}
            </Box>
          )
        }
        renderInput={params => (
          <TextField
            error={error}
            helperText={helperText}
            required
            {...params}
            label='Тип'
            inputProps={{
              ...params.inputProps,
              autoComplete: 'type' // disable autocomplete and autofill
            }}
          />
        )}
      />
    );
  }
);
