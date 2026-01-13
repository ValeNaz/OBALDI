
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Membership from './pages/Membership';
import About from './pages/About';
import Marketplace from './pages/Marketplace';
import ProductDetail from './pages/ProductDetail';
import AdminDashboard from './pages/AdminDashboard';
import SellerDashboard from './pages/SellerDashboard';
import Login from './pages/Login';
import { UserProvider, useUser } from './context/UserContext';

const Header = () => {
  const { user, points } = useUser();
  
  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <nav className="flex items-center space-x-8">
          <Link to="/" className="text-2xl font-bold text-[#0b224e]">Obaldi</Link>
          <div className="hidden md:flex space-x-6 text-sm font-medium text-slate-600">
            <Link to="/membership" className="hover:text-[#0b224e]">Entra in Obaldi</Link>
            <Link to="/about" className="hover:text-[#0b224e]">Chi siamo</Link>
            <Link to="/marketplace" className="hover:text-[#0b224e]">Marketplace</Link>
          </div>
        </nav>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              {user.isPremium && (
                <div className="flex items-center bg-slate-100 px-3 py-1 rounded-full border border-slate-200 text-xs font-bold text-[#0b224e]">
                  <span className="mr-2 opacity-50">🪙</span> {points} Punti
                </div>
              )}
              <span className="text-sm text-slate-600">{user.email}</span>
              <Link to={user.role === 'ADMIN' ? '/admin' : user.role === 'SELLER' ? '/seller' : '/profile'} className="text-xs uppercase font-bold text-[#a41f2e]">Area Riservata</Link>
            </div>
          ) : (
            <Link to="/login" className="text-sm font-semibold px-4 py-2 rounded bg-[#0b224e] text-white">Accedi</Link>
          )}
        </div>
      </div>
    </header>
  );
};

const App: React.FC = () => {
  return (
    <UserProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/membership" element={<Membership />} />
              <Route path="/about" element={<About />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/admin/*" element={<AdminDashboard />} />
              <Route path="/seller/*" element={<SellerDashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <footer className="bg-slate-900 text-slate-400 py-12 px-4">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-white font-bold mb-4 italic text-xl">Obaldi</h3>
                <p className="text-sm">Consapevolezza. Tutela. Acquisti sensati.</p>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4">Risorse</h4>
                <ul className="text-sm space-y-2">
                  <li><Link to="/news/truffe" className="hover:text-white">Prevenzione Truffe</Link></li>
                  <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                </ul>
              </div>
              <div className="text-sm">
                <p>© 2024 Obaldi Network. Tutti i diritti riservati.</p>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </UserProvider>
  );
};

export default App;
