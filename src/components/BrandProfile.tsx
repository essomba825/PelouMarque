/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Marque } from '../types';
import { Database } from '../data/db';
import { 
  UserCircle, 
  MapPin, 
  Globe, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Building, 
  Award, 
  Edit3, 
  FileText,
  AlertCircle,
  Link2
} from 'lucide-react';

interface BrandProfileProps {
  currentUser: User;
  currentBrand: Marque;
  onProfileUpdated: (updatedBrand: Marque) => void;
}

const BRAND_LOGO_PRESETS = [
  { name: 'Cosmétique Bio', url: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=150&auto=format&fit=crop&q=80' },
  { name: 'Mode Tissage', url: 'https://images.unsplash.com/photo-1481214110143-bc634a1fc6bcd?w=150&auto=format&fit=crop&q=80' },
  { name: 'Épicerie Piment', url: 'https://images.unsplash.com/photo-1430163393927-3dab9af7ea38?w=150&auto=format&fit=crop&q=80' }
];

export default function BrandProfile({ currentUser, currentBrand, onProfileUpdated }: BrandProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit Form Fields
  const [nom, setNom] = useState(currentBrand.nom_organisation);
  const [email, setEmail] = useState(currentBrand.email || '');
  const [phone, setPhone] = useState(currentBrand.numero_telephone || '');
  const [bio, setBio] = useState(currentBrand.bio || '');
  const [description, setDescription] = useState(currentBrand.description || '');
  const [siteWeb, setSiteWeb] = useState(currentBrand.site_web || '');
  const [selectedLogo, setSelectedLogo] = useState(currentBrand.logo || BRAND_LOGO_PRESETS[0].url);
  const [customLogoUrl, setCustomLogoUrl] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSuccess('');
    setFormError('');

    if (!nom.trim()) {
      setFormError('Le nom officiel d\'organisation de la marque est de rigueur.');
      return;
    }

    const updatedLogo = customLogoUrl.trim() || selectedLogo;

    // Sauvegarder dans la BD locale
    const saved = Database.saveMarqueProfile(currentBrand.id, {
      nom_organisation: nom,
      email,
      numero_telephone: phone,
      bio,
      description,
      site_web: siteWeb,
      logo: updatedLogo
    });

    if (saved) {
      setFormSuccess('Votre profil de marque a été révisé avec succès ! Les modifications sont prises en compte.');
      setIsEditing(false);
      onProfileUpdated(saved);
    } else {
      setFormError('Une erreur interne est survenue lors de l\'enregistrement.');
    }
  };

  return (
    <div id="brand-profile-tab" className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto">
      {/* Header Profile Title */}
      <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2 font-display">
            <UserCircle className="w-8 h-8 text-indigo-600" />
            Profil Officiel de la Marque
          </h1>
          <p className="text-slate-500 mt-1 font-sans">
            Configurez l'identité visuelle et les coordonnées officielles de votre manufacture.
          </p>
        </div>
        {!isEditing && (
          <button
            id="btn-edit-profile-trigger"
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition flex items-center gap-2 self-start sm:self-auto cursor-pointer font-sans shadow-xs"
          >
            <Edit3 className="w-4.5 h-4.5 text-indigo-600" />
            Modifier le profil
          </button>
        )}
      </div>

      {formSuccess && (
        <div className="bg-indigo-50/50 text-indigo-800 text-sm p-4 rounded-xl border border-indigo-100 flex items-start gap-2 font-sans">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-indigo-600" />
          <span>{formSuccess}</span>
        </div>
      )}

      {formError && (
        <div className="bg-red-50 text-red-650 text-sm p-4 rounded-xl border border-red-100 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-550" />
          <span>{formError}</span>
        </div>
      )}

      {isEditing ? (
        /* EDIT PROFILE VIEW FORM */
        <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-slate-150 shadow-sm p-6 space-y-6 font-sans">
          <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2 font-display">
            <Edit3 className="w-4.5 h-4.5 text-indigo-600" />
            Coordonnées de l'organisation
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-slate-700 font-bold text-xs uppercase tracking-wider mb-1.5">Nom de l'organisation</label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="ex : Bamboutos Cosmetics"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold text-xs uppercase tracking-wider mb-1.5">Adresse de contact Email</label>
              <input
                type="type"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ex : contact@bamboutos.cm"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-slate-800 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-slate-700 font-bold text-xs uppercase tracking-wider mb-1.5">Téléphone d'assistance</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="ex : +237 677 12 34 56"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold text-xs uppercase tracking-wider mb-1.5">Site vitrine d'entreprise</label>
              <input
                type="url"
                value={siteWeb}
                onChange={(e) => setSiteWeb(e.target.value)}
                placeholder="ex : https://www.bamboutos.cm"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-slate-800 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold text-xs uppercase tracking-wider mb-1.5">Courte biographie publicitaire (Max 150 caractères)</label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="ex : Marier science moderne et secrets ancestraux d'Afrique..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-slate-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold text-xs uppercase tracking-wider mb-1.5">Description complète d'activité</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Racontez l'histoire de vos terroirs, l'engagement et l'éthique de votre manufacture..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-slate-800 text-sm"
            />
          </div>

          {/* Logo Selector presets */}
          <div>
            <label className="block text-slate-700 font-bold text-xs uppercase tracking-wider mb-2">Logo de l'organisation</label>
            <div className="flex gap-4 items-center">
              {BRAND_LOGO_PRESETS.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { setSelectedLogo(p.url); setCustomLogoUrl(''); }}
                  className={`w-12 h-12 rounded-full overflow-hidden border-2 transition ${selectedLogo === p.url ? 'border-indigo-600 scale-105' : 'border-slate-200 opacity-70'}`}
                >
                  <img src={p.url} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
              <div className="flex items-center gap-2 flex-grow">
                <Link2 className="w-4 h-4 text-slate-400" />
                <input
                  type="url"
                  value={customLogoUrl}
                  onChange={(e) => { setCustomLogoUrl(e.target.value); setSelectedLogo(''); }}
                  placeholder="Ou entrez l'URL externe de votre logo corporatif"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Form Controls Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-white">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition cursor-pointer"
            >
              Annuler
            </button>
            <button
              id="btn-save-profile-submit"
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition cursor-pointer shadow-md shadow-indigo-600/10"
            >
              Sauvegarder les modifications
            </button>
          </div>
        </form>
      ) : (
        /* READ PROFILE CORPORATE CARD */
        <div className="bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-150 font-sans">
          {/* Left part Profile AvatarCard */}
          <div className="p-8 text-center space-y-4 flex flex-col items-center justify-center md:w-1/3 bg-slate-50/50">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-slate-250 overflow-hidden ring-4 ring-white shadow-lg">
                <img src={currentBrand.logo || BRAND_LOGO_PRESETS[0].url} alt={currentBrand.nom_organisation} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              {currentBrand.is_verified && (
                <div className="absolute bottom-1 right-1 bg-indigo-600 text-white p-1 rounded-full shadow-md border-2 border-white">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>
            <div>
              <h2 className="font-extrabold text-slate-805 text-slate-900 text-lg leading-snug font-display">{currentBrand.nom_organisation}</h2>
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 mt-2 rounded-full inline-block ${currentBrand.is_verified ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                {currentBrand.is_verified ? 'Vérification Validée' : 'Vérification en Attente'}
              </span>
            </div>
            {currentBrand.bio && (
              <p className="text-xs text-slate-500 italic max-w-xs font-sans">
                "{currentBrand.bio}"
              </p>
            )}
          </div>

          {/* Right part Profile corporate details */}
          <div className="p-8 flex-grow space-y-6 md:w-2/3 bg-white">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2 font-display">
              <Building className="w-5 h-5 text-indigo-600" />
              Identité de l'entreprise
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase font-sans">Présentation et Éthique de la marque</h4>
                  <p className="text-xs text-slate-605 text-slate-700 mt-1.5 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100 italic font-sans">
                    {currentBrand.description || "Aucune description détaillée n'a été rédigée."}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100/80 font-sans">
                <div className="flex items-center gap-2.5 text-xs text-slate-605">
                  <Mail className="w-4.5 h-4.5 text-slate-400" />
                  <div>
                    <h4 className="font-bold text-slate-450 uppercase text-[10px]">Email officiel</h4>
                    <p className="font-semibold text-slate-700 mt-0.5">{currentBrand.email || 'Non renseigné'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-605">
                  <Phone className="w-4.5 h-4.5 text-slate-400" />
                  <div>
                    <h4 className="font-bold text-slate-450 uppercase text-[10px]">Téléphone direct</h4>
                    <p className="font-semibold text-slate-700 mt-0.5">{currentBrand.numero_telephone || 'Non renseigné'}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100/80 font-sans">
                <div className="flex items-center gap-2.5 text-xs text-slate-605">
                  <Globe className="w-4.5 h-4.5 text-slate-400" />
                  <div>
                    <h4 className="font-bold text-slate-450 uppercase text-[10px]">Site Internet vitrine</h4>
                    {currentBrand.site_web ? (
                      <a href={currentBrand.site_web} target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-600 hover:text-indigo-700 underline mt-0.5">
                        {currentBrand.site_web.replace(/^https?:\/\//, '')}
                      </a>
                    ) : (
                      <p className="font-bold text-slate-400 mt-0.5">Aucun lien site web</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-605">
                  <Award className="w-4.5 h-4.5 text-slate-400" />
                  <div>
                    <h4 className="font-bold text-slate-450 uppercase text-[10px]">Agrément de l'administration</h4>
                    <p className="font-bold text-slate-700 mt-0.5 font-sans">
                      {currentBrand.is_verified ? 'Agréé Label Pelou ⭐' : 'Instruction de dossier en cours'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
