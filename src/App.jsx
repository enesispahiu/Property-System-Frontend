import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import PropertyDetails from './pages/PropertyDetails.jsx';
import Dashboard from './pages/Dashboard.jsx';
import MyFavourites from './pages/MyFavourites.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import AiAssistantButton from './components/AiAssistantButton.jsx';
import Footer from './components/Footer.jsx';

function App() {
  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/properties/:id" element={<PropertyDetails />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/my-favourites" element={<MyFavourites />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/platform" element={<AdminPanel />} />
      </Routes>
      <Footer />
      <AiAssistantButton />
    </div>
  );
}

export default App;
