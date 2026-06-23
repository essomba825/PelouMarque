/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Marque, Article, Boutique } from '../types';
import { Database } from '../data/db';
import { PelouApiService } from '../data/api';
import {
  ShoppingBag,
  PlusCircle,
  Trash2,
  Edit3,
  Store,
  Package,
  X,
  AlertCircle,
  Link2,
  Image as ImageIcon,
  Sparkles,
  UploadCloud,
  Loader2,
} from 'lucide-react';

interface BrandArticlesProps {
  currentUser: User;
  currentBrand: Marque;
  onRefreshDashboard?: () => void;
}

const PRODUCT_PRESET_IMAGES = [
  { name: 'Flacon Cosmétique Vert', url: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400&auto=format&fit=crop&q=80' },
  { name: 'Crème Pot Doré',         url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&auto=format&fit=crop&q=80' },
  { name: 'Soin Ampoule Dropper',   url: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=400&auto=format&fit=crop&q=80' },
  { name: 'Tissu Traditionnel',     url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&auto=format&fit=crop&q=80' },
  { name: 'Épicerie Piment Shaker', url: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&auto=format&fit=crop&q=80' },
  { name: 'Sac Éco Toile',          url: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=400&auto=format&fit=crop&q=80' },
];

const IMAGE_RULES: { keywords: string[]; index: number }[] = [
  { keywords: ['crème', 'butter', 'karité', 'lotion', 'beurre'],                 index: 1 },
  { keywords: ['sérum', 'huile', 'oil', 'soin', 'flacon', 'dropper', 'ampoule'], index: 0 },
  { keywords: ['savon', 'soap'],                                                   index: 2 },
  { keywords: ['piment', 'épice', 'sauce', 'poivre', 'chili', 'épicerie'],       index: 4 },
  { keywords: ['tissu', 'wax', 'pagne', 'vêtement', 'print', 'textile'],         index: 3 },
  { keywords: ['sac', 'panier', 'bag', 'cuir', 'toile', 'leather'],              index: 5 },
];

function resolvePresetImage(nom: string, category: string, marque: string): string {
  const text = `${nom} ${category} ${marque}`.toLowerCase();
  const match = IMAGE_RULES.find(r => r.keywords.some(kw => text.includes(kw)));
  return PRODUCT_PRESET_IMAGES[match ? match.index : 0].url;
}

export default function BrandArticles({ currentUser, currentBrand, onRefreshDashboard }: BrandArticlesProps) {
  const [articles,       setArticles]       = useState<Article[]>(() => Database.getArticlesByMarque(currentBrand.nom_organisation));
  const [showAddForm,    setShowAddForm]    = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  // ── Boutiques — toujours chargées depuis Django pour avoir les vrais IDs ──
  const [boutiques,        setBoutiques]        = useState<Boutique[]>([]);
  const [boutiquesLoading, setBoutiquesLoading] = useState(true);
  const [boutiquesError,   setBoutiquesError]   = useState('');

  useEffect(() => {
    setBoutiquesLoading(true);
    PelouApiService.getBoutiques()
      .then((data) => {
        setBoutiques(data);
        setBoutiquesError('');
      })
      .catch(() => {
        // Fallback sur la DB locale si Django est injoignable
        const local = Database.getBoutiques();
        setBoutiques(local);
        setBoutiquesError('Boutiques chargées en mode local (serveur Django injoignable).');
      })
      .finally(() => setBoutiquesLoading(false));
  }, []);

  // ── Form states ─────────────────────────────────────────────────────────────
  const [nom,            setNom]            = useState('');
  const [boutiqueId,     setBoutiqueId]     = useState<number>(0);
  const [prix,           setPrix]           = useState<number>(0);
  const [description,    setDescription]    = useState('');
  const [stock,          setStock]          = useState<number>(10);
  const [category,       setCategory]       = useState('');
  const [selectedImage,  setSelectedImage]  = useState(PRODUCT_PRESET_IMAGES[0].url);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [formError,      setFormError]      = useState('');

  // ── File upload states ───────────────────────────────────────────────────────
  const [uploadedFile,     setUploadedFile]     = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [dragActive,       setDragActive]       = useState<boolean>(false);

  // ── AI suggestion ────────────────────────────────────────────────────────────
  const [isSuggestingImage,   setIsSuggestingImage]   = useState(false);
  const [isAutoImageAttached, setIsAutoImageAttached] = useState(false);

  // ── Boutique sélectionnée — détermine si prix/stock sont affichés ────────────
  const boutiqueSelectionnee = boutiqueId > 0;

  // ── Auto-visuel ──────────────────────────────────────────────────────────────
  const triggerAutoImage = (productName: string, categoryName: string) => {
    const text = `${productName} ${categoryName}`.toLowerCase();
    const match = IMAGE_RULES.find(r => r.keywords.some(kw => text.includes(kw)));
    if (match) {
      setSelectedImage(PRODUCT_PRESET_IMAGES[match.index].url);
      setCustomImageUrl('');
      setIsAutoImageAttached(true);
    }
  };

  const handleNomChange      = (val: string) => { setNom(val);      triggerAutoImage(val, category); };
  const handleCategoryChange = (val: string) => { setCategory(val); triggerAutoImage(nom, val);      };

  // ── Suggestion locale ────────────────────────────────────────────────────────
  const askForIllustration = () => {
    if (!nom.trim() && !category.trim()) {
      setFormError("Saisissez au moins le nom ou la catégorie pour obtenir une suggestion.");
      return;
    }
    setFormError('');
    setIsSuggestingImage(true);
    setIsAutoImageAttached(false);
    setTimeout(() => {
      const chosen = resolvePresetImage(nom, category, currentBrand.nom_organisation);
      setSelectedImage(chosen);
      setCustomImageUrl('');
      setUploadedImageUrl('');
      setUploadedFile(null);
      setIsAutoImageAttached(true);
      setIsSuggestingImage(false);
    }, 400);
  };

  // ── Upload / drag-drop ───────────────────────────────────────────────────────
  const processSelectedFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setFormError("Le fichier sélectionné doit être une image valide.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormError("L'image est trop volumineuse. Choisissez une image de moins de 5 Mo.");
      return;
    }
    setUploadedFile(file);
    setFormError('');
    setIsAutoImageAttached(false);
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImageUrl(reader.result as string);
      setSelectedImage('');
      setCustomImageUrl('');
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) processSelectedFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files?.[0]) processSelectedFile(e.target.files[0]);
  };

  const handleRemoveUploadedImage = () => {
    setUploadedFile(null);
    setUploadedImageUrl('');
    setSelectedImage(PRODUCT_PRESET_IMAGES[0].url);
  };

  // ── Reset / open / close form ────────────────────────────────────────────────
  const resetForm = () => {
    setNom('');
    setBoutiqueId(0);
    setPrix(0);
    setDescription('');
    setStock(10);
    setCategory('');
    setSelectedImage(PRODUCT_PRESET_IMAGES[0].url);
    setCustomImageUrl('');
    setFormError('');
    setEditingArticle(null);
    setIsSuggestingImage(false);
    setIsAutoImageAttached(false);
    setUploadedFile(null);
    setUploadedImageUrl('');
    setDragActive(false);
  };

  const handleCloseForm   = () => { resetForm(); setShowAddForm(false); };
  const handleOpenAddForm = () => { resetForm(); setShowAddForm(true);  };

  const handleOpenEditForm = (art: Article) => {
    setEditingArticle(art);
    setNom(art.nom);
    setBoutiqueId(art.boutique_id ?? 0);
    setPrix(art.prix);
    setDescription(art.description);
    setStock(art.stock);
    setCategory(art.category || '');
    setUploadedFile(null);
    setDragActive(false);

    if (PRODUCT_PRESET_IMAGES.some(p => p.url === art.image)) {
      setSelectedImage(art.image || PRODUCT_PRESET_IMAGES[0].url);
      setCustomImageUrl('');
      setUploadedImageUrl('');
    } else if (art.image?.startsWith('data:image')) {
      setUploadedImageUrl(art.image);
      setSelectedImage('');
      setCustomImageUrl('');
    } else {
      setCustomImageUrl(art.image || '');
      setSelectedImage('');
      setUploadedImageUrl('');
    }
    setFormError('');
    setShowAddForm(true);
  };

  // ── Sauvegarde ───────────────────────────────────────────────────────────────
  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!nom.trim())         return setFormError('Le nom du produit est obligatoire.');
    if (!description.trim()) return setFormError('Veuillez renseigner une courte description.');

    // Prix et stock sont requis seulement si une boutique est sélectionnée
    if (boutiqueSelectionnee) {
      if (prix <= 0) return setFormError('Le prix doit être supérieur à 0 FCFA.');
      if (stock < 0) return setFormError('Le stock ne peut pas être négatif.');
    }

    const imgUrl      = uploadedImageUrl || customImageUrl.trim() || selectedImage;
    const useDjango   = localStorage.getItem('pelou_use_livedjango') === 'true';
    const djangoToken = localStorage.getItem('pelou_django_token') || '';

    if (useDjango) {
      if (!djangoToken) return setFormError('Vous êtes déconnecté du serveur Django. Reconnectez-vous.');

      try {
        setFormError('Enregistrement en cours...');
        const response = await PelouApiService.createArticle(djangoToken, {
          nom,
          description,
          // Prix et stock uniquement si boutique choisie
          ...(boutiqueSelectionnee && { prix: Number(prix), stock: Number(stock) }),
          category,
          ...(boutiqueSelectionnee && { boutique_id: Number(boutiqueId) }),
          image: uploadedFile || undefined,
        });

        const finalImgUrl = response?.article?.image || imgUrl;

        Database.addArticle({
          nom,
          boutique_id: boutiqueId,
          prix:        boutiqueSelectionnee ? Number(prix) : 0,
          description,
          stock:       boutiqueSelectionnee ? Number(stock) : 0,
          category,
          image:       finalImgUrl,
          est_actif:   true,
          quantite:    1,
          is_featured: false,
          marque:      currentBrand.nom_organisation,
        });

        setArticles(Database.getArticlesByMarque(currentBrand.nom_organisation));
        setShowAddForm(false);
        resetForm();
        onRefreshDashboard?.();
      } catch (err: any) {
        return setFormError(`Erreur serveur : ${err.message || 'Le serveur est injoignable.'}`);
      }

    } else {
      if (editingArticle) {
        const updated = Database.updateArticle(editingArticle.id, {
          nom,
          boutique_id: boutiqueId,
          prix:        boutiqueSelectionnee ? Number(prix) : 0,
          description,
          stock:       boutiqueSelectionnee ? Number(stock) : 0,
          category,
          image:       imgUrl,
        });
        if (updated) {
          setArticles(Database.getArticlesByMarque(currentBrand.nom_organisation));
          setShowAddForm(false);
          resetForm();
          onRefreshDashboard?.();
        }
      } else {
        Database.addArticle({
          nom,
          boutique_id: boutiqueId,
          prix:        boutiqueSelectionnee ? Number(prix) : 0,
          description,
          stock:       boutiqueSelectionnee ? Number(stock) : 0,
          category,
          image:       imgUrl,
          est_actif:   true,
          quantite:    1,
          is_featured: false,
          marque:      currentBrand.nom_organisation,
        });
        setArticles(Database.getArticlesByMarque(currentBrand.nom_organisation));
        setShowAddForm(false);
        resetForm();
        onRefreshDashboard?.();
      }
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Voulez-vous vraiment supprimer cet article ? Cette action est irréversible.')) {
      Database.deleteArticle(id);
      setArticles(Database.getArticlesByMarque(currentBrand.nom_organisation));
      onRefreshDashboard?.();
    }
  };

  const getBoutiqueName = (id: number) =>
    boutiques.find(b => b.id === id)?.nom || '—';

  // ── Rendu ────────────────────────────────────────────────────────────────────
  return (
    <div id="articles-management" className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2 font-display">
            <ShoppingBag className="w-8 h-8 text-indigo-600" />
            Gestion du Catalogue Articles
          </h1>
          <p className="text-slate-500 mt-1 font-sans">
            Produits référencés sous la marque{' '}
            <span className="font-semibold text-slate-800">{currentBrand.nom_organisation}</span>.
          </p>
        </div>
        <button
          id="btn-add-product-modal"
          onClick={handleOpenAddForm}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition flex items-center gap-2 self-start cursor-pointer shadow-md shadow-indigo-600/10"
        >
          <PlusCircle className="w-5 h-5" />
          Ajouter un article
        </button>
      </div>

      {/* Grille articles */}
      {articles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 py-16 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8 text-indigo-500" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-bold text-slate-800 text-lg font-display">Aucun article enregistré</h3>
            <p className="text-slate-500 text-sm">
              Aucun produit n'est encore configuré sous "{currentBrand.nom_organisation}".
            </p>
          </div>
          <button
            onClick={handleOpenAddForm}
            className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 text-sm font-bold rounded-xl transition cursor-pointer"
          >
            Créer maintenant
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {articles.map((art) => (
            <div
              key={art.id}
              className="bg-white rounded-2xl border border-slate-150 shadow-xs flex flex-col justify-between overflow-hidden hover:shadow-md transition"
            >
              <div className="relative h-48 bg-slate-50">
                {art.image ? (
                  <img src={art.image} alt={art.nom} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <ImageIcon className="w-12 h-12" />
                  </div>
                )}
                {art.prix > 0 && (
                  <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1 rounded-full font-bold text-sm font-mono shadow-md">
                    {art.prix.toLocaleString()} FCFA
                  </div>
                )}
                {art.category && (
                  <span className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border border-slate-150">
                    {art.category}
                  </span>
                )}
              </div>

              <div className="p-5 flex-grow space-y-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-base line-clamp-1 font-display">{art.nom}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed font-sans">{art.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100/80 text-xs font-medium font-sans">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Store className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="truncate text-slate-500">
                      {art.boutique_id ? getBoutiqueName(art.boutique_id) : 'Sans boutique'}
                    </span>
                  </div>
                  {art.stock > 0 && (
                    <div className="flex items-center gap-1.5 justify-end">
                      <Package className="w-4 h-4 text-slate-400" />
                      <span className={`font-bold font-mono ${art.stock <= 5 ? 'text-red-600' : 'text-slate-600'}`}>
                        {art.stock} pcs
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 px-5 py-4 border-t border-slate-100 flex items-center justify-between gap-3 font-mono">
                <span className="text-[10px] text-slate-400 select-none uppercase font-bold">ID : {art.id}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditForm(art)}
                    className="p-2 bg-white text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl border border-slate-200 hover:border-indigo-200 transition cursor-pointer"
                    title="Modifier"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(art.id)}
                    className="p-2 bg-white text-red-500 hover:bg-red-50 rounded-xl border border-slate-200 hover:border-red-200 transition cursor-pointer"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showAddForm && (
        <div
          id="modal-product"
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col">

            {/* En-tête */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 font-display">
                {editingArticle ? "Modifier l'article" : 'Enregistrer un nouvel article'}
              </h2>
              <button
                id="btn-close-modal"
                onClick={handleCloseForm}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="p-6 space-y-5 flex-grow font-sans">

              {formError && (
                <div className="bg-red-50 text-red-700 text-sm p-4 rounded-xl border border-red-100 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Nom + Catégorie */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-slate-700 font-bold text-xs uppercase tracking-wider">
                      Nom du produit
                    </label>
                    {isAutoImageAttached && (
                      <span className="text-[10px] bg-indigo-50 text-indigo-600 font-mono font-bold px-1.5 py-0.5 rounded-md animate-pulse">
                        Auto-visuel lié
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={nom}
                    onChange={(e) => handleNomChange(e.target.value)}
                    placeholder="Saisissez le nom exact"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold text-xs uppercase tracking-wider mb-1.5">
                    Catégorie
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    placeholder="ex: Crème de soin, Épices, Sac en osier"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-slate-800"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-700 font-bold text-xs uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Origine, composition, mode de fabrication..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-slate-800"
                />
              </div>

              {/* Boutique */}
              <div>
                <label className="block text-slate-700 font-bold text-xs uppercase tracking-wider mb-1.5">
                  Boutique de distribution{' '}
                  <span className="text-slate-400 font-normal normal-case">(optionnel)</span>
                </label>

                {boutiquesError && (
                  <p className="text-[11px] text-amber-600 mb-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {boutiquesError}
                  </p>
                )}

                {boutiquesLoading ? (
                  <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Chargement des boutiques...
                  </div>
                ) : (
                  <select
                    value={boutiqueId}
                    onChange={(e) => {
                      setBoutiqueId(Number(e.target.value));
                      // Reset prix/stock si on désélectionne
                      if (Number(e.target.value) === 0) { setPrix(0); setStock(0); }
                    }}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-slate-800"
                  >
                    <option value={0}>— Ne pas préciser pour l'instant —</option>
                    {boutiques.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.nom}{b.adresse ? ` (${b.adresse})` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Prix + Stock — affichés seulement si une boutique est choisie */}
              {boutiqueSelectionnee && (
                <div
                  className="grid grid-cols-2 gap-4 p-4 bg-indigo-50/40 border border-indigo-100 rounded-2xl"
                >
                  <div>
                    <label className="block text-slate-700 font-bold text-xs uppercase tracking-wider mb-1.5">
                      Prix (FCFA)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={prix || ''}
                      onChange={(e) => setPrix(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold text-xs uppercase tracking-wider mb-1.5">
                      Stock initial
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={stock || ''}
                      onChange={(e) => setStock(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-slate-800 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Visuel produit */}
              <div className="space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-slate-700 font-bold text-xs uppercase tracking-wider">
                      Visuel du produit
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Importez votre propre image ou laissez l'IA choisir un visuel adapté.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={askForIllustration}
                    disabled={isSuggestingImage}
                    className={`px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-700 font-bold text-xs flex items-center gap-1.5 transition ${
                      isSuggestingImage
                        ? 'bg-indigo-50 opacity-70 cursor-not-allowed'
                        : 'bg-white hover:bg-indigo-50 hover:border-indigo-300 cursor-pointer shadow-xs'
                    }`}
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-indigo-500 ${isSuggestingImage ? 'animate-spin' : ''}`} />
                    {isSuggestingImage ? 'Analyse...' : 'Suggérer un visuel'}
                  </button>
                </div>

                {/* Drag & Drop */}
                <div
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition flex flex-col items-center justify-center gap-3 ${
                    dragActive
                      ? 'border-indigo-600 bg-indigo-50/50'
                      : uploadedImageUrl
                        ? 'border-indigo-200 bg-slate-50/30'
                        : 'border-slate-200 hover:border-indigo-300 bg-slate-50/50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="file-upload-article"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {uploadedImageUrl ? (
                    <div className="w-full flex flex-col items-center gap-3">
                      <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-slate-200 shadow-sm group">
                        <img src={uploadedImageUrl} alt="Prévisualisation" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={handleRemoveUploadedImage}
                          className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition cursor-pointer text-xs font-bold"
                        >
                          Supprimer
                        </button>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold text-indigo-700">Image personnalisée chargée</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5 max-w-[200px] truncate">
                          {uploadedFile ? `${uploadedFile.name} (${(uploadedFile.size / 1024).toFixed(1)} Ko)` : 'Image de l\'article'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveUploadedImage}
                        className="text-xs text-red-500 hover:text-red-700 font-bold transition cursor-pointer"
                      >
                        Revenir aux images types
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="file-upload-article" className="w-full flex flex-col items-center justify-center cursor-pointer py-1.5">
                      <div className="p-3 bg-white rounded-full shadow-xs border border-slate-150 text-indigo-500 mb-2.5">
                        <UploadCloud className="w-6 h-6 animate-pulse" />
                      </div>
                      <p className="text-sm font-bold text-slate-700">Glissez-déposez l'image du produit ici</p>
                      <p className="text-xs text-slate-400 mt-1">
                        ou <span className="text-indigo-600 underline font-bold">parcourez vos fichiers</span>
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono mt-2 bg-white px-2 py-0.5 rounded-md border border-slate-100">
                        JPEG, PNG, WEBP — Max 5 Mo
                      </p>
                    </label>
                  )}
                </div>

                {/* Presets */}
                <div className="flex items-center gap-3 text-slate-400 text-[10px] font-bold uppercase tracking-wider justify-center select-none">
                  <div className="h-px bg-slate-200 flex-grow" />
                  Ou choisir une image type
                  <div className="h-px bg-slate-200 flex-grow" />
                </div>

                <div className="grid grid-cols-6 gap-2">
                  {PRODUCT_PRESET_IMAGES.map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setSelectedImage(preset.url);
                        setCustomImageUrl('');
                        setUploadedImageUrl('');
                        setUploadedFile(null);
                        setIsAutoImageAttached(false);
                      }}
                      className={`relative aspect-square bg-slate-100 rounded-lg overflow-hidden border-2 transition ${
                        selectedImage === preset.url && !uploadedImageUrl
                          ? 'border-indigo-600 scale-95 shadow-md'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>

                {/* URL externe */}
                <div className="flex items-center gap-2">
                  <div className="bg-slate-100 p-2.5 rounded-xl text-slate-400">
                    <Link2 className="w-5 h-5" />
                  </div>
                  <input
                    type="url"
                    value={customImageUrl}
                    onChange={(e) => {
                      setCustomImageUrl(e.target.value);
                      setSelectedImage('');
                      setUploadedImageUrl('');
                      setUploadedFile(null);
                      setIsAutoImageAttached(false);
                    }}
                    placeholder="Ou collez un lien HTTP d'image externe"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-xs text-slate-800 font-mono"
                  />
                </div>
              </div>

              {/* Badge certification */}
              <div className="flex items-center gap-2 text-xs text-slate-400 font-sans">
                <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                Cet article sera automatiquement certifié sous la marque{' '}
                <span className="font-semibold text-slate-600">{currentBrand.nom_organisation}</span>.
              </div>

              {/* Boutons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  id="btn-save-product-submit"
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition cursor-pointer shadow-md shadow-indigo-600/10"
                >
                  {editingArticle ? 'Enregistrer les modifications' : 'Enregistrer le produit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}