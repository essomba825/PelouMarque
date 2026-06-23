/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, Marque, Article, CodeBarre, ScanLog, StockBoutique, Boutique } from '../types';
import { Database } from '../data/db';
import { 
  ShoppingBag, 
  Barcode, 
  Activity, 
  Fingerprint, 
  AlertTriangle, 
  Store, 
  CheckCircle, 
  XCircle,
  TrendingUp, 
  Calendar,
  Layers
} from 'lucide-react';

interface BrandDashboardProps {
  currentUser: User;
  currentBrand: Marque;
  onNavigateToTab: (tab: string) => void;
}

export default function BrandDashboard({ currentUser, currentBrand, onNavigateToTab }: BrandDashboardProps) {
  // Charger les données de la marque
  const articles = Database.getArticlesByMarque(currentBrand.nom_organisation);
  const articleIds = articles.map(a => a.id);
  
  // Codes-barres émis
  const allCodes = Database.getCodesBarres();
  const codesEmis = allCodes.filter(c => articleIds.includes(c.article_id));

  // Scans d'authenticité sur les produits de la marque
  const allScans = Database.getScanLogs();
  const brandScans = allScans.filter(s => s.marque_nom.toLowerCase() === currentBrand.nom_organisation.toLowerCase());
  const scansReussis = brandScans.filter(s => s.success);
  const tauxAuthenticite = brandScans.length > 0 
    ? Math.round((scansReussis.length / brandScans.length) * 100) 
    : 100;

  // Calculer les alertes de stock faible d'après StockBoutique
  const allStocks = Database.getStocksBoutique();
  const stockAlerts = allStocks.filter(s => {
    return articleIds.includes(s.article_id) && s.quantite <= s.seuil_alerte;
  });

  const getArticleName = (id: number) => {
    return articles.find(a => a.id === id)?.nom || 'Produit inconnu';
  };

  const getBoutiqueName = (id: number) => {
    return Database.getBoutiques().find(b => b.id === id)?.nom || 'Boutique partenaire';
  };

  // Boutiques partenaires
  const boutiquesAssociees = Database.getBoutiques().filter(b => {
    return articles.some(a => a.boutique_id === b.id);
  });

  return (
    <div id="brand-dashboard" className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header section with verification badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-display">
              Espace Fabricant : {currentBrand.nom_organisation}
            </h1>
            {currentBrand.is_verified ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-full border border-indigo-150">
                <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
                Certifié Pelou
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-amber-700 bg-amber-50 rounded-full border border-amber-150">
                <Fingerprint className="w-3.5 h-3.5 text-amber-600" />
                Vérification Administrative Requise
              </span>
            )}
          </div>
          <p className="text-slate-500 mt-1">
            Gerez la traçabilité de vos terroirs, l'authenticité de vos produits et préservez vos clients du marché de la contrefaçon.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            id="dashboard-btn-new-article"
            onClick={() => onNavigateToTab('articles')}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            Créer un article
          </button>
          <button
            id="dashboard-btn-codes-bulk"
            onClick={() => onNavigateToTab('bulk-register')}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-100 text-sm font-bold rounded-xl transition cursor-pointer"
          >
            Émettre des codes
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Catalogues Articles</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">{articles.length}</p>
            <p className="text-[10px] text-slate-450 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-indigo-500" />
              Générés par vous
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
            <Barcode className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Codes-Barres Authentiques</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">{codesEmis.length}</p>
            <p className="text-[10px] text-slate-450 mt-1 flex items-center gap-1">
              <Layers className="w-3 h-3 text-blue-500" />
              Séries de traçabilité
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-50/50 text-indigo-600 p-3 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Analyses / Scans</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">{brandScans.length}</p>
            <p className="text-[10px] text-slate-400 mt-1">
              Validation : <span className="font-bold text-indigo-600">{tauxAuthenticite}% conforme</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex items-center gap-4">
          <div className="bg-amber-50 text-amber-600 p-3 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Alerte Ruptures</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">{stockAlerts.length}</p>
            <p className="text-[10px] text-slate-450 mt-1">
              Boutiques nécessitant réassort
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Scan analysis & Stock Alerts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Scans Logs */}
          <div className="bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 font-display">
                <Fingerprint className="w-5 h-5 text-indigo-600" />
                Dernières requêtes d'audits consommateurs (Scans)
              </h3>
              <p className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">Live Feed</p>
            </div>
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {brandScans.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  Aucun scannage d'authenticité n'a encore été enregistré pour vos produits.
                </div>
              ) : (
                brandScans.slice().reverse().map(scan => (
                  <div key={scan.id} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50 transition">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {scan.success ? (
                          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-full">
                            <CheckCircle className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="p-1.5 bg-red-50 text-red-600 rounded-full">
                            <XCircle className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">
                          {scan.article_nom || 'Code non associé'}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1 font-mono">
                          <span>CODE : <span className="text-slate-600 font-semibold">{scan.code}</span></span>
                          {scan.boutique_nom && (
                            <span className="flex items-center gap-1">
                              <Store className="w-3.5 h-3.5 text-slate-350" />
                              {scan.boutique_nom}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1.5">
                      <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${scan.success ? 'bg-indigo-50 text-indigo-700 border border-indigo-150' : 'bg-red-50 text-red-700 border border-red-150'}`}>
                        {scan.success ? 'CONFORME' : 'INCIDENT'}
                      </span>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {new Date(scan.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Low Stock details list */}
          <div className="bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Alertes de rupture de stocks critiques en boutiques
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {stockAlerts.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  Félicitations ! Tous vos points de vente disposent de stocks suffisants.
                </div>
              ) : (
                stockAlerts.map(alert => (
                  <div key={alert.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                    <div>
                      <p className="text-sm font-bold text-slate-700">{getArticleName(alert.article_id)}</p>
                      <p className="text-xs text-slate-450 mt-1 flex items-center gap-1 uppercase tracking-wider font-semibold">
                        <Store className="w-3.5 h-3.5 text-slate-400" />
                        {getBoutiqueName(alert.boutique_id)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs font-mono text-slate-400">Stock résiduel :</p>
                        <p className="text-sm font-extrabold text-red-600 mt-0.5">{alert.quantite} pièces</p>
                      </div>
                      <span className="text-[10px] font-semibold bg-red-50 text-red-600 px-2 py-1 rounded-lg border border-red-100">
                        Seuil alerte : {alert.seuil_alerte}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right column: Shops Partner Directory list */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-150 shadow-sm p-5 space-y-5">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3 font-display">
              <Store className="w-5 h-5 text-indigo-600" />
              Boutiques Partenaires Actives ({boutiquesAssociees.length})
            </h3>
            <div className="space-y-4">
              {boutiquesAssociees.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-sm">
                  Pour l'instant, aucune de vos boutiques n'héberge vos articles. Créez des articles et distribuez-les.
                </div>
              ) : (
                boutiquesAssociees.map(btq => {
                  const ville = Database.getVilles().find(v => v.id === btq.ville_id)?.nom || '';
                  const quartier = Database.getQuartiers().find(q => q.id === btq.quartier_id)?.nom || '';
                  return (
                    <div key={btq.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                        {btq.image ? (
                          <img src={btq.image} alt={btq.nom} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 font-extrabold text-xs uppercase font-mono">
                            {btq.nom.substring(0,2)}
                          </div>
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-slate-700 text-sm truncate font-display">{btq.nom}</h4>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {quartier}, {ville}
                        </p>
                        <span className="text-[9px] font-bold text-indigo-650 bg-indigo-50/50 border border-indigo-100 px-2 py-0.5 rounded-md mt-1.5 inline-block uppercase tracking-wide">
                          {btq.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick tips card on counter-feiting */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-2xl p-6 text-white space-y-4 shadow-lg border border-slate-850">
            <h4 className="font-bold text-xs tracking-wider text-indigo-400 uppercase flex items-center gap-1.5 font-display">
              <Fingerprint className="w-4 h-4" />
              Directives Anti-Contrefaçon
            </h4>
            <p className="text-xs leading-relaxed text-slate-400 font-sans">
              Pelou s'appuie sur une preuve unique d'authenticité. Chacun de vos produits distribués doit détenir un code-barres émis en masse ou à l'unité.
            </p>
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-2 text-[11px] text-slate-350 font-mono">
              <p className="text-xs font-bold text-white mb-1 font-sans">Règles de scan Pelou :</p>
              <div className="flex gap-2 items-start">
                <span className="text-indigo-400 font-bold">1.</span>
                <span>Code unique scanné</span>
              </div>
              <div className="flex gap-2 items-start">
                <span className="text-indigo-400 font-bold">2.</span>
                <span>Vérification de la marque</span>
              </div>
              <div className="flex gap-2 items-start">
                <span className="text-indigo-400 font-bold">3.</span>
                <span>Agrément vérifié</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
