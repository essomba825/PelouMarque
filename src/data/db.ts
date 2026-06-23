/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Ville, Quartier, Domaine, User, Boutique, Marque, Article, StockBoutique, CodeBarre, ScanLog } from '../types';

// Données statiques initiales d'exemple si LocalStorage est vide
const INITIAL_VILLES: Ville[] = [
  { id: 1, nom: 'Douala' },
  { id: 2, nom: 'Yaoundé' },
  { id: 3, nom: 'Bafoussam' },
];

const INITIAL_QUARTIERS: Quartier[] = [
  { id: 1, nom: 'Akwa', ville_id: 1 },
  { id: 2, nom: 'Bonapriso', ville_id: 1 },
  { id: 3, nom: 'Bastos', ville_id: 2 },
  { id: 4, nom: 'Essos', ville_id: 2 },
  { id: 5, nom: 'Melen', ville_id: 2 },
];

const INITIAL_DOMAINES: Domaine[] = [
  { id: 1, nom: 'Cosmétiques & Beauté', slug: 'cosmetiques', icon: 'Sparkles', is_predefined: true, created_at: new Date().toISOString() },
  { id: 2, nom: 'Prêt-à-Porter & Mode', slug: 'mode', icon: 'Shirt', is_predefined: true, created_at: new Date().toISOString() },
  { id: 3, nom: 'Alimentation & Produits Locaux', slug: 'alimentation', icon: 'Apple', is_predefined: true, created_at: new Date().toISOString() },
  { id: 4, nom: 'Artisanat & Décoration', slug: 'artisanat', icon: 'Palette', is_predefined: true, created_at: new Date().toISOString() },
];

const INITIAL_USERS: User[] = [
  // Marques
  {
    id: 1,
    username: 'bamboutos_cosmetics',
    first_name: 'Alain',
    last_name: 'Fokou',
    email: 'contact@bamboutos.cm',
    numero_telephone: '+237 677 12 34 56',
    is_partner: true,
    is_marque: true,
    nom_organisation: 'Bamboutos Cosmetics',
    description_entreprise: 'Spécialiste de la cosmétique naturelle à base de beurre de karité et d’huiles précieuses locales.',
    bio: 'Marier science moderne et secrets ancestraux africains pour la beauté de votre peau.',
    image_profil: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=150&auto=format&fit=crop&q=80',
    image_couverture: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=1200&auto=format&fit=crop&q=80',
    verified: true,
    code_connexion: 'DOAK0001',
    shops_count: 0,
    items_count: 3,
    domaines: [1]
  },
  {
    id: 2,
    username: 'kente_prestige',
    first_name: 'Awa',
    last_name: 'Ndiaye',
    email: 'contact@kenteprestige.com',
    numero_telephone: '+237 699 98 76 54',
    is_partner: true,
    is_marque: true,
    nom_organisation: 'Kente Prestige',
    description_entreprise: 'Créations de haute couture en pagne tissé Kente traditionnel de qualité royale.',
    bio: 'La noblesse du textile africain revisitée pour le monde moderne.',
    image_profil: 'https://images.unsplash.com/photo-1481214110143-bc634a1fc6bcd?w=150&auto=format&fit=crop&q=80',
    image_couverture: 'https://images.unsplash.com/photo-1545048702-79362596cdc9?w=1200&auto=format&fit=crop&q=80',
    verified: false, // Non vérifiée pour montrer la différence dans le scanner d'authenticité !
    code_connexion: 'YABA0002',
    shops_count: 0,
    items_count: 2,
    domaines: [2]
  },
  {
    id: 3,
    username: 'afriq_food',
    first_name: 'Ngo',
    last_name: 'Bilik',
    email: 'contact@afriqfood.cm',
    numero_telephone: '+237 655 45 67 89',
    is_partner: true,
    is_marque: true,
    nom_organisation: 'AfriqFood',
    description_entreprise: 'Producteur agroalimentaire de sauces de pays, épices prêtes à cuire et cafés gourmets.',
    bio: 'Le meilleur des terroirs camerounais dans votre assiette.',
    image_profil: 'https://images.unsplash.com/photo-1430163393927-3dab9af7ea38?w=150&auto=format&fit=crop&q=80',
    image_couverture: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop&q=80',
    verified: true,
    code_connexion: 'DOAK0003',
    shops_count: 0,
    items_count: 2,
    domaines: [3]
  },
  // Partenaires (Propriétaires de boutiques qui distribuent les produits)
  {
    id: 10,
    username: 'jean_commercant',
    first_name: 'Jean',
    last_name: 'Simo',
    email: 'jean.simo@gmail.com',
    numero_telephone: '+237 680 11 22 33',
    is_partner: true,
    is_marque: false,
    nom_organisation: 'Simo Distribution',
    verified: true,
    code_connexion: 'DOAK0004',
    shops_count: 2,
    items_count: 4
  },
  {
    id: 11,
    username: 'amina_shop',
    first_name: 'Amina',
    last_name: 'Bello',
    email: 'amina.bello@yahoo.fr',
    numero_telephone: '+237 671 44 55 66',
    is_partner: true,
    is_marque: false,
    nom_organisation: 'Amina Cosmétiques',
    verified: true,
    code_connexion: 'YABA0005',
    shops_count: 1,
    items_count: 3
  }
];

const INITIAL_MARQUES: Marque[] = [
  {
    id: 1,
    user_id: 1,
    nom_organisation: 'Bamboutos Cosmetics',
    email: 'contact@bamboutos.cm',
    numero_telephone: '+237 677 12 34 56',
    description: 'Spécialiste de la cosmétique naturelle à base de beurre de karité et d’huiles précieuses locales de la région des Bamboutos.',
    bio: 'Marier science moderne et secrets ancestraux africains pour la beauté de votre peau.',
    logo: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=150&auto=format&fit=crop&q=80',
    image_couverture: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=1200&auto=format&fit=crop&q=80',
    site_web: 'https://www.bamboutos-cosmetics.cm',
    domaines: [1],
    is_verified: true, // Officiellement vérifiée
    is_active: true,
    date_creation: new Date().toISOString(),
    date_modification: new Date().toISOString(),
    articles_count: 3,
    followers_count: 1420
  },
  {
    id: 2,
    user_id: 2,
    nom_organisation: 'Kente Prestige',
    email: 'contact@kenteprestige.com',
    numero_telephone: '+237 699 98 76 54',
    description: 'Marque prestigieuse de textile et pièces cousues main en tissu Kente traditionnel authentique.',
    bio: 'La noblesse du textile africain revisitée pour le monde moderne.',
    logo: 'https://images.unsplash.com/photo-1481214110143-bc634a1fc6bcd?w=150&auto=format&fit=crop&q=80',
    image_couverture: 'https://images.unsplash.com/photo-1545048702-79362596cdc9?w=1200&auto=format&fit=crop&q=80',
    site_web: 'https://www.kenteprestige.com',
    domaines: [2],
    is_verified: false, // Non encore validée par l'admin Pelou
    is_active: true,
    date_creation: new Date().toISOString(),
    date_modification: new Date().toISOString(),
    articles_count: 2,
    followers_count: 380
  },
  {
    id: 3,
    user_id: 3,
    nom_organisation: 'AfriqFood',
    email: 'contact@afriqfood.cm',
    numero_telephone: '+237 655 45 67 89',
    description: 'Maison gourmande africaine. Sauces pimentées artisanales, épices moulues de Penja et café robusta sélectionné.',
    bio: 'Le meilleur des terroirs camerounais dans votre assiette.',
    logo: 'https://images.unsplash.com/photo-1430163393927-3dab9af7ea38?w=150&auto=format&fit=crop&q=80',
    image_couverture: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop&q=80',
    site_web: 'https://www.afriqfood.cm',
    domaines: [3],
    is_verified: true,
    is_active: true,
    date_creation: new Date().toISOString(),
    date_modification: new Date().toISOString(),
    articles_count: 2,
    followers_count: 890
  }
];

const INITIAL_BOUTIQUES: Boutique[] = [
  {
    id: 1,
    nom: 'Boutique Choc Akwa',
    slug: 'boutique-choc-akwa',
    numero_telephone: '+237 233 44 55 66',
    adresse: 'Rue Joffre, Akwa, en face de Mtn',
    site_web: 'https://www.boutiquechoc.cm',
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&auto=format&fit=crop&q=80',
    date_ajout: new Date().toISOString(),
    date_modification: new Date().toISOString(),
    status: 'ouvert',
    horaires_semaine: '08h30 - 19h00',
    horaires_weekend: '09h00 - 16h00',
    horaires_feries: 'Fermé',
    description: 'Une boutique de distribution généraliste de choix à Douala Akwa.',
    ville_id: 1,
    quartier_id: 1,
    proprietaire_id: 10,
    rating: 4.5,
    reviews_count: 28,
    services: 'Livraison, Conseil Beauté, Paiement Mobile',
    is_featured: true,
    items_count: 4,
    latitude: 4.0485,
    longitude: 9.7015
  },
  {
    id: 2,
    nom: 'Amina Beauté Bastos',
    slug: 'amina-beaute-bastos',
    numero_telephone: '+237 222 15 16 17',
    adresse: 'Avenue Bastos, Yaoundé',
    site_web: null,
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&auto=format&fit=crop&q=80',
    date_ajout: new Date().toISOString(),
    date_modification: new Date().toISOString(),
    status: 'ouvert',
    horaires_semaine: '09h00 - 20h00',
    horaires_weekend: '10h00 - 18h00',
    horaires_feries: '10h00 - 14h00',
    description: 'Salon et boutique de produits cosmétiques haut de gamme à Bastos.',
    ville_id: 2,
    quartier_id: 3,
    proprietaire_id: 11,
    rating: 4.8,
    reviews_count: 14,
    services: 'Soins du visage, Conseils, Testeurs',
    is_featured: false,
    items_count: 3,
    latitude: 3.8833,
    longitude: 11.5167
  }
];

const INITIAL_ARTICLES: Article[] = [
  // Produits de Bamboutos Cosmetics (Marque vérifiée officielle)
  {
    id: 1,
    nom: 'Sérum Éclat Karité Infusé',
    slug: 'serum-eclat-karite-infuse',
    boutique_id: 1,
    prix: 14500,
    description: 'Sérum hydratant ultra-concentré en karité purifié et huiles essentielles de lavande sauvage. Nourrit intensément les peaux sèches et illumine le teint.',
    date_ajout: new Date().toISOString(),
    stock: 45,
    image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400&auto=format&fit=crop&q=80',
    est_actif: true,
    quantite: 1,
    is_featured: true,
    rating: 4.9,
    reviews_count: 57,
    category: 'Sérum Visage',
    marque: 'Bamboutos Cosmetics' // Fait la correspondance avec la Marque par nom
  },
  {
    id: 2,
    nom: 'Baume Divin Réparateur Corporel',
    slug: 'baume-divin-reparateur-corporel',
    boutique_id: 1,
    prix: 9000,
    description: 'Un baume fondant multi-usage à base de karité des Bamboutos pour restructurer les peaux abîmées. Parfum naturel de cacao sauvage.',
    date_ajout: new Date().toISOString(),
    stock: 60,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&auto=format&fit=crop&q=80',
    est_actif: true,
    quantite: 1,
    is_featured: false,
    rating: 4.6,
    reviews_count: 22,
    category: 'Crème Corps',
    marque: 'Bamboutos Cosmetics'
  },
  {
    id: 3,
    nom: "Huile d'Avocat Pure Pressée à Froid",
    slug: "huile-d-avocat-pure-pressee-a-froid",
    boutique_id: 2,
    prix: 6000,
    description: "Huile de soin capillaire et cutané 100% biologique extraite mécaniquement dans nos terroirs. Redonne éclat aux cheveux secs.",
    date_ajout: new Date().toISOString(),
    stock: 12, // Stock faible pour générer des alertes !
    image: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=400&auto=format&fit=crop&q=80',
    est_actif: true,
    quantite: 1,
    is_featured: true,
    rating: 4.7,
    reviews_count: 19,
    category: 'Huiles de Soin',
    marque: 'Bamboutos Cosmetics'
  },

  // Produits de Kente Prestige (Marque enregistrée mais non vérifiée)
  {
    id: 4,
    nom: 'Écharpe Impériale Reine Mère',
    slug: 'echarpe-imperiale-reine-mere',
    boutique_id: 1,
    prix: 32000,
    description: 'Une écharpe d’apparat magistrale tissée de fils d’or et de coton fin dans nos ateliers. Motif traditionnel symbolisant la sagesse et le pouvoir féminin.',
    date_ajout: new Date().toISOString(),
    stock: 15,
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&auto=format&fit=crop&q=80',
    est_actif: true,
    quantite: 1,
    is_featured: true,
    rating: 4.5,
    reviews_count: 8,
    category: 'Accessoires de Mode',
    marque: 'Kente Prestige'
  },
  {
    id: 5,
    nom: 'Robe de Bal Sakina en Pagne Kente',
    slug: 'robe-de-bal-sakina-en-pagne-kente',
    boutique_id: 1,
    prix: 120000,
    description: 'Magnifique création sur-mesure combinant de la mousseline de soie noire avec de véritables pans de Kente royal. Idéal pour de grandes occasions.',
    date_ajout: new Date().toISOString(),
    stock: 3,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&auto=format&fit=crop&q=80',
    est_actif: true,
    quantite: 1,
    is_featured: false,
    rating: 5.0,
    reviews_count: 4,
    category: 'Vêtements',
    marque: 'Kente Prestige'
  },

  // Produits de AfriqFood (Marque vérifiée officielle)
  {
    id: 6,
    nom: 'Piment du Pays au Gingembre Confit',
    slug: 'piment-du-pays-au-gingembre-confit',
    boutique_id: 1,
    prix: 2500,
    description: 'Purée artisanale de piment oiseau relevée délicatement de zestes de gingembre frais confit. Sans conservateurs artificiels.',
    date_ajout: new Date().toISOString(),
    stock: 80,
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&auto=format&fit=crop&q=80',
    est_actif: true,
    quantite: 1,
    is_featured: false,
    rating: 4.8,
    reviews_count: 36,
    category: 'Condiments',
    marque: 'AfriqFood'
  },

  // Produit Contrefait / suspect d'origine pour les tests
  {
    id: 7,
    nom: 'Sérum Éclat Karité de Contrebande (Copie)',
    slug: 'serum-eclat-karite-le-faux',
    boutique_id: 1,
    prix: 4500, // Moitié prix
    description: 'Produit sans marque certifiée acheté de façon informelle au marché central.',
    date_ajout: new Date().toISOString(),
    stock: 100,
    image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400&auto=format&fit=crop&q=80',
    est_actif: true,
    quantite: 1,
    is_featured: false,
    rating: 1.5,
    reviews_count: 3,
    category: 'Sérum Visage',
    marque: 'Abibia Cosmetics Ltd' // Marque non enregistrée du tout !
  }
];

const INITIAL_STOCKS_BOUTIQUE: StockBoutique[] = [
  { id: 1, article_id: 1, boutique_id: 1, quantite: 35, seuil_alerte: 10, date_mise_a_jour: new Date().toISOString() },
  { id: 2, article_id: 1, boutique_id: 2, quantite: 10, seuil_alerte: 5, date_mise_a_jour: new Date().toISOString() },
  { id: 3, article_id: 2, boutique_id: 1, quantite: 60, seuil_alerte: 8, date_mise_a_jour: new Date().toISOString() },
  { id: 4, article_id: 3, boutique_id: 2, quantite: 12, seuil_alerte: 15, date_mise_a_jour: new Date().toISOString() }, // Stock insuffisant/faible !
  { id: 5, article_id: 4, boutique_id: 1, quantite: 15, seuil_alerte: 5, date_mise_a_jour: new Date().toISOString() },
  { id: 6, article_id: 5, boutique_id: 1, quantite: 3, seuil_alerte: 4, date_mise_a_jour: new Date().toISOString() },
  { id: 7, article_id: 6, boutique_id: 1, quantite: 80, seuil_alerte: 20, date_mise_a_jour: new Date().toISOString() },
];

const INITIAL_CODES_BARRES: CodeBarre[] = [
  // Codes-barres émis d'origine par Bamboutos Cosmetics (is_marque = true, d'un article Bamboutos Cosmetics)
  { id: 1, code: '615110190012', article_id: 1, date_ajout: new Date().toISOString(), createur_id: 1 },
  { id: 2, code: '615110190029', article_id: 2, date_ajout: new Date().toISOString(), createur_id: 1 },
  { id: 3, code: '615110190036', article_id: 3, date_ajout: new Date().toISOString(), createur_id: 1 },
  
  // Code-barre émis par Kente Prestige (Marque non vérifiée)
  { id: 4, code: '4006381333931', article_id: 4, date_ajout: new Date().toISOString(), createur_id: 2 },
  { id: 5, code: '4006381333948', article_id: 5, date_ajout: new Date().toISOString(), createur_id: 2 },

  // Code-barre émis par AfriqFood
  { id: 6, code: '615220011559', article_id: 6, date_ajout: new Date().toISOString(), createur_id: 3 },

  // Le faux sérum (id:7) n'a volontairement AUCUN code-barre certifié authentique.
];

const INITIAL_SCAN_LOGS: ScanLog[] = [
  { id: 1, code: '615110190012', date: new Date(Date.now() - 3600000 * 4).toISOString(), success: true, marque_nom: 'Bamboutos Cosmetics', article_nom: 'Sérum Éclat Karité Infusé', boutique_nom: 'Boutique Choc Akwa', details: 'Scan réussi - Produit authentique' },
  { id: 2, code: '615110190012', date: new Date(Date.now() - 3600000 * 24).toISOString(), success: true, marque_nom: 'Bamboutos Cosmetics', article_nom: 'Sérum Éclat Karité Infusé', boutique_nom: 'Amina Beauté Bastos', details: 'Scan réussi - Produit authentique' },
  { id: 3, code: '000000000000', date: new Date(Date.now() - 3600000 * 48).toISOString(), success: false, marque_nom: 'Inconnue', details: 'Code inconnu dans le système Pelou' },
];

export class Database {
  private static get<T>(key: string, initial: T): T {
    try {
      const data = localStorage.getItem(`pelou_${key}`);
      return data ? JSON.parse(data) : initial;
    } catch (e) {
      console.error(e);
      return initial;
    }
  }

  public static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`pelou_${key}`, JSON.stringify(value));
    } catch (e) {
      console.error(e);
    }
  }

  // Villes
  public static getVilles(): Ville[] {
    return this.get('villes', INITIAL_VILLES);
  }

  // Quartiers
  public static getQuartiers(villeId?: number): Quartier[] {
    const list = this.get('quartiers', INITIAL_QUARTIERS);
    return villeId ? list.filter(q => q.ville_id === villeId) : list;
  }

  // Domaines
  public static getDomaines(): Domaine[] {
    return this.get('domaines', INITIAL_DOMAINES);
  }

  // Utilisateurs
  public static getUsers(): User[] {
    return this.get('users', INITIAL_USERS);
  }

  // Marques
  public static getMarques(): Marque[] {
    return this.get('marques', INITIAL_MARQUES);
  }

  public static getMarqueByNom(nom: string): Marque | null {
    const marques = this.getMarques();
    const cleanNom = nom.trim().toLowerCase();
    return marques.find(m => m.nom_organisation.toLowerCase() === cleanNom) || null;
  }

  // Boutiques
  public static getBoutiques(): Boutique[] {
    return this.get('boutiques', INITIAL_BOUTIQUES);
  }

  // Articles
  public static getArticles(): Article[] {
    return this.get('articles', INITIAL_ARTICLES);
  }

  // Filtre les articles de la marque (comparaison insensible à la casse sur nom de marque)
  public static getArticlesByMarque(nomMarque: string): Article[] {
    const articles = this.getArticles();
    const cleanNom = nomMarque.trim().toLowerCase();
    return articles.filter(a => a.marque.toLowerCase() === cleanNom);
  }

  public static addArticle(article: Omit<Article, 'id' | 'slug' | 'date_ajout' | 'rating' | 'reviews_count'>): Article {
    const articles = this.getArticles();
    const slug = article.nom.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 10000);
    const newArticle: Article = {
      ...article,
      id: articles.length > 0 ? Math.max(...articles.map(a => a.id)) + 1 : 1,
      slug,
      date_ajout: new Date().toISOString(),
      rating: 0,
      reviews_count: 0
    };
    articles.push(newArticle);
    this.set('articles', articles);

    // Mettre à jour le compteur d'articles de la boutique
    const boutiques = this.getBoutiques();
    const boutiqueIdx = boutiques.findIndex(b => b.id === article.boutique_id);
    if (boutiqueIdx !== -1) {
      boutiques[boutiqueIdx].items_count = articles.filter(a => a.boutique_id === article.boutique_id).length;
      this.set('boutiques', boutiques);
    }

    // Mettre à jour les compteurs des utilisateurs
    const users = this.getUsers();
    const owner = boutiques.find(b => b.id === article.boutique_id)?.proprietaire_id;
    if (owner) {
      const userIdx = users.findIndex(u => u.id === owner);
      if (userIdx !== -1) {
        users[userIdx].items_count = articles.filter(a => {
          const btq = boutiques.find(b => b.id === a.boutique_id);
          return btq?.proprietaire_id === owner;
        }).length;
        this.set('users', users);
      }
    }

    // Ajouter l'association de stock par défaut
    const stocks = this.getStocksBoutique();
    const newStock: StockBoutique = {
      id: stocks.length > 0 ? Math.max(...stocks.map(s => s.id)) + 1 : 1,
      article_id: newArticle.id,
      boutique_id: newArticle.boutique_id,
      quantite: newArticle.stock,
      seuil_alerte: 5,
      date_mise_a_jour: new Date().toISOString()
    };
    stocks.push(newStock);
    this.set('stocks_boutique', stocks);

    // Mettre à jour le compteur sur la table Marque
    const marques = this.getMarques();
    const marqueIdx = marques.findIndex(m => m.nom_organisation.toLowerCase() === article.marque.toLowerCase());
    if (marqueIdx !== -1) {
      marques[marqueIdx].articles_count += 1;
      this.set('marques', marques);
    }

    return newArticle;
  }

  public static updateArticle(articleId: number, update: Partial<Article>): Article | null {
    const articles = this.getArticles();
    const idx = articles.findIndex(a => a.id === articleId);
    if (idx === -1) return null;

    articles[idx] = { ...articles[idx], ...update };
    this.set('articles', articles);
    return articles[idx];
  }

  public static deleteArticle(articleId: number): boolean {
    const articles = this.getArticles();
    const article = articles.find(a => a.id === articleId);
    if (!article) return false;

    const remaining = articles.filter(a => a.id !== articleId);
    this.set('articles', remaining);

    // Ajuster le stock boutique lié
    const stocks = this.getStocksBoutique();
    this.set('stocks_boutique', stocks.filter(s => s.article_id !== articleId));

    // Décrémenter le compteur de la marque
    const marques = this.getMarques();
    const marqueIdx = marques.findIndex(m => m.nom_organisation.toLowerCase() === article.marque.toLowerCase());
    if (marqueIdx !== -1 && marques[marqueIdx].articles_count > 0) {
      marques[marqueIdx].articles_count -= 1;
      this.set('marques', marques);
    }

    return true;
  }

  // Stocks boutique
  public static getStocksBoutique(): StockBoutique[] {
    return this.get('stocks_boutique', INITIAL_STOCKS_BOUTIQUE);
  }

  public static updateStock(stockId: number, quantite: number): boolean {
    const stocks = this.getStocksBoutique();
    const idx = stocks.findIndex(s => s.id === stockId);
    if (idx === -1) return false;

    stocks[idx].quantite = quantite;
    stocks[idx].date_mise_a_jour = new Date().toISOString();
    this.set('stocks_boutique', stocks);

    // Synchroniser avec l'article s'il s'agit de sa boutique principale
    const articles = this.getArticles();
    const artIdx = articles.findIndex(a => a.id === stocks[idx].article_id && a.boutique_id === stocks[idx].boutique_id);
    if (artIdx !== -1) {
      articles[artIdx].stock = quantite;
      this.set('articles', articles);
    }
    return true;
  }

  // Codes barres
  public static getCodesBarres(): CodeBarre[] {
    return this.get('codes_barres', INITIAL_CODES_BARRES);
  }

  public static addCodesBarresBulk(articleId: number, codes: string[], createurId: number): number {
    const existing = this.getCodesBarres();
    const newCodes: CodeBarre[] = [];
    let addedCount = 0;

    let nextId = existing.length > 0 ? Math.max(...existing.map(c => c.id)) + 1 : 1;

    for (const codeStr of codes) {
      const trimmed = codeStr.trim();
      if (!trimmed) continue;

      // Vérifier l'unicité
      const duplicate = existing.some(e => e.code === trimmed) || newCodes.some(n => n.code === trimmed);
      if (duplicate) continue;

      newCodes.push({
        id: nextId++,
        code: trimmed,
        article_id: articleId,
        date_ajout: new Date().toISOString(),
        createur_id: createurId
      });
      addedCount++;
    }

    if (newCodes.length > 0) {
      this.set('codes_barres', [...existing, ...newCodes]);
    }

    return addedCount;
  }

  public static getCodesForArticle(articleId: number): CodeBarre[] {
    return this.getCodesBarres().filter(c => c.article_id === articleId);
  }

  // Logs des scans de démonstration
  public static getScanLogs(): ScanLog[] {
    return this.get('scan_logs', INITIAL_SCAN_LOGS);
  }

  public static addScanLog(log: Omit<ScanLog, 'id' | 'date'>): ScanLog {
    const logs = this.getScanLogs();
    const newLog: ScanLog = {
      ...log,
      id: logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1,
      date: new Date().toISOString()
    };
    logs.push(newLog);
    this.set('scan_logs', logs);
    return newLog;
  }

  // --- LOGIQUE MÉTIER DE CERTIFICATION ANTI-CONTREFAÇON ---
  public static verifyProduct(code: string): { 
    success: boolean; 
    status: 'AUTHENTIQUE' | 'NON_VERIFIE' | 'CONTREFAÇON_SUSPECTE' | 'INCONNU';
    article?: Article | null;
    marque?: Marque | null;
    boutique?: Boutique | null;
    message: string;
  } {
    const cleanCode = code.trim();
    if (!cleanCode) {
      return { success: false, status: 'INCONNU', message: 'Veuillez renseigner un code-barres.' };
    }

    // 1. Chercher le CodeBarre correspondant
    const codeBarre = this.getCodesBarres().find(cb => cb.code === cleanCode);
    if (!codeBarre) {
      // Pas de code-barre certifié dans Pelou
      // Est-ce qu'on a quand même un article avec ce nom de marque ?
      // On log le scan infructueux
      this.addScanLog({
        code: cleanCode,
        success: false,
        marque_nom: 'Inconnue ou Non Certifiée',
        details: 'Code-barres inconnu dans Pelou'
      });

      return {
        success: false,
        status: 'CONTREFAÇON_SUSPECTE',
        message: 'Alerte contrefaçon ! Ce code-barres n\'est pas référencé par Pelou ni associé à un fabricant pour cette référence. Le produit présente un fort risque d\'être une contrefaçon.'
      };
    }

    // 2. Récupérer l'article associé
    const article = this.getArticles().find(a => a.id === codeBarre.article_id);
    if (!article) {
      return {
        success: false,
        status: 'INCONNU',
        message: 'Le code-barres existe mais l\'article associé n\'est plus disponible dans le système.'
      };
    }

    // 3. Récupérer l'info marque de l'article (c'est un champ texte libre dans Article.marque)
    const marqueNomText = article.marque;

    // 4. Rechercher dans la table Marque une entrée correspondant au nom d'organisation (insensible à la casse)
    const marqueOfficielle = this.getMarqueByNom(marqueNomText);
    const boutique = this.getBoutiques().find(b => b.id === article.boutique_id) || null;

    if (!marqueOfficielle) {
      // L'article fait référence à un nom de marque mais celle-ci n'est pas configurée ou enregistrée comme fabricant officiel
      this.addScanLog({
        code: cleanCode,
        success: false,
        marque_nom: marqueNomText,
        article_nom: article.nom,
        boutique_nom: boutique?.nom || undefined,
        details: `Marque "${marqueNomText}" introuvable dans la table des fabricants certifiés`
      });

      return {
        success: false,
        status: 'NON_VERIFIE',
        article,
        boutique,
        message: `Ce produit appartient à l'enseigne "${marqueNomText}" mais cette marque n'est pas enregistrée en tant que fabricant officiel sur Pelou. L'authenticité physique ne peut être garantie.`
      };
    }

    // 5. Vérifier s'il est is_verified = True
    if (marqueOfficielle.is_verified) {
      // Succès absolu - Produit authentique issu d'une marque vérifiée !
      this.addScanLog({
        code: cleanCode,
        success: true,
        marque_nom: marqueOfficielle.nom_organisation,
        article_nom: article.nom,
        boutique_nom: boutique?.nom || undefined,
        details: `Authentification réussie - Fabricant certifié: ${marqueOfficielle.nom_organisation}`
      });

      return {
        success: true,
        status: 'AUTHENTIQUE',
        article,
        marque: marqueOfficielle,
        boutique,
        message: `Produit 100% Authentique ! Ce code unique est certifié d'origine par le fabricant "${marqueOfficielle.nom_organisation}" avec l'agrément anti-contrefaçon Pelou.`
      };
    } else {
      // La marque est enregistrée mais son statut verified est faux
      this.addScanLog({
        code: cleanCode,
        success: false,
        marque_nom: marqueOfficielle.nom_organisation,
        article_nom: article.nom,
        boutique_nom: boutique?.nom || undefined,
        details: `Fabricant trouvé mais compte non vérifié/validé par l'administration`
      });

      return {
        success: false,
        status: 'NON_VERIFIE',
        article,
        marque: marqueOfficielle,
        boutique,
        message: `Le fabricant "${marqueOfficielle.nom_organisation}" est enregistré sur Pelou mais son compte n'a pas encore été validé ni certifié par notre administration administrative. Statut en attente.`
      };
    }
  }

  // Sauvegarder un profil de marque mis à jour
  public static saveMarqueProfile(marqueId: number, profileData: Partial<Marque>): Marque | null {
    const marques = this.getMarques();
    const idx = marques.findIndex(m => m.id === marqueId);
    if (idx === -1) return null;

    marques[idx] = { 
      ...marques[idx], 
      ...profileData, 
      date_modification: new Date().toISOString() 
    };
    this.set('marques', marques);

    // Mettre à jour aussi l'organisation de l'utilisateur relié
    const userId = marques[idx].user_id;
    if (userId) {
      const users = this.getUsers();
      const uIdx = users.findIndex(u => u.id === userId);
      if (uIdx !== -1) {
        users[uIdx].nom_organisation = marques[idx].nom_organisation;
        users[uIdx].bio = marques[idx].bio;
        users[uIdx].description_entreprise = marques[idx].description;
        this.set('users', users);
      }
    }

    return marques[idx];
  }
}
