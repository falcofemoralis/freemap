import { Autocomplete, Box, SxProps, TextField, Theme } from '@mui/material';
import React from 'react';
import { GeometryType } from '../constants/geometry.type';
import { IMapFeatureType } from '../types/IMapFeatureType';

interface AutocompleteTypeProps {
    error?: boolean;
    helperText?: string;
    onChange: (type: IMapFeatureType | null) => void;
    featureTypes: IMapFeatureType[];
    selectedGeometry: GeometryType | string | undefined | null;
    selectedType?: IMapFeatureType | undefined | null;
    sx?: SxProps<Theme> | undefined;
}
export const AutocompleteType: React.FC<AutocompleteTypeProps> = ({
    error,
    helperText,
    onChange,
    featureTypes,
    selectedGeometry,
    selectedType,
    sx
}) => {
    return (
        <Autocomplete
            sx={{ ...sx }}
            options={featureTypes}
            autoHighlight
            defaultValue={selectedType}
            getOptionLabel={type => type.name}
            onChange={(event, value) => onChange(value)}
            renderOption={(props, type) =>
                type.geometry == selectedGeometry && (
                    <Box component='li' sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                        <img
                            loading='lazy'
                            width='20'
                            src={`https://flagcdn.com/w20/aq.png`}
                            srcSet={`https://flagcdn.com/w40/aq.png 2x`}
                            alt=''
                        />
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
                    label='Категория'
                    inputProps={{
                        ...params.inputProps,
                        autoComplete: 'type' // disable autocomplete and autofill
                    }}
                />
            )}
        />
    );
};
