# django_templates/brands_urls.py
# -*- coding: utf-8 -*-

from django.urls import path
from . import brands_views  # s'installe dans le même répertoire que vos vues de marques

app_name = 'brands'

urlpatterns = [
    # Connexion et récupération de profil via code d'accès
    path('login/', brands_views.brand_login_api, name='brand_login'),
    
    # Récupération publique du profil d'une marque (avec ses articles rattachés)
    path('<str:username>/', brands_views.brand_profile_api, name='brand_profile_detail'),
    
    # Gestion des articles (GET pour lister, POST pour enregistrer un nouvel article)
    path('my-articles/', brands_views.brand_articles_api, name='brand_articles_management'),
    
    # Association de codes-barres uniques en masse (bulk generation)
    path('barcode/generate/', brands_views.barcode_generate_api, name='brand_barcode_generate'),
    
    # Scanner / Authentification publique du produit par code-barres
    path('verify/<str:barcode>/', brands_views.verify_authenticity_api, name='brand_barcode_verify'),
]
