import MapConstant from '@/constants/map.constant';
import { mapStore } from '@/store/map.store';
import { Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';

export const PreviewMapLabel = observer(() => {
  return mapStore.mapType === MapConstant.GOOGLE ? <Typography variant='subtitle2'>Earth</Typography> : <Typography variant='subtitle2'>Map</Typography>;
});
