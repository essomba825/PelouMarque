/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Marque } from './types';
import { Database } from './data/db';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import BrandDashboard from './components/BrandDashboard';
import BrandArticles from './components/BrandArticles';
import BulkRegister from './components/BulkRegister';
import SimulatorScan from './components/SimulatorScan';
import BrandProfile from './components/BrandProfile';
import { 
  Menu, 
  X, 
  ShieldCheck, 
  LayoutDashboard, 
  ShoppingBag, 
  Barcode, 
  UserCircle, 
  Smartphone, 
  LogOut 
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentBrand, setCurrentBrand] = useState<Marque | null>(null);
  const [activeTab, setActiveTab] = useState<string>('login');
  
  // Mobile responsive layout nav toggle state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Charger la session du LocalStorage au montage initial du composant
  useEffect(() => {
    const savedUserId = localStorage.getItem('pelou_auth_user_id');
    if (savedUserId) {
      const users = Database.getUsers();
      const user = users.find(u => u.id === Number(savedUserId));
      if (user) {
        setCurrentUser(user);
        if (user.is_marque) {
          const brand = Database.getMarqueByNom(user.nom_organisation || '');
          setCurrentBrand(brand);
          setActiveTab('dashboard');
        } else {
          setActiveTab('scanner');
        }
      } else {
        setActiveTab('login');
      }
    } else {
      setActiveTab('login');
    }
  }, []);

  const handleLoginSuccess = (user: User, brand: Marque | null) => {
    setCurrentUser(user);
    setCurrentBrand(brand);
    localStorage.setItem('pelou_auth_user_id', String(user.id));
    
    if (brand) {
      setActiveTab('dashboard');
    } else {
      setActiveTab('scanner');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentBrand(null);
    localStorage.removeItem('pelou_auth_user_id');
    setActiveTab('login');
    setMobileMenuOpen(false);
  };

  const handleProfileUpdated = (updatedBrand: Marque) => {
    setCurrentBrand(updatedBrand);
    
    // Mettre à jour l'utilisateur de session pour refléter un potentiel changement de nom
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        nom_organisation: updatedBrand.nom_organisation
      });
    }
  };

  // Raccourci de navigation de l'application
  const handleNavigateToTab = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const showHeader = activeTab !== 'login';

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* 1. If NOT on login page and user is authenticated as brand, we show the main sidebar layout desk */}
      {currentUser && currentBrand && showHeader && (
        <Sidebar
          currentUser={currentUser}
          currentBrand={currentBrand}
          activeTab={activeTab}
          setActiveTab={handleNavigateToTab}
          onLogout={handleLogout}
        />
      )}

      {/* Main app contents area */}
      <div className="flex-grow flex flex-col min-w-0 min-h-screen">
        {/* Mobile top app bar (Responsive design only) */}
        {showHeader && (
          <header className="bg-slate-900 text-slate-100 flex items-center justify-between p-4 md:hidden border-b border-slate-800 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md overflow-hidden shadow-sm shadow-indigo-600/30">
                <img 
                  src="/src/assets/images/pelou_logo_1782152421292.jpg" 
                  alt="Pelou Logo" 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer" 
                />
              </div>
              <span className="text-lg font-extrabold tracking-tight font-display text-white">Pelou<span className="text-indigo-400">.</span></span>
            </div>
            
            <div className="flex items-center gap-2">
              {currentUser && (
                <span className="text-xs text-slate-400 truncate max-w-28 mb-0.5">
                  {currentUser.nom_organisation || currentUser.first_name}
                </span>
              )}
              <button
                id="btn-mobile-menu"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 transition"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </header>
        )}

        {/* Mobile Navigation Drawer Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && showHeader && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-slate-900 text-slate-200 border-b border-slate-800 overflow-hidden font-medium text-sm"
            >
              <div className="p-4 space-y-2">
                {currentUser && currentBrand && (
                  <>
                    <button
                      id="btn-mobile-tab-dashboard"
                      onClick={() => handleNavigateToTab('dashboard')}
                      className={`w-full text-left py-2.5 px-4 rounded-xl flex items-center gap-3 transition ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      Tableau de bord
                    </button>
                    <button
                      id="btn-mobile-tab-articles"
                      onClick={() => handleNavigateToTab('articles')}
                      className={`w-full text-left py-2.5 px-4 rounded-xl flex items-center gap-3 transition ${activeTab === 'articles' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                    >
                      <ShoppingBag className="w-5 h-5" />
                      Mes articles
                    </button>
                    <button
                      id="btn-mobile-tab-bulk"
                      onClick={() => handleNavigateToTab('bulk-register')}
                      className={`w-full text-left py-2.5 px-4 rounded-xl flex items-center gap-3 transition ${activeTab === 'bulk-register' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                    >
                      <Barcode className="w-5 h-5" />
                      Émission de codes
                    </button>
                    <button
                      id="btn-mobile-tab-profile"
                      onClick={() => handleNavigateToTab('profile')}
                      className={`w-full text-left py-2.5 px-4 rounded-xl flex items-center gap-3 transition ${activeTab === 'profile' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                    >
                      <UserCircle className="w-5 h-5" />
                      Profil de marque
                    </button>
                  </>
                )}
                
                <button
                  id="btn-mobile-tab-scanner"
                  onClick={() => handleNavigateToTab('scanner')}
                  className={`w-full text-left py-2.5 px-4 rounded-xl flex items-center gap-3 transition ${activeTab === 'scanner' ? 'bg-indigo-800 text-indigo-200' : 'text-slate-400'}`}
                >
                  <Smartphone className="w-5 h-5" />
                  Scanner &amp; Vérifier (Demo)
                </button>

                {currentUser ? (
                  <button
                    id="btn-mobile-tab-logout"
                    onClick={handleLogout}
                    className="w-full text-left py-2.5 px-4 text-red-400 rounded-xl flex items-center gap-3 transition"
                  >
                    <LogOut className="w-5 h-5" />
                    Déconnexion
                  </button>
                ) : (
                  <button
                    id="btn-mobile-tab-login"
                    onClick={() => handleNavigateToTab('login')}
                    className="w-full text-left py-2.5 px-4 text-indigo-400 rounded-xl flex items-center gap-3 font-bold transition"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    Accéder à l'Espace Marque
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* View render switch dispatch routing mechanism */}
        <main className="flex-grow">
          {activeTab === 'login' && (
            <Login
              onLoginSuccess={handleLoginSuccess}
              onNavigateToScan={() => handleNavigateToTab('scanner')}
            />
          )}

          {activeTab === 'dashboard' && currentUser && currentBrand && (
            <BrandDashboard
              currentUser={currentUser}
              currentBrand={currentBrand}
              onNavigateToTab={handleNavigateToTab}
            />
          )}

          {activeTab === 'articles' && currentUser && currentBrand && (
            <BrandArticles
              currentUser={currentUser}
              currentBrand={currentBrand}
              onRefreshDashboard={() => {
                // Rafraîchir de manière transparente en mettant à jour la référence marque
                const brand = Database.getMarqueByNom(currentBrand.nom_organisation);
                if (brand) setCurrentBrand(brand);
              }}
            />
          )}

          {activeTab === 'bulk-register' && currentUser && currentBrand && (
            <BulkRegister
              currentUser={currentUser}
              currentBrand={currentBrand}
              onRefreshDashboard={() => {
                const brand = Database.getMarqueByNom(currentBrand.nom_organisation);
                if (brand) setCurrentBrand(brand);
              }}
            />
          )}

          {activeTab === 'profile' && currentUser && currentBrand && (
            <BrandProfile
              currentUser={currentUser}
              currentBrand={currentBrand}
              onProfileUpdated={handleProfileUpdated}
            />
          )}

          {activeTab === 'scanner' && (
            <div className="space-y-4">
              {/* Header inside simulated scanner to allow easy access back to login */}
              <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                    <Barcode className="w-5 h-5" />
                  </div>
                  <span className="text-lg font-extrabold text-slate-800">Pelou Anti-Contrefaçon</span>
                </div>
                <button
                  id="btn-scanner-to-login"
                  onClick={() => handleNavigateToTab(currentUser ? (currentBrand ? 'dashboard' : 'scanner') : 'login')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  {currentUser ? 'Mon Bureau' : 'Espace Marque'}
                </button>
              </div>
              <SimulatorScan />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
