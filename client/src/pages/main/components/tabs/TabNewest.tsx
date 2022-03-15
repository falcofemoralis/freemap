import { CardActionArea } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import React from 'react';
import { CustomDrawer } from '../../../../components/CustomDrawer';
import { FileType } from '../../../../constants/file.type';
import { GeometryType } from '../../../../constants/geometry.type';
import { MapContext } from '../../../../MapProvider';
import { getCenter } from '../../../../misc/CoordinatesUtils';
import MapService from '../../../../services/map.service';
import { Coordinates, IMapFeature } from '../../../../types/IMapFeature';
import { Logger } from '../../../../misc/Logger';

interface TabNewestProps {
  open: boolean;
  onClose: () => void;
}
export const TabNewest: React.FC<TabNewestProps> = ({ open, onClose }) => {
  Logger.info('TabNewest');

  const { mainMap } = React.useContext(MapContext);
  const [newestFeatures, setNewestFeatures] = React.useState<Array<IMapFeature>>([]);

  /**
   * Если вкладка была открыта - получение последних {n} фич
   */
  if (open) {
    MapService.getNewestFeatures(20).then(features => setNewestFeatures(features));
  }

  // TODO Add zoom
  /**
   * Выбор фичи и перенаправление карты на нее
   * @param coordinates - координаты выбранной фичи
   * @param type - тип выбранной фичи
   */
  const selectFeature = (coordinates: Coordinates, type: GeometryType) => {
    mainMap?.flyTo({
      center: getCenter(coordinates, type)
    });
  };

  return (
    <CustomDrawer open={open} onClose={onClose}>
      <List sx={{ width: '100%' }}>
        {newestFeatures.map(feature => (
          <ListItem key={feature.id}>
            <Card sx={{ width: '100%' }} onClick={() => selectFeature(feature.coordinates, feature.type.geometry)}>
              <CardActionArea>
                {feature?.files && feature?.files?.length > 0 && (
                  <CardMedia
                    component='img'
                    height='140'
                    image={MapService.getMedia(feature?.files ? feature?.files[0] : '', FileType.THUMBNAIL)}
                    alt={feature.name}
                  />
                )}
                <CardContent>
                  <Typography gutterBottom variant='h5' component='div'>
                    {feature.name} • {new Date(feature.createdAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {feature.description}
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
