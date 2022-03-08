import HomeIcon from '@mui/icons-material/Home';
import LinkIcon from '@mui/icons-material/Link';
import PhoneEnabledIcon from '@mui/icons-material/PhoneEnabled';
import RoomIcon from '@mui/icons-material/Room';
import { Button, CircularProgress, Divider, Tooltip, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; // requires a loader
import Viewer from 'react-viewer';
import { ImageDecorator } from 'react-viewer/lib/ViewerProps';
import { Comments } from '../../../../components/Comments';
import { CustomDrawer } from '../../../../components/CustomDrawer';
import { FileUpload } from '../../../../components/FileUpload';
import { FileType } from '../../../../constants/file.type';
import MapService from '../../../../services/map.service';
import { mapStore } from '../../../../store/map.store';
import { IMapFeature } from '../../../../types/IMapFeature';
import { formatCoordinate, getCenter, toText } from '../../../../utils/CoordinatesUtil';

interface TabSelectProps {
  onClose: () => void;
}

export const TabSelect: React.FC<TabSelectProps> = observer(({ onClose }) => {
  console.log('TabSelect');

  return (
    <CustomDrawer open={Boolean(mapStore.selectedFeatureId)} onClose={onClose} padding={0}>
      {mapStore.selectedFeatureId && <TabSelectDrawer featureId={mapStore.selectedFeatureId} />}
    </CustomDrawer>
  );
});

interface IconFieldProps {
  icon: React.ReactNode;
  text: string;
}
const IconifiedField: React.FC<IconFieldProps> = ({ icon, text }) => {
  const [open, setOpen] = React.useState(false);

  const copy = () => {
    navigator.clipboard.writeText(text).then(() => setOpen(true));
  };
  return (
    <Tooltip
      PopperProps={{
        disablePortal: true
      }}
      onClose={() => setOpen(false)}
      open={open}
      leaveDelay={500}
      title='Copied!'
    >
      <Button onClick={copy} sx={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'flex-start', pl: 3, pr: 3, pt: 1, pb: 1 }}>
        {icon}
        <Typography variant='body1' sx={{ ml: 3, wordBreak: 'break-all', textTransform: 'none', textAlign: 'start', color: 'black' }}>
          {text}
        </Typography>
      </Button>
    </Tooltip>
  );
};

interface DrawerTabProps {
  featureId: string;
}
const TabSelectDrawer: React.FC<DrawerTabProps> = ({ featureId }) => {
  console.log('TabSelectDrawer');

  const [mapFeature, setMapFeature] = React.useState<IMapFeature | null>(null);
  const [viewerOpen, setViewerOpen] = React.useState<boolean>(false);
  const [activeImage, setActiveImage] = React.useState<number | undefined>();

  React.useEffect(() => {
    const fetchData = async () => {
      setMapFeature(await MapService.getMapFeature(featureId));
    };

    fetchData();
  }, []);

  const getViewerImages = (files?: string[]): ImageDecorator[] => {
    const images: ImageDecorator[] = [];
    if (files) {
      for (const file of files) {
        images.push({ src: MapService.getMedia(file, FileType.ORIGINAL) });
      }
    }
    console.log(images);

    return images;
  };

  const openFullImage = (img: string) => {
    setViewerOpen(!viewerOpen);
    const ind = mapFeature?.files?.findIndex(el => el == img);
    console.log(ind);

    setActiveImage(ind);
  };

  if (mapFeature) {
    return (
      <Box>
        <Carousel showThumbs={false} swipeable={true}>
          {mapFeature.files?.map(file => (
            <div key={file} onClick={() => openFullImage(file)} style={{ cursor: 'pointer' }}>
              <img src={MapService.getMedia(file, FileType.THUMBNAIL)} style={{ height: '240px', objectFit: 'cover' }} />
            </div>
          ))}
        </Carousel>
        <Grid container spacing={2} sx={{ p: 3 }}>
          <Grid item xs={12}>
            <Box>
              <Typography variant='caption' gutterBottom>
                {mapFeature.type.name}
              </Typography>
              <Typography variant='h5' gutterBottom>
                {mapFeature.name}
              </Typography>
              <Typography variant='body1' gutterBottom>
                {mapFeature.description}
              </Typography>
              {/* <Typography variant='caption' gutterBottom>
                                2,517 комментариев
                            </Typography> */}
              <Typography variant='caption' gutterBottom>
                {new Date(mapFeature.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Grid>
        </Grid>
        <Divider />
        <Grid container spacing={1} sx={{ mt: 2, mb: 2 }}>
          {mapFeature.address && (
            <Grid item xs={12}>
              <IconifiedField icon={<HomeIcon />} text={mapFeature.address} />
            </Grid>
          )}
          {mapFeature.wiki && (
            <Grid item xs={12}>
              <IconifiedField icon={<LinkIcon />} text={mapFeature.wiki} />
            </Grid>
          )}
          {mapFeature.phone && (
            <Grid item xs={12}>
              <IconifiedField icon={<PhoneEnabledIcon />} text={mapFeature.phone} />
            </Grid>
          )}
          <Grid item xs={12}>
            <IconifiedField icon={<RoomIcon />} text={toText(formatCoordinate(getCenter(mapFeature.coordinates)))} />
          </Grid>
          {mapFeature.links?.map(link => (
            <Grid item xs={12} key={link}>
              <IconifiedField icon={<LinkIcon />} text={link} />
            </Grid>
          ))}
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
            <FileUpload onUpload={files => console.log(files)} />
          </Grid>
        </Grid>
        <Divider />
        <Grid container spacing={2} sx={{ p: 3 }}>
          <Grid item xs={12}>
            <Typography variant='h6'>Комментарии</Typography>
            <Comments comments={mapFeature.comments} featureId={mapFeature.id} />
          </Grid>
        </Grid>
        <Viewer zIndex={5000} activeIndex={activeImage} visible={viewerOpen} images={getViewerImages(mapFeature.files)} onClose={() => setViewerOpen(false)} />
      </Box>
    );
  } else {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }
};
