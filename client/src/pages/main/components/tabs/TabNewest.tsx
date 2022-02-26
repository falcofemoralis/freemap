import { CardActionArea, Drawer } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import { DRAWER_WIDTH } from './index';
import React from 'react';
import MapService from '../../../../services/map.service';
import { Coordinate, IMapFeature } from '../../../../types/IMapFeature';
import { FileType } from '../../../../constants/file.type';
import { MapContext } from '../../../../MapProvider';
import { fromLonLat } from 'ol/proj';
import { getCenter } from '../../../../utils/CoordinatesUtil';

interface TabNewestProps {
    open: boolean;
    onClose: () => void;
}
export const TabNewest: React.FC<TabNewestProps> = ({ open, onClose }) => {
    const { map } = React.useContext(MapContext);
    const [newestFeatures, setNewestFeatures] = React.useState<Array<IMapFeature>>([]);

    if (open) {
        MapService.getNewestFeatures(20).then(features => setNewestFeatures(features));
    }

    const flyTo = (coordinates: Coordinate[], zoom: number) => {
        const location = getCenter(coordinates);
        const duration = 2000;
        const view = map?.getView();

        view?.animate({
            center: fromLonLat([location.lon, location.lat]),
            duration: duration
        });
        view?.animate(
            {
                zoom: zoom - 1,
                duration: duration / 2
            },
            {
                zoom: zoom,
                duration: duration / 2
            }
        );
    };

    return (
        <Drawer
            sx={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
                '& .MuiDrawer-paper': { width: DRAWER_WIDTH, p: 3 }
            }}
            anchor='left'
            open={open}
            onClose={onClose}
        >
            <List sx={{ width: '100%' }}>
                {newestFeatures.map(feature => (
                    <ListItem key={feature.id}>
                        <Card sx={{ width: '100%' }} onClick={() => flyTo(feature.coordinates, feature.zoom)}>
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
        </Drawer>
    );
};
