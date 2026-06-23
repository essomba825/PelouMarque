/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, Marque } from '../types';
import { LayoutDashboard, ShoppingBag, Barcode, UserCircle, Smartphone, LogOut, ShieldAlert, Award } from 'lucide-react';

interface SidebarProps {
  currentUser: User | null;
  currentBrand: Marque | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ currentUser, currentBrand, activeTab, setActiveTab, onLogout }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'articles', label: 'Mes articles', icon: ShoppingBag },
    { id: 'bulk-register', label: 'Émission de codes', icon: Barcode },
    { id: 'profile', label: 'Profil de marque', icon: UserCircle },
  ];

  return (
    <aside id="sidebar-menu" className="w-64 bg-slate-900 text-slate-100 flex flex-col justify-between h-screen sticky top-0 border-r border-slate-800 shadow-xl hidden md:flex font-sans">
      {/* Brand logo section */}
      <div>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg overflow-hidden shadow-md shadow-indigo-650/40 border border-slate-800 flex-shrink-0">
              <img 
                src="/src/assets/images/pelou_logo_1782152421292.jpg" 
                alt="Pelou Logo" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer" 
              />
            </div>
            <span className="text-xl font-extrabold tracking-tight font-display text-white">
              Pelou<span className="text-indigo-400 font-light">.</span>
            </span>
          </div>
          {currentBrand?.is_verified && (
            <div className="flex items-center gap-1 bg-indigo-950/40 text-indigo-400 text-[9px] uppercase tracking-wider font-black py-1 px-2.5 rounded-full border border-indigo-800/40">
              <Award className="w-3 h-3" />
              Agréé
            </div>
          )}
        </div>

        {/* User Card info */}
        {currentUser && (
          <div className="p-5 border-b border-slate-800 flex items-center gap-3 bg-slate-850/20">
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-extrabold text-indigo-400 capitalize overflow-hidden shadow-inner">
              {currentBrand?.logo ? (
                <img src={currentBrand.logo} alt={currentBrand.nom_organisation} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                currentUser.nom_organisation?.charAt(0) || currentUser.first_name.charAt(0)
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate text-slate-200 font-display">{currentUser.nom_organisation || currentUser.full_name}</p>
              <p className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-semibold mt-0.5">Producteur Référencé</p>
            </div>
          </div>
        )}

        {/* Dynamic Nav link Items */}
        <nav className="p-4 space-y-1.5 flex-grow">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${
                  active
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${active ? 'text-white' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}

          <div className="border-t border-slate-800/60 my-4" />

          {/* Test Scanner always available */}
          <button
            id="sidebar-tab-scanner"
            onClick={() => setActiveTab('scanner')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${
              activeTab === 'scanner'
                ? 'bg-slate-800 text-indigo-400 border border-indigo-950/40 shadow-sm'
                : 'text-indigo-400 hover:bg-indigo-950/20 hover:text-indigo-200'
            }`}
          >
            <Smartphone className="w-4.5 h-4.5" />
            Scanner &amp; Vérifier (Demo)
          </button>
        </nav>
      </div>

      {/* Logout button info bottom */}
      <div className="p-4 border-t border-slate-800">
        <button
          id="btn-sidebar-logout"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 font-semibold hover:bg-red-950/20 hover:text-red-300 rounded-xl transition cursor-pointer"
        >
          <LogOut className="w-4.5 h-4.5" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
