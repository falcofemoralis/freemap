import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { Navigate, Route, Routes } from 'react-router-dom';
import Main from './pages/main/Main';
import './styles/App.scss';

const App = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Box component='main' sx={{ flexGrow: 1 }}>
        <Routes>
          <Route path='*' element={<Navigate to='/' />} />
          <Route path='/' element={<Main />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default App;
