import { observer } from 'mobx-react-lite';
import { Navigate, Route, Routes } from 'react-router-dom';
import './styles/App.scss';
import './styles/position.css';
import * as React from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Main from './pages/main/Main';

const App = observer(() => {
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
});

export default App;
