# Système de Gestion des Badges — Garde Communale de Pita

**GC PITA** — Application web complète de gestion des badges officiels des agents de la Garde Communale de la Commune de Pita, République de Guinée.

---

## Fonctionnalités

- Enregistrement et gestion des agents (photo, identité, informations professionnelles)
- Génération automatique de matricule unique (GC-PITA-001, GC-PITA-002...)
- Génération de QR Code unique par badge pour vérification publique
- Génération du badge officiel recto/verso en PDF
- Aperçu visuel du badge avant téléchargement
- Vérification publique de l'authenticité par scan du QR Code (sans compte)
- Révocation, suspension et renouvellement de badges avec historique
- Tableau de bord avec statistiques en temps réel
- Historique complet des opérations
- Authentification JWT avec deux rôles : ADMIN et RESPONSABLE_GARDE
- Interface responsive (desktop, tablette, mobile)

---

## Architecture

```
Frontend_B_Mairie/
├── Badges/              # Frontend React + TypeScript + Vite + Tailwind
│   └── src/
│       ├── components/  # Composants UI réutilisables et layout
│       ├── contexts/    # AuthContext
│       ├── pages/       # Pages de l'application
│       ├── services/    # Services API (axios)
│       ├── types/       # Types TypeScript
│       └── utils/       # Utilitaires (formatage dates...)
└── backend/             # Backend Node.js + Express + TypeScript
    └── src/
        ├── config/      # Configuration base de données
        ├── controllers/ # Contrôleurs API
        ├── middlewares/ # Auth, erreurs, upload
        ├── models/      # Modèles Mongoose
        ├── routes/      # Routes Express
        ├── scripts/     # Seed admin et démo
        ├── services/    # Matricule, QR Code, PDF, historique
        ├── types/       # Types TypeScript
        └── utils/       # Logger, dates
```

---

## Technologies

| Couche | Technologies |
|--------|--------------|
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS 4, React Router, Axios, Lucide |
| Backend | Node.js, Express, TypeScript, JWT, bcryptjs |
| Base de données | MongoDB, Mongoose |
| QR Code | qrcode (serveur) |
| PDF | Puppeteer (Chrome) |
| Upload | Multer |
| Logs | Winston |

---

## Installation

### Prérequis

- Node.js 18+
- MongoDB (local ou MongoDB Atlas)
- Google Chrome (pour la génération PDF)

### 1. Cloner ou ouvrir le projet

```bash
cd Desktop/Frontend_B_Mairie
```

### 2. Configurer le Backend

```bash
cd backend
cp .env.example .env
# Éditer .env avec vos valeurs
npm install
```

### 3. Configurer le Frontend

```bash
cd ../Badges
cp .env.example .env
# Éditer .env si nécessaire
npm install
```

---

## Configuration .env

### Backend (`backend/.env`)

```env
MONGODB_URI=mongodb://localhost:27017/gc-pita
JWT_SECRET=votre_secret_jwt_tres_securise_min_32_caracteres
FRONTEND_URL=http://localhost:5173
QR_BASE_URL=http://localhost:5173/verification
PORT=5000
NODE_ENV=development
UPLOAD_DIR=uploads
```

### Frontend (`Badges/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Démarrage

### Backend

```bash
cd backend
npm run dev
```

Le serveur démarre sur `http://localhost:5000`

### Frontend

```bash
cd Badges
npm run dev
```

L'application est accessible sur `http://localhost:5173`

---

## Créer le premier compte administrateur

```bash
cd backend
npm run seed:admin
```

Identifiants créés :
- **Email** : admin@mairie-pita.gn
- **Mot de passe** : Admin@GCPita2024!

> ⚠️ Changez ce mot de passe immédiatement en production !

---

## Données de démonstration

```bash
cd backend
npm run seed:demo
```

Crée 5 agents avec leurs badges :
- GC-PITA-001 — Ibrahima MARAA
- GC-PITA-002 — Mamadou DIALLO
- GC-PITA-003 — Fatoumata BAH
- GC-PITA-004 — Thierno BARRY
- GC-PITA-005 — Aïssatou CAMARA

---

## Génération PDF — Prérequis

La génération PDF utilise Puppeteer avec Chrome. Si Chrome n'est pas trouvé automatiquement, installez-le via :

```bash
cd backend
npx puppeteer browsers install chrome
```

Ou définissez le chemin Chrome manuellement si déjà installé (détection automatique incluse).

---

## API Endpoints

### Authentification
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | /api/auth/login | Connexion |
| GET | /api/auth/me | Profil connecté |

### Agents
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | /api/agents | Liste avec pagination et filtres |
| POST | /api/agents | Créer un agent |
| GET | /api/agents/:id | Détail agent |
| PUT | /api/agents/:id | Modifier agent |
| DELETE | /api/agents/:id | Supprimer (ADMIN) |

### Badges
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | /api/badges | Liste badges |
| GET | /api/badges/:id | Détail badge |
| POST | /api/badges/:id/generate | Générer badge |
| GET | /api/badges/:id/pdf | Télécharger PDF |
| POST | /api/badges/:id/revoke | Révoquer |
| POST | /api/badges/:id/suspend | Suspendre |
| POST | /api/badges/:id/renew | Renouveler |

### Vérification publique (sans authentification)
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | /api/verify/:token | Vérifier un badge par token QR |

### Dashboard & Historique
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | /api/dashboard/stats | Statistiques |
| GET | /api/history | Historique des opérations |

---

## Déploiement

### Frontend — Vercel

```bash
cd Badges
npm run build
# Déployer le dossier dist/ sur Vercel
# Variable d'environnement : VITE_API_URL=https://votre-api.render.com/api
```

### Backend — Render

1. Connecter le dossier `backend/` à Render
2. Build command : `npm run build`
3. Start command : `node dist/server.js`
4. Variables d'environnement à configurer dans Render

### Base de données — MongoDB Atlas

```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/gc-pita
```

---

## Sécurité

- Mots de passe hashés avec bcryptjs (12 rounds)
- JWT avec expiration 8h
- Rate limiting sur les routes sensibles
- CORS configuré pour le domaine frontend uniquement
- Validation stricte frontend et backend
- Tokens QR UUID impossibles à deviner
- Aucune donnée sensible exposée via l'API publique
- Variables d'environnement pour tous les secrets

---

## Rôles

| Rôle | Permissions |
|------|-------------|
| ADMIN | Accès complet, suppression agents |
| RESPONSABLE_GARDE | Consultation, création, génération badges |

---

© 2024 — Commune de Pita — Garde Communale — République de Guinée
