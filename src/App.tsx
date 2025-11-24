import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Header } from './components/layout/Header';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Vets } from './pages/Vets';
import { Messages } from './pages/Messages';
import { Profile } from './pages/Profile';
import { AddPet } from './pages/AddPet';
import { PetDetails } from './pages/PetDetails';
import { UserProfile } from './pages/UserProfile';

function App() {

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/*" element={
              <>
                <Header onOpenDating={() => { }} />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/add-pet" element={<AddPet />} />
                  <Route path="/pet/:id" element={<PetDetails />} />
                  <Route path="/vets" element={<Vets />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/profile" element={<UserProfile />} />
                </Routes>
              </>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;