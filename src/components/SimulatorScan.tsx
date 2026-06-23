/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Database } from '../data/db';
import { Article, Marque, Boutique } from '../types';
import { PelouApiService } from '../data/api';
import { 
  Scan, 
  Smartphone, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  XOctagon, 
  Info, 
  Store, 
  MapPin, 
  Award, 
  Share2, 
  Flag,
  ArrowRight,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';

export default function SimulatorScan() {
  const [scannedCode, setScannedCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    status: 'AUTHENTIQUE' | 'NON_VERIFIE' | 'CONTREFAÇON_SUSPECTE' | 'INCONNU';
    article?: Article | null;
    marque?: Marque | null;
    boutique?: Boutique | null;
    message: string;
  } | null>(null);

  // Charger les codes de démo pré-configurés pour faciliter le test
  const demoPresets = [
    { label: 'Sérum Karité (Authentique ⭐)', code: '615110190012', desc: 'Produit de Bamboutos Cosmetics, Fabricant certifié' },
    { label: 'Écharpe Kente (Non Certifié ⚠️)', code: '4006381333931', desc: 'Produit Kente Prestige, Fabricant en cours de validation' },
    { label: 'Sauce Piment (Authentique ⭐)', code: '615220011559', desc: 'Produit AfriqFood, Fabricant certifié' },
    { label: 'Code Inconnu / Faux (Alerte 🚨)', code: '999999999999', desc: 'Simuler un faux code de contrebande' }
  ];

  const handleRunScan = (codeToScan: string) => {
    setIsScanning(true);
    setResult(null);

    const useDjango = localStorage.getItem('pelou_use_livedjango') === 'true';

    // Petite animation de scannage immersive pour le confort visuel
    setTimeout(async () => {
      if (useDjango) {
        try {
          const verifyResult = await PelouApiService.verifyProductAuthenticity(codeToScan);
          
          setResult({
            success: verifyResult.verified,
            status: verifyResult.verified ? 'AUTHENTIQUE' : 'CONTREFAÇON_SUSPECTE',
            message: verifyResult.message,
            article: verifyResult.article ? {
              id: 0,
              nom: verifyResult.article.nom,
              prix: verifyResult.article.prix,
              description: verifyResult.article.description || '',
              stock: 0,
              category: verifyResult.article.category || '',
              image: verifyResult.article.image || '',
              est_actif: true,
              quantite: 1,
              is_featured: false,
              marque: verifyResult.brand?.nom || ''
            } : null,
            marque: verifyResult.brand ? {
              id: 0,
              user_id: 0,
              nom_organisation: verifyResult.brand.nom,
              email: '',
              numero_telephone: '',
              description: '',
              bio: '',
              logo: verifyResult.brand.logo || '',
              image_couverture: '',
              site_web: '',
              domaines: [],
              is_verified: verifyResult.brand.is_verified,
              is_active: true,
              date_creation: '',
              date_modification: '',
              articles_count: 0,
              followers_count: 0
            } : null,
            boutique: verifyResult.distribution?.[0] ? {
              id: 0,
              proprietaire_id: 0,
              nom: verifyResult.distribution[0].nom,
              adresse: verifyResult.distribution[0].adresse,
              ville_id: 1,
              quartier_id: 1,
              contact_telephone: '',
              rating: 5,
              items_count: 0,
              image: ''
            } : null
          });
        } catch (err: any) {
          setResult({
            success: false,
            status: 'CONTREFAÇON_SUSPECTE',
            message: err.message || 'Scannage échoué : code inconnu ou suspect.',
          });
        } finally {
          setIsScanning(false);
        }
      } else {
        setIsScanning(false);
        const verifyResult = Database.verifyProduct(codeToScan);
        setResult({
          ...verifyResult,
          status: verifyResult.status as 'AUTHENTIQUE' | 'NON_VERIFIE' | 'CONTREFAÇON_SUSPECTE' | 'INCONNU'
        });
      }
    }, 1550);
  };

  const handleSelectPreset = (code: string) => {
    setScannedCode(code);
    handleRunScan(code);
  };

  const handleReportAbuse = () => {
    alert('Signalement transmis avec succès aux équipes d\'inspection Pelou. Merci de votre contribution à la lutte anti-contrefaçon !');
  };

  return (
    <div id="simulator-scan" className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header title */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2 font-display">
          <Scan className="w-8 h-8 text-indigo-600 animate-pulse" />
          Simulateur Mobile d'Authenticité
        </h1>
        <p className="text-slate-500 mt-1 font-sans">
          Scannez le code-barres Pelou présent sur un article pour certifier son origine d'artisanat ou de marque de terroir.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column Mobile view scanner (4 columns) */}
        <div className="lg:col-span-4 flex justify-center">
          <div className="relative w-80 h-[580px] bg-slate-950 rounded-[40px] px-4 py-8 border-[12px] border-slate-900 shadow-2xl overflow-hidden flex flex-col justify-between text-white font-sans">
            {/* Phone notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-20 flex items-center justify-center">
              <div className="w-12 h-1.5 bg-slate-800 rounded-full mb-1" />
            </div>

            {/* Simulated app lock screen status */}
            <div className="flex justify-between items-center text-[10px] font-mono select-none px-2 relative z-10 pt-1">
              <span>PELOU SECURE</span>
              <span>100% SECURE</span>
            </div>

            {/* Scanner interactive overlay viewport */}
            <div className="relative flex-grow my-4 flex flex-col items-center justify-center p-4">
              {isScanning ? (
                /* Scanning state view animation */
                <div className="space-y-4 text-center z-10 w-full px-2">
                  <div className="relative w-full aspect-square border-2 border-indigo-500/30 rounded-3xl overflow-hidden bg-slate-900/40">
                    <motion.div 
                      initial={{ y: 0 }}
                      animate={{ y: '100%' }}
                      transition={{ duration: 1.2, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-lg shadow-indigo-500/50"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Scan className="w-16 h-16 text-indigo-400 opacity-60 animate-pulse" />
                    </div>
                  </div>
                  <p className="text-xs text-indigo-400 font-mono tracking-widest uppercase font-bold animate-pulse">
                    Scan de traçabilité...
                  </p>
                </div>
              ) : result ? (
                /* Result view state inside the mobile app */
                <div className="w-full text-center space-y-4 mt-2">
                  <div className="flex justify-center">
                    {result.status === 'AUTHENTIQUE' && (
                      <div className="bg-indigo-550/10 text-indigo-400 p-4 rounded-full border border-indigo-500/30 animate-scale">
                        <CheckCircle2 className="w-12 h-12" />
                      </div>
                    )}
                    {result.status === 'NON_VERIFIE' && (
                      <div className="bg-amber-500/10 text-amber-400 p-4 rounded-full border border-amber-500/30">
                        <AlertTriangle className="w-12 h-12" />
                      </div>
                    )}
                    {result.status === 'CONTREFAÇON_SUSPECTE' && (
                      <div className="bg-red-500/10 text-red-400 p-4 rounded-full border border-red-500/30 animate-bounce">
                        <XOctagon className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold tracking-wide uppercase">
                      {result.status === 'AUTHENTIQUE' && 'PRODUIT AUTHENTIQUE'}
                      {result.status === 'NON_VERIFIE' && 'MARQUE EN ATTENTE'}
                      {result.status === 'CONTREFAÇON_SUSPECTE' && 'RÉFÉRENCE INCORRECTE'}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">CODE: {scannedCode}</p>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    {result.status === 'AUTHENTIQUE' && `Cet article provient bien de la manufacture "${result.marque?.nom_organisation}".`}
                    {result.status === 'NON_VERIFIE' && 'L\'article est identifié mais le fabricant n\'a pas encore de certification officielle.'}
                    {result.status === 'CONTREFAÇON_SUSPECTE' && 'Ce code ne correspond à aucun brevet émis sur la plateforme.'}
                  </p>
                  <button
                    onClick={() => { setResult(null); setScannedCode(''); }}
                    className="mt-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 py-2 px-4 rounded-xl border border-slate-700 font-bold transition cursor-pointer"
                  >
                    Scanner à nouveau
                  </button>
                </div>
              ) : (
                /* Landing screen instructions */
                <div className="text-center space-y-5">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto shadow-lg border border-slate-800 flex items-center justify-center">
                    <img 
                      src="/src/assets/images/pelou_logo_1782152421292.jpg" 
                      alt="Pelou Logo" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer" 
                    />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-sm tracking-wide font-display">Scanner de Poche Pelou</h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      Saisissez un numéro de code-barre ou testez rapidement avec l'un des raccourcis de démonstration à droite.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom barcode manual input */}
            <div className="space-y-3 z-10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={scannedCode}
                  onChange={(e) => setScannedCode(e.target.value)}
                  placeholder="Saisir code-barres"
                  className="bg-slate-900 border border-slate-800 text-xs px-3 py-2.5 rounded-xl w-full text-slate-200 font-mono placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  onClick={() => handleRunScan(scannedCode)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-2.5 rounded-xl cursor-pointer transition flex items-center justify-center shadow-md shadow-indigo-600/10"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column details dashboard (8 columns) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Presets options card picker */}
          <div className="bg-white rounded-2xl border border-slate-150 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5 font-display">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              Raccourcis de simulation interactive
            </h3>
            <p className="text-slate-550 text-xs font-sans">
              Mettez-vous dans la peau d'un consommateur faisant ses achats et testez les différents cas de certification logicielle :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans">
              {demoPresets.map((preset, i) => (
                <button
                  key={i}
                  id={`preset-btn-${preset.code}`}
                  onClick={() => handleSelectPreset(preset.code)}
                  className="p-3.5 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-200 text-left border border-slate-150 rounded-xl transition cursor-pointer flex flex-col justify-between h-24 shadow-xs"
                >
                  <span className="text-xs font-bold text-slate-700 line-clamp-1 font-sans">{preset.label}</span>
                  <div className="mt-2 text-[10px] text-slate-400 leading-snug font-medium">
                    <p>{preset.desc}</p>
                    <p className="font-mono text-indigo-500 font-bold mt-1">Code : {preset.code}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Results Audit Board */}
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                key={scannedCode}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className={`rounded-2xl border p-6 shadow-sm space-y-6 ${
                  result.status === 'AUTHENTIQUE' ? 'bg-indigo-50/50 border-indigo-150 text-indigo-900' :
                  result.status === 'NON_VERIFIE' ? 'bg-amber-50/40 border-amber-150' : 
                  'bg-red-50/40 border-red-150'
                }`}
              >
                {/* Visual Title Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className={`text-[10px] uppercase font-mono font-bold px-2.5 py-1 rounded-full ${
                      result.status === 'AUTHENTIQUE' ? 'bg-indigo-100 text-indigo-800' :
                      result.status === 'NON_VERIFIE' ? 'bg-amber-100 text-amber-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      Verdict : {result.status}
                    </span>
                    <h2 className={`text-xl font-bold mt-2 font-display ${
                      result.status === 'AUTHENTIQUE' ? 'text-indigo-955 font-extrabold' :
                      result.status === 'NON_VERIFIE' ? 'text-amber-900 font-bold' : 
                      'text-red-955 font-extrabold'
                    }`}>
                      {result.message}
                    </h2>
                  </div>
                  {result.status === 'AUTHENTIQUE' && (
                    <Award className="w-12 h-12 text-indigo-600 flex-shrink-0 animate-bounce" />
                  )}
                </div>

                {/* Article and Shop Details Grid */}
                {result.article && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-xl p-5 border border-slate-150">
                    {/* Product sheet */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <Info className="w-3.5 h-3.5" />
                        Fiche technique de fabrication
                      </h4>
                      <div className="flex gap-4">
                        <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                          {result.article.image ? (
                            <img src={result.article.image} alt={result.article.nom} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <ImageIcon className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-800 text-sm leading-snug">{result.article.nom}</h3>
                          <p className="text-xs text-slate-500 font-bold mt-1">Marque : {result.article.marque}</p>
                          <p className="text-xs font-mono font-bold text-slate-600 mt-1">{result.article.prix.toLocaleString()} FCFA</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                        "{result.article.description}"
                      </p>
                    </div>

                    {/* Shop and Geo Details */}
                    {result.boutique && (
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Store className="w-3.5 h-3.5" />
                          Point de vente audité
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2.5">
                            <MapPin className="w-5 h-5 text-slate-400" />
                            <div>
                              <p className="text-xs font-extrabold text-slate-700">{result.boutique.nom}</p>
                              <p className="text-[11px] text-slate-400 truncate">{result.boutique.adresse}</p>
                            </div>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5 text-xs text-slate-500 leading-relaxed font-mono">
                            <p>Ville: <span className="text-slate-700 font-bold">{Database.getVilles().find(v => v.id === result.boutique?.ville_id)?.nom}</span></p>
                            <p>Quartier: <span className="text-slate-700 font-bold">{Database.getQuartiers().find(q => q.id === result.boutique?.quartier_id)?.nom}</span></p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Option to report counterfeit if suspect or unknown */}
                {(result.status === 'CONTREFAÇON_SUSPECTE' || result.status === 'NON_VERIFIE') && (
                  <div className="bg-red-50/50 rounded-xl p-4 border border-red-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-red-950 uppercase flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        Incident suspecté détecté ?
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Signalez immédiatement l'affaire pour qu'un inspecteur Pelou audite la boutique physique.
                      </p>
                    </div>
                    <button
                      onClick={handleReportAbuse}
                      className="px-4 py-2 bg-red-650 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                    >
                      <Flag className="w-3.5 h-3.5" />
                      Signaler un abus
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Informative Info card explaining the system backend logic */}
          <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 text-white space-y-4">
            <h3 className="font-bold text-indigo-400 tracking-wider uppercase text-xs font-display">
              Algorithme Logiciel de Certification Django :
            </h3>
            <p className="text-xs leading-relaxed text-slate-300 font-sans">
              Le simulateur exécute la logique métier certifiée de Pelou en 4 étapes de filtrage de données :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1 font-mono text-[10px]">
              <div className="bg-slate-850 p-3 rounded-xl border border-slate-800">
                <span className="text-indigo-400 font-bold text-sm">1. Scan</span>
                <p className="text-slate-400 mt-1 leading-normal">
                  Récupération du code-barres textuel et recherche dans le modèle <span className="text-slate-200">CodeBarre</span>.
                </p>
              </div>
              <div className="bg-slate-850 p-3 rounded-xl border border-slate-800">
                <span className="text-indigo-400 font-bold text-sm">2. Jointure</span>
                <p className="text-slate-400 mt-1 leading-normal">
                  Identification de l'<span className="text-slate-200">Article</span> relié, extraction de son champ texte libre <span className="text-slate-200">Article.marque</span>.
                </p>
              </div>
              <div className="bg-slate-850 p-3 rounded-xl border border-slate-800">
                <span className="text-indigo-400 font-bold text-sm">3. Audit</span>
                <p className="text-slate-400 mt-1 leading-normal">
                  Vérification par correspondance exacte insensible à la casse avec <span className="text-slate-200">Marque.nom_organisation</span>.
                </p>
              </div>
              <div className="bg-slate-850 p-3 rounded-xl border border-slate-800">
                <span className="text-indigo-400 font-bold text-sm">4. Verdict</span>
                <p className="text-slate-400 mt-1 leading-normal">
                  Contrôle du champ <span className="text-slate-250">Marque.is_verified == True</span>. Validation du statut certifié de l'original.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
