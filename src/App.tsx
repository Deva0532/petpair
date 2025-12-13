import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { Header } from './components/layout/Header';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { Vets } from './pages/Vets';
import { Messages } from './pages/Messages';
import { AddPet } from './pages/AddPet';
import { PetDetails } from './pages/PetDetails';
import { UserProfile } from './pages/UserProfile';
import { Wishlist } from './pages/Wishlist';
import { UserTypeSelection } from './pages/UserTypeSelection';
import { PetStores } from './pages/PetStores';
import { StoreDetails } from './pages/StoreDetails';
import { AdminLayout } from './pages/admin/AdminLayout';

const GOOGLE_CLIENT_ID = '491619630108-3e8nu5ocp54e5kjgb79rms5cqa91b847.apps.googleusercontent.com';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/select-user-type" element={<UserTypeSelection />} />
                <Route path="/admin/*" element={<AdminLayout />} />
                <Route path="/*" element={
                  <>
                    <Header />
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/add-pet" element={<AddPet />} />
                      <Route path="/pet/:id" element={<PetDetails />} />
                      <Route path="/vets" element={<Vets />} />
                      <Route path="/messages" element={<Messages />} />
                      <Route path="/profile" element={<UserProfile />} />
                      <Route path="/wishlist" element={<Wishlist />} />
                      <Route path="/stores" element={<PetStores />} />
                      <Route path="/stores/:id" element={<StoreDetails />} />
                    </Routes>
                  </>
                } />
              </Routes>
            </div>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;