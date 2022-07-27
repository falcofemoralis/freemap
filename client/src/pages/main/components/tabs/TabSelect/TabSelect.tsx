import { CustomDrawer } from '@/components/CustomDrawer/CustomDrawer';
import { mapStore } from '@/store/map.store';
import { observer } from 'mobx-react-lite';
import { Comments } from '@/components/Comments/Comments';
import { FileUpload } from '@/components/FileUpload/FileUpload';
import { UserAvatar } from '@/components/UserAvatar/UserAvatar';
import { FileType } from '@/constants/file.type';
import MapService from '@/services/map.service';
import { authStore } from '@/store/auth.store';
import { FeatureProps, GeometryProp } from '@/types/IMapData';
import { IMedia } from '@/types/IMedia';
import { getCenter, toText } from '@/utils/CoordinatesUtils';
import HomeIcon from '@mui/icons-material/Home';
import LinkIcon from '@mui/icons-material/Link';
import PhoneEnabledIcon from '@mui/icons-material/PhoneEnabled';
import RoomIcon from '@mui/icons-material/Room';
import { CircularProgress, Divider, Typography, Box, Grid } from '@mui/material';
import { Feature } from 'geojson';
import React, { useEffect, useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import Viewer from 'react-viewer';
import { ImageDecorator } from 'react-viewer/lib/ViewerProps';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; // requires a loader
import './TabSelect.scss';
import { IconField } from './components/IconField/IconField';
import { Image } from './components/Image/Image';
import { useTranslation } from 'react-i18next';

export const TabSelect = observer(() => {
  const handleTabClose = () => mapStore.setSelectedFeatureId(null);

  return (
    <CustomDrawer open={Boolean(mapStore.selectedFeatureId)} onClose={handleTabClose} padding={0} fullHeight>
      {mapStore.selectedFeatureId && <TabSelectDrawer featureId={mapStore.selectedFeatureId} />}
    </CustomDrawer>
  );
});

interface DrawerTabProps {
  featureId: string;
}
const TabSelectDrawer: React.FC<DrawerTabProps> = ({ featureId }) => {
  const { t } = useTranslation();
  const [mapFeature, setMapFeature] = useState<Feature<GeometryProp, FeatureProps> | null>(null);
  const [viewerOpen, setViewerOpen] = useState<boolean>(false);
  const [activeImage, setActiveImage] = useState<number | undefined>();

  /**
   * Init feature data
   */
  useEffect(() => {
    const fetchData = async () => {
      setMapFeature(await MapService.getMapFeature(featureId));
    };

    fetchData();
  }, []);

  /**
   *
   * @param files
   * @returns
   */
  const getViewerImages = (files?: IMedia[]): ImageDecorator[] => {
    const images: ImageDecorator[] = [];
    if (files) {
      for (const file of files) {
        images.push({ src: file.name });
      }
    }
    return images;
  };

  /**
   *
   * @param img
   */
  const openFullImage = (img: IMedia) => {
    setViewerOpen(!viewerOpen);
    const ind = mapFeature?.properties?.files?.findIndex(el => el.name == img.name);
    setActiveImage(ind);
  };

  /**
   *
   * @param files
   */
  const handleSubmitMedia = (files: IMedia[]) => {
    const mapFeatureTmp = mapFeature;
    if (mapFeatureTmp) {
      mapFeatureTmp.properties.files?.push(...files);
      setMapFeature(null);
      setMapFeature(mapFeatureTmp);
    }
  };

  /**
   * Show progress while feature data is fetching
   */
  if (!mapFeature) {
    return (
      <Box className='tabSelect__progress'>
        <CircularProgress />
      </Box>
    );
  }

  const {
    geometry,
    properties: { id, name, files, createdAt, description, address, wiki, phone, links, comments, type, category, user }
  } = mapFeature;

  return (
    <Box>
      <Carousel showThumbs={false} swipeable emulateTouch infiniteLoop showStatus={false}>
        {files?.map(file => (
          <div className='gallery__item' key={file.name} onClick={() => openFullImage(file)}>
            <Image className='gallery__image' src={`${file.name}?type=${FileType.THUMBNAIL}`} />
          </div>
        ))}
      </Carousel>
      <Grid container spacing={2} sx={{ p: 3 }}>
        <Grid item xs={12}>
          <Box>
            <Typography variant='caption' gutterBottom>
              {type.name}
              {category ? ` - ${category.name}` : ''}
            </Typography>
            <Typography variant='h5'>{name}</Typography>
            <Typography variant='body2' gutterBottom>
              {new Date(createdAt).toLocaleDateString()}
            </Typography>
            <Typography variant='body1' gutterBottom>
              {description}
            </Typography>
            <Box sx={{ display: 'flex' }}>
              <UserAvatar user={user} sx={{ mr: 1 }} type={FileType.THUMBNAIL} />
              <Typography variant='h6' gutterBottom>
                {user.username}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
      <Divider />
      <Grid container spacing={1} sx={{ mt: 2, mb: 2 }}>
        {address && (
          <Grid item xs={12}>
            <IconField icon={<HomeIcon />} text={address} />
          </Grid>
        )}
        {wiki && (
          <Grid item xs={12}>
            <IconField icon={<LinkIcon />} text={wiki} />
          </Grid>
        )}
        {phone && (
          <Grid item xs={12}>
            <IconField icon={<PhoneEnabledIcon />} text={phone} />
          </Grid>
        )}
        <Grid item xs={12}>
          <IconField icon={<RoomIcon />} text={toText(getCenter(geometry.coordinates, geometry.type))} />
        </Grid>
        {links?.map(link => (
          <Grid item xs={12} key={link}>
            <IconField icon={<LinkIcon />} text={link} />
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={2} sx={{ pl: 3, pr: 3, pb: 3 }}>
        {authStore.isAuth && (
          <Grid className='tabSelect__fileUpload' item xs={12}>
            <FileUpload isSubmit submitId={id} onSubmit={handleSubmitMedia} />
          </Grid>
        )}
      </Grid>
      <Divider />
      <Grid container spacing={2} sx={{ p: 3 }}>
        <Grid item xs={12}>
          <Typography variant='h6'>{t('COMMENTS')}</Typography>
          <Comments comments={comments} featureId={id} />
        </Grid>
      </Grid>

      <Viewer zIndex={5000} activeIndex={activeImage} visible={viewerOpen} images={getViewerImages(files)} onClose={() => setViewerOpen(false)} />
    </Box>
  );
};
