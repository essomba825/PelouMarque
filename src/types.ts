/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Ville {
  id: number;
  nom: string;
  geom?: string; // Représenté par du GeoJSON ou des coordonnées simples
}

export interface Quartier {
  id: number;
  nom: string;
  ville_id: number;
  geom?: string;
}

export interface Domaine {
  id: number;
  nom: string;
  slug: string;
  icon?: string;
  is_predefined: boolean;
  created_at: string;
}

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  email: string;
  numero_telephone: string;
  ville?: string;
  quartiers?: string;
  is_partner: boolean;
  is_marque: boolean;
  nom_organisation?: string | null;
  description_entreprise?: string | null;
  description_domaine?: string | null;
  bio?: string | null;
  image_profil?: string | null; // URL ou base64
  image_couverture?: string | null; // URL ou base64
  verified: boolean;
  code_connexion?: string | null; // Code secret pour connexion partenaire/marque
  shops_count: number;
  items_count: number;
  domaines?: number[]; // IDs des domaines
}

export interface Boutique {
  id: number;
  nom: string;
  slug: string;
  numero_telephone?: string | null;
  adresse?: string | null;
  site_web?: string | null;
  image?: string | null;
  date_ajout: string;
  date_modification: string;
  status: 'ouvert' | 'ferme' | 'construction' | 'renovation' | 'cession';
  horaires_semaine: string;
  horaires_weekend: string;
  horaires_feries: string;
  description: string;
  ville_id: number;
  quartier_id: number;
  proprietaire_id: number; // User.id (is_partner=True)
  rating?: number | null;
  reviews_count?: number | null;
  services?: string; // Séparés par virgules
  is_featured: boolean;
  items_count: number;
  latitude?: number;
  longitude?: number;
}

export interface Marque {
  id: number;
  user_id?: number | null; // OneToOne avec User
  nom_organisation: string; // unique, insensible à la casse
  email?: string | null;
  numero_telephone?: string;
  description?: string;
  bio?: string;
  logo?: string | null;
  image_couverture?: string | null;
  site_web?: string | null;
  domaines?: number[]; // IDs des domaines
  is_verified: boolean; // Marque vérifiée par Pelou
  is_active: boolean;
  date_creation: string;
  date_modification: string;
  articles_count: number;
  followers_count: number;
}

export interface Article {
  id: number;
  nom: string;
  slug: string;
  boutique_id: number; // FK Boutique
  prix: number;
  description: string;
  date_ajout: string;
  stock: number;
  image?: string | null;
  image_2?: string | null;
  est_actif: boolean;
  quantite: number;
  is_featured: boolean;
  rating: number;
  reviews_count: number;
  category?: string | null;
  marque: string; // Nom libre de la marque (champ texte)
}

export interface StockBoutique {
  id: number;
  article_id: number;
  boutique_id: number;
  quantite: number;
  seuil_alerte: number;
  date_mise_a_jour: string;
}

export interface CodeBarre {
  id: number;
  code: string; // unique
  article_id: number; // FK Article
  date_ajout: string;
  createur_id: number | null; // User.id (is_marque=True)
}

// Interface supplémentaire pour stocker les statistiques de scans simulés (anti-contrefaçon)
export interface ScanLog {
  id: number;
  code: string;
  date: string;
  success: boolean; // Si authentifié avec succès
  marque_nom: string;
  article_nom?: string;
  boutique_nom?: string;
  details?: string;
}
