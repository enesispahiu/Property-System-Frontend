import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import PropertyDetails from './pages/PropertyDetails.jsx';
import DashboardEntry from './pages/DashboardEntry.jsx';
import MyBookings from './pages/MyBookings.jsx';
import MyFavourites from './pages/MyFavourites.jsx';
import MyReviews from './pages/MyReviews.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import PlatformPanel from './pages/PlatformPanel.jsx';
import AiAssistantButton from './components/AiAssistantButton.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Footer from './components/Footer.jsx';

function App() {
  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Home />} />
        <Route path="/properties/:id" element={<PropertyDetails />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardEntry />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute allowedRoles={['USER']}>
              <MyBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-favorites"
          element={
            <ProtectedRoute allowedRoles={['USER']}>
              <MyFavourites />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-favourites"
          element={
            <ProtectedRoute allowedRoles={['USER']}>
              <MyFavourites />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute allowedRoles={['USER']}>
              <MyFavourites />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-reviews"
          element={
            <ProtectedRoute allowedRoles={['USER']}>
              <MyReviews />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['TENANT_ADMIN']}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/business"
          element={
            <ProtectedRoute allowedRoles={['TENANT_ADMIN']}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/operations"
          element={
            <ProtectedRoute allowedRoles={['TENANT_ADMIN']}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/reviews"
          element={
            <ProtectedRoute allowedRoles={['TENANT_ADMIN']}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/platform"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <PlatformPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/platform/tenant-management"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <PlatformPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/platform/tenants"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <PlatformPanel />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Footer />
      <AiAssistantButton />
    </div>
  );
}

export default App;
