# 🚀 Guide de Déploiement USALLI Bank
## Configuration Mixte : Frontend Hostinger + Backend Render.com (Gratuit)

---

## 📋 Vue d'ensemble

- **Frontend** : Hébergement partagé Hostinger (~3€/mois)
- **Backend** : Render.com (Gratuit)
- **Base de données** : Supabase PostgreSQL (déjà configuré)

---

## PARTIE 1 : Déployer le Backend sur Render.com (GRATUIT)

### Étape 1 : Créer un compte Render.com

1. Allez sur [https://render.com](https://render.com)
2. Cliquez sur **"Get Started"** (pas besoin de carte bancaire)
3. Inscrivez-vous avec GitHub ou email

### Étape 2 : Connecter votre dépôt GitHub

1. Sur Replit, ouvrez le terminal et tapez :
   ```bash
   git remote -v
   ```
2. Si pas de repository GitHub, créez-en un :
   - Allez sur [https://github.com/new](https://github.com/new)
   - Nommez-le `usalli-bank`
   - Créez le repository (public ou privé)
   
3. Sur Replit, poussez votre code :
   ```bash
   git remote add origin https://github.com/VOTRE-USERNAME/usalli-bank.git
   git push -u origin main
   ```

### Étape 3 : Créer le service Web sur Render

1. Sur Render.com, cliquez sur **"New +"** → **"Web Service"**
2. Connectez votre compte GitHub et sélectionnez le repository `usalli-bank`
3. Configurez comme suit :
   - **Name** : `usalli-bank-backend`
   - **Environment** : `Node`
   - **Branch** : `main`
   - **Build Command** : `npm install`
   - **Start Command** : `node server/server.js`
   - **Plan** : **Free** ✅

4. Cliquez sur **"Advanced"** et ajoutez les variables d'environnement :
   - **NODE_ENV** = `production`
   - **DATABASE_URL** = `votre_url_supabase` (copiez depuis les secrets Replit)
   - **FRONTEND_URL** = `https://votre-domaine.com` (vous l'ajouterez après avoir configuré Hostinger)

5. Cliquez sur **"Create Web Service"**

### Étape 4 : Récupérer l'URL du backend

Une fois le déploiement terminé (environ 2-3 minutes), vous verrez :
```
https://usalli-bank-backend.onrender.com
```

**IMPORTANT** : Copiez cette URL, vous en aurez besoin pour le frontend !

⚠️ **Note sur le plan gratuit Render** : 
- L'app s'endort après 15 minutes d'inactivité
- Premier chargement peut prendre 30-60 secondes
- **Solution** : Utilisez [UptimeRobot](https://uptimerobot.com) (gratuit) pour ping votre API toutes les 5 minutes

---

## PARTIE 2 : Déployer le Frontend sur Hostinger

### Étape 1 : Préparer le build de production

1. Sur Replit, créez un fichier `.env.production` avec :
   ```bash
   VITE_API_URL=https://usalli-bank-backend.onrender.com/api
   ```
   (Remplacez par votre vraie URL Render)

2. Construisez le frontend :
   ```bash
   npm run build
   ```

3. Les fichiers compilés sont dans le dossier `dist/`

### Étape 2 : Upload sur Hostinger

1. Connectez-vous à votre compte Hostinger
2. Allez dans **hPanel** → **File Manager**
3. Naviguez vers `public_html` (ou le dossier de votre domaine)
4. **Supprimez tous les fichiers existants** dans `public_html`
5. Uploadez **TOUT le contenu du dossier `dist/`** (pas le dossier lui-même, juste son contenu)
   - `index.html`
   - Dossier `assets/`
   - `.htaccess`

6. Vérifiez que `.htaccess` est bien uploadé (il peut être caché)

### Étape 3 : Configurer le domaine

1. Si vous utilisez un domaine personnalisé :
   - Allez dans **Domains** → Votre domaine → **DNS**
   - Assurez-vous que l'enregistrement A pointe vers votre hébergement

2. Attendez quelques minutes pour la propagation DNS

### Étape 4 : Mettre à jour l'URL frontend sur Render

1. Retournez sur Render.com → Votre service backend
2. Allez dans **Environment** → Ajoutez/Modifiez :
   - **FRONTEND_URL** = `https://votre-domaine.com`
3. Cliquez sur **"Save Changes"** (le service redémarrera automatiquement)

---

## PARTIE 3 : Initialiser la base de données (Si nécessaire)

Si votre base Supabase n'est pas encore initialisée :

```bash
node server/init-db.js
```

---

## ✅ Vérification du déploiement

### Test du Backend
Ouvrez dans votre navigateur :
```
https://usalli-bank-backend.onrender.com/health
```
Vous devriez voir :
```json
{"status":"ok","timestamp":"2025-10-27T..."}
```

### Test du Frontend
1. Ouvrez `https://votre-domaine.com`
2. Vous devriez voir la page de login USALLI Bank
3. Testez le login avec :
   - Email : `client@usalli.com`
   - Mot de passe : `ClientPass123!`

---

## 🔧 Mises à jour futures

### Mettre à jour le backend (Render)
```bash
# Sur Replit
git add .
git commit -m "Mise à jour backend"
git push origin main
```
Render déploiera automatiquement la nouvelle version !

### Mettre à jour le frontend (Hostinger)
```bash
# Sur Replit
npm run build
```
Puis re-uploadez le contenu de `dist/` sur Hostinger via File Manager.

---

## ❓ Dépannage

### Le frontend ne charge pas
- Vérifiez que `.htaccess` est bien présent dans `public_html`
- Vérifiez que l'URL de l'API dans `.env.production` est correcte
- Ouvrez la console du navigateur (F12) pour voir les erreurs

### Erreurs CORS
- Vérifiez que `FRONTEND_URL` sur Render correspond exactement à votre domaine
- Vérifiez que votre domaine utilise HTTPS (obligatoire)

### Le backend est lent
- Normal pour le plan gratuit Render (cold start après inactivité)
- Solution : Utilisez UptimeRobot pour ping toutes les 5 minutes

### Erreur de base de données
- Vérifiez que `DATABASE_URL` sur Render est correct
- Testez la connexion depuis Render : 
  - Terminal → `node server/init-db.js`

---

## 💰 Coûts mensuels

| Service | Prix | Note |
|---------|------|------|
| **Hostinger** (hébergement partagé) | ~3€/mois | Pour le frontend |
| **Render.com** | GRATUIT ✅ | Backend Node.js |
| **Supabase** | GRATUIT ✅ | Base de données PostgreSQL |
| **Total** | **~3€/mois** | 🎉 |

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs sur Render.com (onglet "Logs")
2. Vérifiez la console du navigateur (F12)
3. Vérifiez que Supabase fonctionne

---

Bon déploiement ! 🚀
