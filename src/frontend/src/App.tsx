import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import PosPage from './pages/PosPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Domyślne przekierowanie na logowanie */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Nasze główne ekrany */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/pos" element={<PosPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;