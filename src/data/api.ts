/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Ville, Quartier, Domaine, User, Boutique, Marque, Article, CodeBarre } from '../types';

// Récupération de l'URL de l'API Django configurée dans .env.local ou en production (Vercel)
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

/**
 * Service d'API pour l'interaction avec le backend Django de Pelou.
 * Ce service est prêt à l'emploi. Vous pouvez l'importer dans vos composants de gestion de marque.
 */
export class PelouApiService {
  
  /**
   * Helper pour configurer les en-têtes d'autorisation avec le token (code_connexion) de la marque.
   */
  private static getHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  /**
   * 1. Connexion de marque
   * POST <VITE_API_BASE_URL>/api/brands/login/
   */
  public static async loginBrand(
    codeConnexion: string,
    password?: string,
    usernameOrEmail?: string
  ): Promise<{ token: string; user: User; marque?: Marque }> {
    const url = `${API_BASE_URL}/api/brands/login/`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ 
        code_connexion: codeConnexion,
        password: password,
        username: usernameOrEmail
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Identifiant de connexion invalide.');
    }

    return response.json();
  }


  /**
 * 7. Lister les boutiques partenaires depuis le serveur Django
 * GET <VITE_API_BASE_URL>/api/boutiques/
 */
public static async getBoutiques(): Promise<Boutique[]> {
  const url = `${API_BASE_URL}/api/brands/boutiques/`;
  const response = await fetch(url, {
    method: 'GET',
    headers: this.getHeaders()
  });

  if (!response.ok) {
    throw new Error('Impossible de charger les boutiques depuis le serveur.');
  }

  const data = await response.json();
  return data.boutiques || [];
}
  /**
   * 2. Récupérer le profil public complet d'une marque (avec ses articles)
   * GET <VITE_API_BASE_URL>/api/brands/<username>/
   */
  public static async getBrandProfile(username: string): Promise<Marque & { articles: Article[] }> {
    const url = `${API_BASE_URL}/api/brands/${username}/`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error('Impossible de charger le profil de la marque.');
    }

    return response.json();
  }

  /**
   * 3. Récupérer les articles d'une marque connectée
   * GET <VITE_API_BASE_URL>/api/brands/my-articles/
   */
  public static async getMyArticles(token: string): Promise<Article[]> {
    const url = `${API_BASE_URL}/api/brands/my-articles/`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(token)
    });

    if (!response.ok) {
      throw new Error('Erreur de récupération de vos articles.');
    }

    const data = await response.json();
    return data.articles || [];
  }

  /**
   * 4. Enregistrer un nouvel article distribuable dans une boutique
   * POST <VITE_API_BASE_URL>/api/brands/my-articles/
   */
  public static async createArticle(
    token: string,
    articleData: {
      nom: string;
      prix?: number;        // ← optionnel
      description: string;
      stock?: number;       // ← optionnel
      category: string;
      boutique_id?: number; // ← optionnel
      image?: File;
    }
  ): Promise<{ success: boolean; article: Article }> {
    const url = `${API_BASE_URL}/api/brands/my-articles/`;
  
    let headers: HeadersInit = {};
    let body: BodyInit;
  
    if (articleData.image) {
      const formData = new FormData();
      formData.append('nom', articleData.nom);
      formData.append('description', articleData.description);
      formData.append('category', articleData.category);
  
      // Ajoute prix/stock/boutique UNIQUEMENT s'ils sont fournis
      if (articleData.prix !== undefined) {
        formData.append('prix', String(articleData.prix));
      }
      if (articleData.stock !== undefined) {
        formData.append('stock', String(articleData.stock));
      }
      if (articleData.boutique_id !== undefined && articleData.boutique_id !== 0) {
        formData.append('boutique_id', String(articleData.boutique_id));
      }
  
      formData.append('image', articleData.image);
  
      headers = {
        'Authorization': `Bearer ${token}`
        // pas de Content-Type manuel pour multipart
      };
      body = formData;
    } else {
      // JSON : exclut boutique_id, prix, stock s'ils sont absents
      const jsonBody: any = {
        nom: articleData.nom,
        description: articleData.description,
        category: articleData.category,
      };
      if (articleData.prix !== undefined) jsonBody.prix = articleData.prix;
      if (articleData.stock !== undefined) jsonBody.stock = articleData.stock;
      if (articleData.boutique_id !== undefined && articleData.boutique_id !== 0) {
        jsonBody.boutique_id = articleData.boutique_id;
      }
  
      headers = this.getHeaders(token);
      body = JSON.stringify(jsonBody);
    }
  
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
    });
  
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Erreur d’enregistrement de l’article.');
    }
  
    return response.json();
  }
  /**
   * 5. Associer des codes-barres uniques en masse à un article
   * POST <VITE_API_BASE_URL>/api/brands/barcode/generate/
   */
  public static async generateBarcodes(token: string, articleId: number, codes: string[]): Promise<{ success: boolean; added_count: number }> {
    const url = `${API_BASE_URL}/api/brands/barcode/generate/`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ article_id: articleId, codes })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Erreur lors de l’association des codes-barres.');
    }

    return response.json();
  }

  /**
   * 6. Scanner public / vérification de l'authenticité d'un code-barres
   * GET <VITE_API_BASE_URL>/api/brands/verify/<barcode>/
   */
  public static async verifyProductAuthenticity(barcode: string): Promise<{
    verified: boolean;
    code: string;
    message: string;
    timestamp: string;
    article: Omit<Article, 'boutique_id' | 'stock'>;
    brand: { nom: string; is_verified: boolean; logo: string | null };
    distribution: Array<{ nom: string; adresse: string; ville: string; quantite_stock: number; statut_stock: string }>;
  }> {
    const url = `${API_BASE_URL}/api/brands/verify/${encodeURIComponent(barcode)}/`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Scannage échoué : code inconnu ou contrefait.');
    }

    return response.json();
  }
}
