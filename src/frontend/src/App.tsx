import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage'; // <-- Nowy import
import PosPage from './pages/PosPage';
import DashboardPage from './pages/DashboardPage';
import ManageRestaurantPage from './pages/ManageRestaurant/ManageRestaurantPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Od razu rzucamy na logowanie jeśli ktoś wejdzie na pusty adres */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Nasz nowy centralny panel */}
        <Route path="/home" element={<HomePage />} />

        <Route path="/restaurants/:restaurantId/manage" element={<ManageRestaurantPage />} />
        
        <Route path="/pos" element={<PosPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;