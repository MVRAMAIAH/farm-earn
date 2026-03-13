import { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthContext } from './context/AuthContext';

// Layout & UI
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FarmerDashboard from './pages/dashboards/FarmerDashboard';
import BuyerDashboard from './pages/dashboards/BuyerDashboard';
import AgentDashboard from './pages/dashboards/AgentDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import CropMarketplace from './pages/CropMarketplace';

// Protected Route component
const ProtectedRoute = ({ children, allowedRole }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin h-10 w-10 border-4 border-primary-600 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If specific role is required, check it
    if (allowedRole && user.role.toLowerCase() !== allowedRole.toLowerCase()) {
        return <Navigate to={`/dashboard/${user.role.toLowerCase()}`} replace />;
    }

    return children;
};

function App() {
    return (
        <Router>
            <div className="flex flex-col min-h-screen bg-gray-50">
                <Navbar />
                <main className="flex-grow pt-16">
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/marketplace" element={<CropMarketplace />} />

                        {/* Protected Dashboard Routes */}
                        <Route
                            path="/dashboard/farmer"
                            element={
                                <ProtectedRoute allowedRole="Farmer">
                                    <FarmerDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/buyer"
                            element={
                                <ProtectedRoute allowedRole="Buyer">
                                    <BuyerDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/agent"
                            element={
                                <ProtectedRoute allowedRole="Agent">
                                    <AgentDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/admin"
                            element={
                                <ProtectedRoute allowedRole="Admin">
                                    <AdminDashboard />
                                </ProtectedRoute>
                            }
                        />

                        {/* Catch-all redirect */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
                <Footer />
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </Router>
    );
}

export default App;
