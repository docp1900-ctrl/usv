# 🚀 Déploiement Rapide USALLI Bank
## Frontend Hostinger + Backend Render (Gratuit)

---

## ⚡ Version Express (5 minutes)

### 1️⃣ Backend sur Render.com

```bash
# 1. Créez un compte sur https://render.com (gratuit, sans CB)

# 2. Créez un repository GitHub
# Sur Replit, pushez votre code :
git remote add origin https://github.com/VOTRE-USERNAME/usalli-bank.git
git push -u origin main

# 3. Sur Render.com :
#    - New + → Web Service
#    - Connectez GitHub → Sélectionnez usalli-bank
#    - Configurez :
#      Name: usalli-bank-backend
#      Build: npm install
#      Start: node server/server.js
#      Plan: FREE
#
#    - Variables d'environnement :
#      NODE_ENV = production
#      DATABASE_URL = (copiez depuis vos secrets Replit)
#      FRONTEND_URL = https://votre-domaine.com
#
#    - Create Web Service
#
# 4. Notez l'URL générée (ex: https://usalli-bank-backend.onrender.com)
```

### 2️⃣ Frontend sur Hostinger

```bash
# Sur Replit :

# 1. Créez .env.production avec votre URL Render
echo "VITE_API_URL=https://usalli-bank-backend.onrender.com/api" > .env.production

# 2. Construisez le frontend
npm run build

# 3. Sur Hostinger File Manager :
#    - Allez dans public_html
#    - Supprimez tout
#    - Uploadez TOUT le contenu du dossier dist/
#    - Vérifiez que .htaccess est présent

# 4. Testez sur https://votre-domaine.com
```

---

## 📝 Identifiants de test

- **Client** : `client@usalli.com` / `ClientPass123!`
- **Admin** : `admin@usalli.com` / `AdminPass123!`

---

## 🔧 Script automatique

Au lieu de créer .env.production manuellement :

```bash
npm run build:hostinger
```

Le script vous demandera l'URL de votre backend et construira automatiquement.

---

## ⚠️ Important - Plan Gratuit Render

Le backend s'endort après 15 min d'inactivité.

**Solution** : Utilisez [UptimeRobot](https://uptimerobot.com) (gratuit)
- Créez un monitor HTTP
- URL : `https://usalli-bank-backend.onrender.com/health`
- Intervalle : 5 minutes

Votre backend restera actif 24/7 ! 🎉

---

## 💰 Coût total : **~3€/mois**

- Hostinger : ~3€/mois
- Render : GRATUIT
- Supabase : GRATUIT

---

## 📚 Guide complet

Pour plus de détails, consultez `GUIDE_DEPLOIEMENT.md`

---

Bon déploiement ! 🚀
