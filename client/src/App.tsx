import { authStore } from '@/store/auth.store';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { Navigate, Route, Routes } from 'react-router-dom';
import Main from './pages/main/Main';
import './styles/App.scss';

const App = () => {
  if (authStore.isAuth && !authStore.user) {
    authStore.getUserProfile();
  }

  return (
    <Box>
      <CssBaseline />
      <Box component='main'>
        <Routes>
          <Route path='*' element={<Navigate to='/' />} />
          <Route path='/' element={<Main />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default App;
