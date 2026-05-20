import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import ProjectDetail from './pages/ProjectDetail';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <div className="font-sans text-gray-900 dark:text-gray-100">
            <Toaster position="top-right" />
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
              <Route path="/analytics" element={<Layout><AnalyticsDashboard /></Layout>} />
              <Route path="/projects/:id" element={<Layout><ProjectDetail /></Layout>} />
            </Routes>
          </div>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
