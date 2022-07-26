import { CustomDrawer } from '@/components/CustomDrawer/CustomDrawer';
import { FileType } from '@/constants/file.type';
import { MapContext } from '@/MapContext';
import MapService from '@/services/map.service';
import { getCenter } from '@/utils/CoordinatesUtils';
import { Card, CardActionArea, CardContent, CardMedia, List, ListItem, Typography } from '@mui/material';
import React, { useContext, useState } from 'react';
import { FeatureProps, GeometryProp } from '@/types/IMapData';
import { Feature } from 'geojson';
import './TabNewest.scss';

interface TabNewestProps {
  open: boolean;
  onClose: () => void;
  onSelect: () => void;
}
export const TabNewest: React.FC<TabNewestProps> = ({ open, onClose, onSelect }) => {
  const { mainMap } = useContext(MapContext);
  const [newestFeatures, setNewestFeatures] = useState<Array<Feature<GeometryProp, FeatureProps>> | null>(null);

  /**
   * Load latest features on tab open
   */
  if (open && !newestFeatures) {
    MapService.getNewestFeatures(20).then(features => setNewestFeatures(features));
  }

  /**
   * Move camera to feature position
   * @param coordinates - feature coordinates
   * @param type - feature type
   */
  const selectFeature = (feature: Feature<GeometryProp, FeatureProps>) => {
    mainMap?.flyTo({
      center: getCenter(feature.geometry.coordinates, feature.geometry.type),
      zoom: feature.properties.type.layers[0].minzoom + 1
    });
  };

  return (
    <CustomDrawer open={open} onClose={onClose} hideBackdrop>
      <List className='tabNewest__list'>
        {newestFeatures?.map(feature => (
          <ListItem key={feature.id}>
            <Card className='tabNewest__card' onClick={() => selectFeature(feature)}>
              <CardActionArea>
                {feature?.properties.files && feature?.properties.files?.length > 0 && (
                  <CardMedia
                    component='img'
                    height='140'
                    image={`${feature?.properties.files[0].name}?type=${FileType.THUMBNAIL}`}
                    alt={feature?.properties.name}
                  />
                )}
                <CardContent>
                  <Typography gutterBottom variant='h5' component='div'>
                    {feature?.properties.name} • {new Date(feature?.properties.createdAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant='body2' color='text.secondary' noWrap>
                    {feature?.properties.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </ListItem>
        ))}
      </List>
    </CustomDrawer>
  );
};
