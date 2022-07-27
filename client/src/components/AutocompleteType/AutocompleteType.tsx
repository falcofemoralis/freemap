import { GeometryConstant } from '@/constants/geometry.type';
import { IFeatureType } from '@/types/IFeatureType';
import { Autocomplete, Box, SxProps, TextField, Theme } from '@mui/material';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import MapService from '../../services/map.service';

interface FeatureTypesAutocompleteProps {
  className?: string;
  error?: boolean;
  helperText?: string;
  onChange: (type: IFeatureType | null) => void;
  drawMode: GeometryConstant | string | undefined | null;
  defaultValue?: IFeatureType | undefined | null;
  sx?: SxProps<Theme> | undefined;
}
export const FeatureTypesAutocomplete: React.FC<FeatureTypesAutocompleteProps> = observer(
  ({ className, error, helperText, onChange, drawMode, defaultValue, sx }) => {
    const { t } = useTranslation();
    const [featureTypes, setFeatureTypes] = useState<IFeatureType[] | null>(null);

    if (!featureTypes) {
      MapService.getFeatureTypes().then(types => setFeatureTypes(types));
    }

    const getDefaultValue = () => {
      if (defaultValue) {
        return defaultValue;
      }

      return null;
    };

    return (
      <Autocomplete
        className={className}
        sx={{ ...sx }}
        options={featureTypes ?? []}
        autoHighlight
        defaultValue={getDefaultValue()}
        getOptionLabel={type => type.name}
        onChange={(_, value) => onChange(value)}
        renderOption={(props, type) =>
          type.geometry == drawMode && (
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
            label={t('TYPE')}
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
