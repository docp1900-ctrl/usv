#!/bin/bash

# Script de build pour production Hostinger
# Ce script construit le frontend avec l'URL de l'API Render

echo "🚀 Construction du frontend pour Hostinger..."
echo ""

# Demander l'URL du backend Render
echo "Entrez l'URL de votre backend Render (ex: https://usalli-bank-backend.onrender.com):"
read BACKEND_URL

if [ -z "$BACKEND_URL" ]; then
    echo "❌ Erreur: URL du backend requise"
    exit 1
fi

# Créer le fichier .env.production
echo "VITE_API_URL=${BACKEND_URL}/api" > .env.production

echo "✅ Configuration créée avec API_URL = ${BACKEND_URL}/api"
echo ""

# Build du projet
echo "📦 Construction du projet..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build réussi !"
    echo ""
    echo "📂 Les fichiers sont dans le dossier 'dist/'"
    echo ""
    echo "Prochaines étapes :"
    echo "1. Connectez-vous à Hostinger File Manager"
    echo "2. Allez dans public_html"
    echo "3. Uploadez TOUT le contenu du dossier 'dist/'"
    echo ""
else
    echo "❌ Erreur lors du build"
    exit 1
fi
