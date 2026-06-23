# django_templates/brands_views.py
# -*- coding: utf-8 -*-

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from django.utils.text import slugify
from django.utils.timezone import now
from django.db import transaction

# Importation de vos modèles Django
# Remplacez "la_vraie_app_django" par le nom de votre application Django parente
from la_vraie_app_django.models import User, Marque, Article, Boutique, StockBoutique, CodeBarre

def check_auth(request):
    """
    Simulate or handle bearer/token or session auth for developers.
    In production, you should use standard session or JWT auth (like djangorestframework-simplejwt).
    """
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        # Dans ce code exemple, nous gérons un token temporaire qui correspond au code_connexion.
        user = User.objects.filter(code_connexion=token).first()
        return user
    return None


@csrf_exempt
def brand_login_api(request):
    """
    POST /api/brands/login/
    Permet à une marque de se connecter avec son identifiant/email, son mot de passe classique 
    ET son code sécurisé de connexion (ex: 'bamboutos123').
    Retourne les informations de l'utilisateur et le profil complet de sa marque.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Méthode non autorisée. Utilisez POST.'}, status=405)

    try:
        data = json.loads(request.body)
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        code_connexion = data.get('code_connexion', '').strip()
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON invalide.'}, status=400)

    if not username or not password or not code_connexion:
        return JsonResponse({'error': 'Tous les champs sont obligatoires (Identifiant/Email, Mot de Passe ET Code de Connexion).'}, status=400)

    # 1. Recherche par username ou email
    user = User.objects.filter(username=username).first() or User.objects.filter(email=username).first()
    if not user:
        return JsonResponse({'error': 'Identifiant ou email introuvable.'}, status=401)

    # 2. Vérification du mot de passe Django
    if not user.check_password(password):
        return JsonResponse({'error': 'Mot de passe classique incorrect.'}, status=401)

    # 3. Vérification du code de connexion (code partenaire / API)
    if user.code_connexion != code_connexion:
        return JsonResponse({'error': 'Code sécurisé de connexion invalide pour cet utilisateur.'}, status=401)

    # Récupérer le profil de marque associé
    marque = getattr(user, 'marque_profile', None)
    if not marque and user.is_marque:
        # Création automatique de secours si l'utilisateur est marque mais n'a pas encore de profil associé.
        marque, _ = Marque.objects.get_or_create(
            user=user,
            defaults={
                'nom_organisation': user.nom_organisation or f"Marque {user.username}",
                'email': user.email,
                'numero_telephone': user.numero_telephone,
                'is_verified': user.verified,
                'is_active': True
            }
        )

    response_data = {
        'message': 'Connexion réussie',
        'token': user.code_connexion,  # Nous simulons un token avec le code d'accès
        'user': {
            'id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'numero_telephone': user.numero_telephone,
            'is_marque': user.is_marque,
            'nom_organisation': user.nom_organisation,
            'bio': user.bio,
            'image_profil': user.image_profil.url if user.image_profil else None,
            'image_couverture': user.image_couverture.url if user.image_couverture else None,
            'verified': user.verified,
        }
    }

    if marque:
        response_data['marque'] = {
            'id': marque.id,
            'nom_organisation': marque.nom_organisation,
            'email': marque.email,
            'numero_telephone': marque.numero_telephone,
            'description': marque.description,
            'bio': marque.bio,
            'logo': marque.logo.url if marque.logo else response_data['user']['image_profil'],
            'image_couverture': marque.image_couverture.url if marque.image_couverture else response_data['user']['image_couverture'],
            'site_web': marque.site_web,
            'is_verified': marque.is_verified,
            'articles_count': marque.articles_count,
            'followers_count': marque.followers_count,
        }

    return JsonResponse(response_data)


@csrf_exempt
def brand_profile_api(request, username):
    """
    GET /api/brands/<username>/
    Récupère le profil public d'une marque par son username et ses articles associés.
    """
    user = get_object_or_404(User, username=username)
    marque = getattr(user, 'marque_profile', None)

    if not marque:
        return JsonResponse({'error': 'Ce compte utilisateur n’est pas configuré comme une marque.'}, status=404)

    # Récupérer tous les articles de cette marque
    articles = Article.objects.filter(marque__iexact=marque.nom_organisation)
    articles_data = []
    for art in articles:
        articles_data.append({
            'id': art.id,
            'nom': art.nom,
            'slug': art.slug,
            'prix': float(art.prix),
            'description': art.description,
            'stock': art.stock,
            'date_ajout': art.date_ajout.isoformat(),
            'image': art.image.url if art.image else None,
            'image_2': art.image_2.url if art.image_2 else None,
            'est_actif': art.est_actif,
            'category': art.category,
            'rating': art.rating,
            'reviews_count': art.reviews_count,
            'marque': art.marque,
            'boutique_principale': {
                'id': art.boutique.id,
                'nom': art.boutique.nom,
                'adresse': art.boutique.adresse,
            }
        })

    # Construire la réponse
    data = {
        'id': marque.id,
        'username': user.username,
        'nom_organisation': marque.nom_organisation,
        'email': marque.email,
        'numero_telephone': marque.numero_telephone,
        'description': marque.description,
        'bio': marque.bio,
        'logo': marque.logo.url if marque.logo else (user.image_profil.url if user.image_profil else None),
        'image_couverture': marque.image_couverture.url if marque.image_couverture else (user.image_couverture.url if user.image_couverture else None),
        'site_web': marque.site_web,
        'is_verified': marque.is_verified,
        'followers_count': marque.followers_count,
        'articles_count': len(articles_data),
        'articles': articles_data
    }

    return JsonResponse(data)


@csrf_exempt
def brand_articles_api(request):
    """
    GET /api/brands/my-articles/ - Liste les articles de la marque connectée
    POST /api/brands/my-articles/ - Permet à une marque connectée d'enregistrer un nouvel article !
    """
    user = check_auth(request)
    if not user:
        return JsonResponse({'error': 'Non autorisé. Token manquant ou invalide.'}, status=401)

    marque = getattr(user, 'marque_profile', None)
    if not marque:
        return JsonResponse({'error': 'Profil de marque requis pour cette action.'}, status=403)

    if request.method == 'GET':
        articles = Article.objects.filter(marque__iexact=marque.nom_organisation)
        # Formater les articles
        articles_list = []
        for a in articles:
            articles_list.append({
                'id': a.id,
                'nom': a.nom,
                'slug': a.slug,
                'prix': float(a.prix),
                'stock': a.stock,
                'description': a.description,
                'date_ajout': a.date_ajout.isoformat(),
                'image': a.image.url if a.image else None,
                'category': a.category,
                'marque': a.marque,
                'boutique_nom': a.boutique.nom
            })
        return JsonResponse({'articles': articles_list})

    elif request.method == 'POST':
        # Ajouter un article
        try:
            # Si le frontend envoie du MultipartFormData (pour l'image)
            if request.content_type.startswith('multipart/form-data'):
                # Lecture des champs standards
                nom = request.POST.get('nom', '').strip()
                prix = request.POST.get('prix', '0')
                description = request.POST.get('description', '').strip()
                stock = int(request.POST.get('stock', '0'))
                category = request.POST.get('category', '').strip()
                boutique_id = int(request.POST.get('boutique_id', '0'))
                
                # Image
                image_file = request.FILES.get('image', None)
            else:
                # Lecture brute JSON
                body = json.loads(request.body)
                nom = body.get('nom', '').strip()
                prix = str(body.get('prix', '0'))
                description = body.get('description', '').strip()
                stock = int(body.get('stock', '0'))
                category = body.get('category', '').strip()
                boutique_id = int(body.get('boutique_id', '0'))
                image_file = None
        except Exception as e:
            return JsonResponse({'error': f'Payload d’envoi mal formé : {str(e)}'}, status=400)

        if not nom or not boutique_id:
            return JsonResponse({'error': 'Le nom de l’article et la boutique de distribution sont obligatoires.'}, status=400)

        boutique = get_object_or_404(Boutique, id=boutique_id)

        try:
            with transaction.atomic():
                # 1. Création de l’article
                base_slug = slugify(nom)
                slug = f"{base_slug}-{now().strftime('%M%S')}"
                
                article = Article.objects.create(
                    nom=nom,
                    slug=slug,
                    boutique=boutique,
                    prix=prix,
                    description=description,
                    stock=stock,
                    category=category,
                    marque=marque.nom_organisation, # Attacher le nom officiel de la marque !
                    image=image_file,
                )

                # 2. Création/Lien du stock pour cette boutique
                StockBoutique.objects.create(
                    article=article,
                    boutique=boutique,
                    quantite=stock,
                    seuil_alerte=5
                )

                # 3. Mettre à jour le compteur sur Marque
                marque.articles_count = Article.objects.filter(marque__iexact=marque.nom_organisation).count()
                marque.save()

            return JsonResponse({
                'success': True,
                'message': 'Article enregistré avec succès !',
                'article': {
                    'id': article.id,
                    'nom': article.nom,
                    'slug': article.slug,
                    'prix': float(article.prix),
                    'stock': article.stock,
                    'marque': article.marque,
                    'boutique_nom': boutique.nom
                }
            }, status=201)

        except Exception as e:
            return JsonResponse({'error': f'Erreur transactionnelle : {str(e)}'}, status=500)

    else:
        return JsonResponse({'error': 'Méthode non autorisée.'}, status=405)


@csrf_exempt
def barcode_generate_api(request):
    """
    POST /api/brands/barcode/generate/
    Génère et associe un bloc de codes-barres uniques à un article.
    """
    user = check_auth(request)
    if not user or not user.is_marque:
        return JsonResponse({'error': 'Seuls les comptes marques autorisés peuvent générer des codes-barres.'}, status=401)

    if request.method != 'POST':
        return JsonResponse({'error': 'Méthode non autorisée.'}, status=405)

    try:
        data = json.loads(request.body)
        article_id = int(data.get('article_id', 0))
        codes_list = data.get('codes', []) # Array de strings
    except (json.JSONDecodeError, ValueError, TypeError):
        return JsonResponse({'error': 'Données d’entrée invalides.'}, status=400)

    article = get_object_or_404(Article, id=article_id)
    
    # Vérification que la marque détient bien l'article
    marque = getattr(user, 'marque_profile', None)
    if not marque or article.marque.lower() != marque.nom_organisation.lower():
        return JsonResponse({'error': 'Action non autorisée. Cet article ne vous appartient pas.'}, status=403)

    added_count = 0
    with transaction.atomic():
        for code_str in codes_list:
            code_str = code_str.strip()
            if not code_str:
                continue
            # Vérifier l'unicité globale du code
            if not CodeBarre.objects.filter(code=code_str).exists():
                CodeBarre.objects.create(
                    code=code_str,
                    article=article,
                    createur=user
                )
                added_count += 1

    return JsonResponse({
        'success': True,
        'message': f'{added_count} codes-barres associés avec succès à l’article "{article.nom}".',
        'added_count': added_count
    })


@csrf_exempt
def verify_authenticity_api(request, barcode):
    """
    GET /api/brands/verify/<barcode>/
    Scanner public : Recherche d'un code-barres pour vérifier l'authenticité d'un article.
    Met en correspondance le code avec l'article et le statut certifié de la Marque !
    """
    code_obj = CodeBarre.objects.filter(code=barcode).select_related('article', 'article__boutique', 'createur').first()
    
    if not code_obj:
        return JsonResponse({
            'verified': False,
            'message': 'Code-barres inconnu. Produit contrefait ou non enregistré !',
            'severity': 'danger'
        }, status=404)

    article = code_obj.article
    # Trouver le statut de la marque auprès de son créateur ou via sa table marque
    createur_user = code_obj.createur
    marque_profile = getattr(createur_user, 'marque_profile', None) if createur_user else None
    
    brand_verified = False
    brand_logo = None
    brand_name = article.marque or "Marque indifférente"

    if marque_profile:
        brand_verified = marque_profile.is_verified
        brand_logo = marque_profile.logo.url if marque_profile.logo else None
        brand_name = marque_profile.nom_organisation
    elif createur_user:
        brand_verified = createur_user.verified
        brand_logo = createur_user.image_profil.url if createur_user.image_profil else None

    # Obtenir la liste des boutiques physiques où ce produit est disponible
    stocks_en_boutique = StockBoutique.objects.filter(article=article).select_related('boutique')
    boutiques_avail = []
    for sb in stocks_en_boutique:
        boutiques_avail.append({
            'nom': sb.boutique.nom,
            'adresse': sb.boutique.adresse,
            'ville': sb.boutique.ville.nom,
            'quantite_stock': sb.quantite,
            'statut_stock': 'rupture' if sb.quantite <= 0 else ('faible' if sb.quantite <= sb.seuil_alerte else 'bon')
        })

    return JsonResponse({
        'verified': True,
        'code': barcode,
        'message': 'Produit Authentique Certifié !',
        'timestamp': code_obj.date_ajout.isoformat(),
        'article': {
            'id': article.id,
            'nom': article.nom,
            'prix': float(article.prix),
            'image': article.image.url if article.image else None,
            'description': article.description,
            'category': article.category,
        },
        'brand': {
            'nom': brand_name,
            'is_verified': brand_verified,
            'logo': brand_logo,
        },
        'distribution': boutiques_avail
    })
