# django_templates/seed_test_data.py
# -*- coding: utf-8 -*-

"""
PELOU - SCRIPT DE SÉDATION DE DONNÉES EN LOCAL (Django)
-----------------------------------------------------------------------------
Ce script permet d'importer automatiquement toutes les données de test (comptes tests)
dans votre base de données Django en local. Ainsi, le frontend Pelou en local (avec ses codes tests)
pourra se connecter directement et de manière cohérente à votre Django !

COMMENT L'UTILISER :
1. Copiez ce fichier dans votre projet Django (par exemple à la racine ou dans un dossier de scripts).
2. Lancez le shell de Django :
    python manage.py shell
3. Exécutez le script :
    exec(open('seed_test_data.py', encoding='utf-8').read())
-----------------------------------------------------------------------------
"""

import sys
import os
import platform

# 1. INITIALISATION DE DJANGO SI LANCÉ COMME SCRIPT INDÉPENDANT (HORS DE MANAGE.PY SHELL)
if __name__ == "__main__" or "django" not in sys.modules:
    # Configurer le module settings par défaut
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "pelou.settings")
    
    # Résoudre les chemins GDAL sur Windows avant l'import des modules GIS de Django
    if platform.system() == "Windows":
        gdal_path = r"C:\mes-apps-django\venv\Lib\site-packages\osgeo\gdal304.dll"
        geos_path = r"C:\mes-apps-django\venv\Lib\site-packages\osgeo\geos_c.dll"
        if os.path.exists(gdal_path):
            os.environ["GDAL_LIBRARY_PATH"] = gdal_path
        if os.path.exists(geos_path):
            os.environ["GEOS_LIBRARY_PATH"] = geos_path
            
        proj_path = r"C:\mes-apps-django\venv\Lib\site-packages\osgeo\data\proj"
        if os.path.exists(proj_path) and "PROJ_LIB" not in os.environ:
            os.environ["PROJ_LIB"] = proj_path

    try:
        import django
        django.setup()
    except Exception as e:
        # Django est déjà configuré (ex: si lancé à l'intérieur de 'python manage.py shell')
        pass

# Importations sécurisées de Django et des types géographiques
from django.utils import timezone
from django.db import transaction
from django.contrib.gis.geos import Point, Polygon

# Remplacez "la_vraie_app_django" par le nom de votre application parente Django
try:
    from api.models import User, Ville, Quartier, Domaine, Boutique, Marque, Article, StockBoutique, CodeBarre
except ImportError:
    print("\n[ERREUR] Impossible de charger les modèles. Veuillez ajuster les imports au début de ce script pour cibler votre application Django.\n")
    sys.exit(1)

def run():
    print("--- DÉBUT DE LA CRÉATION DES COMPTES TESTS EN LOCAL ---")
    
    with transaction.atomic():
        # 1. CRÉATION DES VILLES (Avec polygones géographiques simplifiés pour PostGIS)
        print("Création des villes de test...")
        douala, _ = Ville.objects.get_or_create(
            nom="Douala",
            defaults={"geom": Polygon(((9.6, 4.0), (9.8, 4.0), (9.8, 4.1), (9.6, 4.1), (9.6, 4.0)))}
        )
        yaounde, _ = Ville.objects.get_or_create(
            nom="Yaoundé",
            defaults={"geom": Polygon(((11.4, 3.8), (11.6, 3.8), (11.6, 3.9), (11.4, 3.9), (11.4, 3.8)))}
        )

        # 2. CRÉATION DES QUARTIERS
        print("Création des quartiers...")
        akwa, _ = Quartier.objects.get_or_create(
            nom="Akwa",
            ville=douala,
            defaults={"geom": Polygon(((9.68, 4.04), (9.70, 4.04), (9.70, 4.06), (9.68, 4.06), (9.68, 4.04)))}
        )
        bonapriso, _ = Quartier.objects.get_or_create(
            nom="Bonapriso",
            ville=douala,
            defaults={"geom": Polygon(((9.67, 4.01), (9.69, 4.01), (9.69, 4.03), (9.67, 4.03), (9.67, 4.01)))}
        )
        bastos, _ = Quartier.objects.get_or_create(
            nom="Bastos",
            ville=yaounde,
            defaults={"geom": Polygon(((11.51, 3.89), (11.53, 3.89), (11.53, 3.91), (11.51, 3.91), (11.51, 3.89)))}
        )

        # 3. CRÉATION DES DOMAINES D'ACTIVITÉ
        print("Création des domaines d'activité...")
        cosmetiques, _ = Domaine.objects.get_or_create(
            nom="Cosmétiques & Beauté",
            defaults={"slug": "cosmetiques", "icon": "Sparkles", "is_predefined": True}
        )
        mode, _ = Domaine.objects.get_or_create(
            nom="Prêt-à-Porter & Mode",
            defaults={"slug": "mode", "icon": "Shirt", "is_predefined": True}
        )
        alimentation, _ = Domaine.objects.get_or_create(
            nom="Alimentation & Produits Locaux",
            defaults={"slug": "alimentation", "icon": "Apple", "is_predefined": True}
        )

        # 4. CRÉATION DES COMPTES UTILISATEURS MARQUES & PARTENAIRES (Mots de passe hachés sécurisés)
        print("Création ou mise à jour des utilisateurs...")

        def configure_test_user_code(user, ville_val, quartiers_val):
            # Assigner la localisation
            user.ville = ville_val
            user.quartiers = quartiers_val
            user.is_partner = True  # Tous ont besoin d'un code selon les consignes, is_partner=True car requis pour la génération
            
            # Génération conforme à Django Admin : {ville_code}{quartiers_code}{partner_count:04d}
            if not user.code_connexion or len(user.code_connexion) < 8 or user.code_connexion in ["bamboutos123", "kente456", "food789", "simo123", "amina123"]:
                v_code = user.ville[:2].upper() if user.ville else 'XX'
                q_code = user.quartiers[:2].upper() if user.quartiers else 'XX'
                partner_count = User.objects.filter(is_partner=True).count() + 1
                user.code_connexion = f"{v_code}{q_code}{partner_count:04d}"
            
            user.set_password("pelouteam2026")
            user.save()

        # Utilisateur 1: Bamboutos Cosmetics
        u1, created_1 = User.objects.get_or_create(
            username="bamboutos_cosmetics",
            defaults={
                "first_name": "Alain",
                "last_name": "Fokou",
                "email": "contact@bamboutos.cm",
                "numero_telephone": "+237 677 12 34 56",
                "is_partner": True,
                "is_marque": True,
                "nom_organisation": "Bamboutos Cosmetics",
                "description_entreprise": "Spécialiste de la cosmétique naturelle à base de beurre de karité.",
                "bio": "Marier science moderne et secrets ancestraux africains pour la beauté de votre peau.",
                "verified": True,
            }
        )
        configure_test_user_code(u1, "Douala", "Akwa")
        u1.domaines.add(cosmetiques)
 
        # Utilisateur 2: Kente Prestige
        u2, created_2 = User.objects.get_or_create(
            username="kente_prestige",
            defaults={
                "first_name": "Awa",
                "last_name": "Ndiaye",
                "email": "contact@kenteprestige.com",
                "numero_telephone": "+237 699 98 76 54",
                "is_partner": True,
                "is_marque": True,
                "nom_organisation": "Kente Prestige",
                "description_entreprise": "Créations de haute couture en pagne tissé Kente traditionnel.",
                "bio": "La noblesse du textile africain revisitée pour le monde moderne.",
                "verified": False,
            }
        )
        configure_test_user_code(u2, "Yaoundé", "Bastos")
        u2.domaines.add(mode)
 
        # Utilisateur 3: AfriqFood
        u3, created_3 = User.objects.get_or_create(
            username="afriq_food",
            defaults={
                "first_name": "Ngo",
                "last_name": "Bilik",
                "email": "contact@afriqfood.cm",
                "numero_telephone": "+237 655 45 67 89",
                "is_partner": True,
                "is_marque": True,
                "nom_organisation": "AfriqFood",
                "description_entreprise": "Producteur agroalimentaire de sauces de pays.",
                "bio": "Le meilleur des terroirs camerounais dans votre assiette.",
                "verified": True,
            }
        )
        configure_test_user_code(u3, "Douala", "Akwa")
        u3.domaines.add(alimentation)
 
        # Partenaire 1 (Jean Simo distributeur)
        up1, created_p1 = User.objects.get_or_create(
            username="jean_commercant",
            defaults={
                "first_name": "Jean",
                "last_name": "Simo",
                "email": "jean.simo@gmail.com",
                "numero_telephone": "+237 680 11 22 33",
                "is_partner": True,
                "is_marque": False,
                "nom_organisation": "Simo Distribution",
                "verified": True,
            }
        )
        configure_test_user_code(up1, "Douala", "Akwa")
 
        # Partenaire 2 (Amina Bello distributrice)
        up2, created_p2 = User.objects.get_or_create(
            username="amina_shop",
            defaults={
                "first_name": "Amina",
                "last_name": "Bello",
                "email": "amina.bello@yahoo.fr",
                "numero_telephone": "+237 671 44 55 66",
                "is_partner": True,
                "is_marque": False,
                "nom_organisation": "Amina Cosmétiques",
                "verified": True,
            }
        )
        configure_test_user_code(up2, "Yaoundé", "Bastos")


        # 5. ASSOCIER LES PROFILS DE MARQUES ASSOCIÉS
        print("Création des profils de marques...")
        
        m1, _ = Marque.objects.get_or_create(
            user=u1,
            defaults={
                "nom_organisation": u1.nom_organisation,
                "email": u1.email,
                "numero_telephone": u1.numero_telephone,
                "description": u1.description_entreprise,
                "bio": u1.bio,
                "site_web": "https://www.bamboutos-cosmetics.cm",
                "is_verified": True,
                "followers_count": 1420
            }
        )
        m1.domaines.add(cosmetiques)

        m2, _ = Marque.objects.get_or_create(
            user=u2,
            defaults={
                "nom_organisation": u2.nom_organisation,
                "email": u2.email,
                "numero_telephone": u2.numero_telephone,
                "description": u2.description_entreprise,
                "bio": u2.bio,
                "site_web": "https://www.kenteprestige.com",
                "is_verified": False,
                "followers_count": 312
            }
        )
        m2.domaines.add(mode)

        m3, _ = Marque.objects.get_or_create(
            user=u3,
            defaults={
                "nom_organisation": u3.nom_organisation,
                "email": u3.email,
                "numero_telephone": u3.numero_telephone,
                "description": u3.description_entreprise,
                "bio": u3.bio,
                "site_web": "https://www.afriqfood.cm",
                "is_verified": True,
                "followers_count": 554
            }
        )
        m3.domaines.add(alimentation)


        # 6. CRÉATION DES BOUTIQUES DISTRIBUTION PHYSIQUES
        print("Création de boutiques physiques...")
        
        b1, _ = Boutique.objects.get_or_create(
            nom="Sundance Shop Akwa",
            defaults={
                "numero_telephone": "+237 680 11 22 33",
                "adresse": "Boulevard de la Liberté, face Boulangerie Zépol",
                "description": "Boutique de cosmétiques premiums et d'articles authentiques africains.",
                "status": "ouvert",
                "horaires_semaine": "8h30 - 19h00",
                "ville": douala,
                "quartier": akwa,
                "type": Boutique.COSMETIQUES,
                "proprietaire": up1,
                "geom": Point(9.6914, 4.0482), # Point GPS réel à Douala !
                "rating": 4.5,
                "reviews_count": 24,
                "services": "Vente conseil, Retrait boutique, Testeurs disponibles, Authenticité vérifiée"
            }
        )

        b2, _ = Boutique.objects.get_or_create(
            nom="Galerie Sawa Bastos",
            defaults={
                "numero_telephone": "+237 671 44 55 66",
                "adresse": "Montée Bastos, au-dessus du supermarché Casino",
                "description": "Une sélection raffinée de pièces de prêt-à-porter, huiles artisanales et fins beurres.",
                "status": "ouvert",
                "horaires_semaine": "9h00 - 21h00",
                "ville": yaounde,
                "quartier": bastos,
                "type": Boutique.PRET_A_PORTER,
                "proprietaire": up2,
                "geom": Point(11.5185, 3.8962), # Point GPS réel à Yaoundé !
                "rating": 4.7,
                "reviews_count": 12,
                "services": "Retrait boutique, Essayages, Vente de gros"
            }
        )


        # 7. CRÉATION DES ARTICLES & STOCKS ASSOCIES
        print("Création d'articles tests...")
        
        # Article 1 (Marque: Bamboutos Cosmetics)
        art1, _ = Article.objects.get_or_create(
            slug="savon-karite-avocat",
            defaults={
                "nom": "Savon Thérapeutique Karité & Avocat",
                "boutique": b1, # Boutique de distribution d'origine
                "prix": 2500.00,
                "description": "Savon artisanal riche en vitamines A, D, E et F. Nourrit en profondeur et apaise les peaux sèches et atopiques carterisées par un climat tropical.",
                "stock": 120,
                "est_actif": True,
                "is_featured": True,
                "category": "Savons Bio",
                "marque": "Bamboutos Cosmetics"
            }
        )
        StockBoutique.objects.get_or_create(article=art1, boutique=b1, defaults={"quantite": 80})
        StockBoutique.objects.get_or_create(article=art1, boutique=b2, defaults={"quantite": 40})

        # Article 2 (Marque: Bamboutos Cosmetics)
        art2, _ = Article.objects.get_or_create(
            slug="huile-safou-eclat",
            defaults={
                "nom": "Sérum Anti-Âge Crème d'Huile de Safou",
                "boutique": b1,
                "prix": 8500.00,
                "description": "Idéal pour réveiller la peau terne. Extrait de Safou pur récolté dans la région des hauts plateaux de l'Ouest.",
                "stock": 45,
                "est_actif": True,
                "is_featured": True,
                "category": "Sérums",
                "marque": "Bamboutos Cosmetics"
            }
        )
        StockBoutique.objects.get_or_create(article=art2, boutique=b1, defaults={"quantite": 45})

        # Article 3 (Marque: Kente Prestige)
        art3, _ = Article.objects.get_or_create(
            slug="robe-asante-kente",
            defaults={
                "nom": "Robe de Gala Asante",
                "boutique": b2,
                "prix": 120000.00,
                "description": "Pièce unique confectionnée à la main à partir des fils authentiques de Kente royal.",
                "stock": 3,
                "est_actif": True,
                "is_featured": True,
                "category": "Robes de Gala",
                "marque": "Kente Prestige"
            }
        )
        StockBoutique.objects.get_or_create(article=art3, boutique=b2, defaults={"quantite": 3})


        # 8. ENREGISTREMENT DES CODES-BARRES TESTS UNIQUES POUR LE SCANNER D'AUTHENTICITÉ
        print("Création de codes-barres pour simulation d'authenticité...")
        
        # Associer des codes-barres faciles à taper au testeur de l'application React :
        # Code-barre vérifié et valide pour le savon Karité !
        CodeBarre.objects.get_or_create(
            code="PELOU-BAM-001",
            defaults={"article": art1, "createur": u1}
        )
        CodeBarre.objects.get_or_create(
            code="PELOU-BAM-002",
            defaults={"article": art2, "createur": u1}
        )
        
        # Code-barre pour la robe Kente Prestige (qui est une marque non-vérifiée)
        CodeBarre.objects.get_or_create(
            code="PELOU-KEN-777",
            defaults={"article": art3, "createur": u2}
        )

        # Mettre à jour les compteurs
        m1.articles_count = Article.objects.filter(marque__iexact=m1.nom_organisation).count()
        m1.save()
        m2.articles_count = Article.objects.filter(marque__iexact=m2.nom_organisation).count()
        m2.save()
        m3.articles_count = Article.objects.filter(marque__iexact=m3.nom_organisation).count()
        m3.save()

    print("\n--- COMPTES TESTS CRÉÉS AVEC SUCCÈS ! ---")
    print("Identifiants de test configurés localement (utilisateurs / partenaires / marques) :")
    for u in [u1, u2, u3, up1, up2]:
        print(f"- {u.nom_organisation or u.username} ({u.username}) -> Code de connexion Sécurisé: '{u.code_connexion}'")
    print("--------------------------------------------------------------------------------")

# Lancement automatique de la fonction run() quel que soit le mode d'exécution (shell Django exec ou python direct)
# Cela évite d'exiger de l'utilisateur qu'il tape run() après avoir importé/exécuté le script.
if __name__ == "__main__" or __name__ == "django.core.management.commands.shell" or "api" in sys.modules:
    try:
        run()
    except Exception as e:
        print(f"\n[INFO] Exécution automatique ignorée ou échouée: {e}\n")
