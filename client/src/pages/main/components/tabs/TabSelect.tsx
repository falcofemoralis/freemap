import HomeIcon from '@mui/icons-material/Home';
import LinkIcon from '@mui/icons-material/Link';
import PhoneEnabledIcon from '@mui/icons-material/PhoneEnabled';
import RoomIcon from '@mui/icons-material/Room';
import { Button, CircularProgress, Divider, Tooltip, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useRef, useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; // requires a loader
import Viewer from 'react-viewer';
import { ImageDecorator } from 'react-viewer/lib/ViewerProps';
import { Comments } from '../../../../components/Comments';
import { CustomDrawer } from '../../../../components/CustomDrawer';
import { FileUpload } from '../../../../components/FileUpload';
import { UserAvatar } from '../../../../components/UserAvatar';
import { FileType } from '../../../../constants/file.type';
import { getCenter, toText } from '../../../../misc/CoordinatesUtils';
import { Logger } from '../../../../misc/Logger';
import MapService from '../../../../services/map.service';
import { authStore } from '../../../../store/auth.store';
import { mapStore } from '../../../../store/map.store';
import { IMapFeature } from '../../../../types/IMapFeature';

export const TabSelect = observer(() => {
  Logger.info('TabSelect');

  const handleTabClose = () => mapStore.setSelectedFeatureId(null);

  return (
    <CustomDrawer open={Boolean(mapStore.selectedFeatureId)} onClose={handleTabClose} padding={0} fullHeight>
      {mapStore.selectedFeatureId && <TabSelectDrawer featureId={mapStore.selectedFeatureId} />}
    </CustomDrawer>
  );
});

interface IconFieldProps {
  icon: React.ReactNode;
  text: string;
}
const IconifiedField: React.FC<IconFieldProps> = ({ icon, text }) => {
  Logger.info('IconifiedField');

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
  Logger.info('TabSelectDrawer');

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
    setActiveImage(ind);
  };

  if (mapFeature) {
    return (
      <Box>
        <Carousel showThumbs={false} swipeable emulateTouch infiniteLoop showStatus={false}>
          {mapFeature.files?.map(file => (
            <div key={file} onClick={() => openFullImage(file)} style={{ cursor: 'pointer' }}>
              <Image src={MapService.getMedia(file, FileType.THUMBNAIL)} style={{ height: '240px', objectFit: 'cover' }} />
            </div>
          ))}
        </Carousel>
        <Grid container spacing={2} sx={{ p: 3 }}>
          <Grid item xs={12}>
            <Box>
              <Typography variant='caption' gutterBottom>
                {mapFeature.type.name}
              </Typography>
              <Typography variant='h5'>{mapFeature.name}</Typography>
              <Typography variant='body2' gutterBottom>
                {new Date(mapFeature.createdAt).toLocaleDateString()}
              </Typography>
              <Typography variant='body1' gutterBottom>
                {mapFeature.description}
              </Typography>
              {/* <Typography variant='caption' gutterBottom>
                2,517 комментариев
              </Typography> */}
              <Box sx={{ display: 'flex' }}>
                <UserAvatar user={mapFeature.user} sx={{ mr: 1 }} type={FileType.THUMBNAIL} />
                <Typography variant='h6' gutterBottom>
                  {mapFeature.user.username}
                </Typography>
              </Box>
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
            <IconifiedField icon={<RoomIcon />} text={toText(getCenter(mapFeature?.coordinates, mapFeature?.type.geometry))} />
          </Grid>
          {mapFeature.links?.map(link => (
            <Grid item xs={12} key={link}>
              <IconifiedField icon={<LinkIcon />} text={link} />
            </Grid>
          ))}
          {authStore.isAuth && (
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
              <FileUpload onUpload={files => console.log(files)} />
            </Grid>
          )}
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

const useImageLoaded = () => {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef();

  const onLoad = () => {
    setLoaded(true);
  };

  useEffect(() => {
    if (ref.current && (ref as any).current.complete) {
      onLoad();
    }
  });

  return [ref, loaded, onLoad];
};

interface ImageProps {
  src: string;
  style: any;
}
const Image: React.FC<ImageProps> = ({ src, style }) => {
  const [ref, loaded, onLoad] = useImageLoaded();

  return (
    <div>
      <img ref={ref as any} onLoad={onLoad as any} src={src} alt='' style={{ ...style, display: loaded ? 'block' : 'none' }} />
      {!loaded && (
        <div style={{ height: style.height, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
        </div>
      )}
    </div>
  );
};
