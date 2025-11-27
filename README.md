# 🎄 Advent Calendar Love

Un calendrier de l'Avent interactif et personnalisable avec des animations de confettis, un système de likes et un panneau d'administration complet.

![Version](https://img.shields.io/badge/Version-1.0.1-red?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Fonctionnalités

### 🎁 Interface Utilisateur
- **Calendrier interactif** avec cases numérotées (responsive 3→7 colonnes)
- **Ouverture progressive** des cadeaux selon la date
- **Animations de confettis** spectaculaires (build-up + explosion géométrique)
- **Système de likes** pour chaque cadeau avec persistance
- **Re-visionnage** des cadeaux déjà ouverts
- **Compte à rebours** en temps réel jusqu'à Noël
- **Message spécial** personnalisable le jour de Noël
- **Design responsive** optimisé mobile-first

### 🛠️ Panneau d'Administration
- **Authentification sécurisée** par mot de passe
- **Gestion complète des cadeaux** (titre, description, image)
- **Configuration flexible** de la date de Noël
- **Génération automatique** de cadeaux vides (1-31 jours)
- **Statistiques des likes** en temps réel
- **Mode développement** avec simulation de date
- **Détection automatique** des cadeaux manquants/en trop
- **Nettoyage intelligent** des données
- **Interface en grille** intuitive avec codes couleur

### 🔧 Fonctionnalités Techniques
- **Stockage JSON** des données avec structure optimisée
- **Server Actions** Next.js 15 pour les mutations
- **Gestion d'état** React 18 avec hooks optimisés
- **Animations CSS** fluides 60fps
- **Responsive design** mobile-first (3→7 colonnes)
- **Mode sombre** par défaut avec next-themes
- **TypeScript** strict pour la sécurité des types

## 🚀 Installation

### Prérequis
- **Node.js** 18+ 
- **npm** ou **yarn**

### Étapes d'installation

1. **Cloner le repository**
```
git clone https://gitlab.com/Aprilox/advent-calendar-love.git
cd advent-calendar-love
```

2. **Installer les dépendances**
```
npm install
# ou
yarn install
```

3. **Lancer en mode développement**
```
npm run dev
# ou
yarn dev
```

4. **Ouvrir dans le navigateur**
```
http://localhost:3000
```

## 📁 Structure du Projet

```
advent-calendar-love/
├── app/
│   ├── admin/
│   │   ├── page.tsx          # Panneau d'administration
│   │   └── actions.tsx       # Actions serveur admin
│   ├── actions.ts            # Actions serveur principales
│   ├── layout.tsx            # Layout principal avec metadata
│   ├── page.tsx              # Page calendrier (interface utilisateur)
│   └── globals.css           # Styles globaux Tailwind
├── components/
│   ├── ui/                   # Composants shadcn/ui (Radix UI)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   └── theme-provider.tsx    # Provider next-themes
├── lib/
│   ├── settings.ts           # Types TypeScript et configuration
│   └── utils.ts              # Utilitaires (cn, etc.)
├── data/
│   └── settings.json         # Données persistantes (auto-créé)
├── public/
│   └── favicon.ico
├── package.json              # Dépendances et scripts
├── tailwind.config.ts        # Configuration Tailwind
├── tsconfig.json             # Configuration TypeScript
└── README.md
```

## ⚙️ Configuration

### Première utilisation

1. **Accéder au panneau d'administration**
   - Aller sur `http://localhost:3000/admin`
   - Mot de passe par défaut : `admin123`

2. **Configurer le calendrier**
   - Définir la date de Noël (format ISO)
   - Choisir le nombre de jours (1-31)
   - Générer les cadeaux vides automatiquement

3. **Personnaliser les cadeaux**
   - Cliquer sur chaque case colorée pour éditer
   - Ajouter titre, description et URL d'image
   - Sauvegarder les modifications

### Configuration avancée

#### Mode Développement
Permet de simuler n'importe quelle date pour tester le calendrier :

```
// Dans le panneau admin
developmentMode: true
simulatedDate: "2024-12-20T10:00:00"
```

#### Structure des données
```
interface Settings {
  christmasDate: string           // Date de Noël (ISO)
  gifts: Gift[]                  // Liste des cadeaux
  finalMessage: string           // Message de Noël
  adminPassword: string          // Mot de passe admin
  likes: GiftLike[]             // Likes des utilisateurs
  developmentMode: boolean       // Mode développement
  simulatedDate?: string         // Date simulée (dev)
}
```

## 🎮 Utilisation

### Pour les Utilisateurs
1. **Consulter le compte à rebours** en temps réel jusqu'à Noël
2. **Cliquer sur les cases disponibles** (débloquées selon la date courante)
3. **Profiter des animations** de confettis à 3 phases (build-up → explosion → révélation)
4. **Liker les cadeaux** préférés (persistance automatique)
5. **Revoir les cadeaux** déjà ouverts (indication visuelle)

### Pour les Administrateurs
1. **Se connecter** au panneau admin (`/admin`)
2. **Configurer** la date de Noël et le nombre de jours
3. **Éditer chaque cadeau** individuellement avec prévisualisation
4. **Suivre les statistiques** de likes en temps réel
5. **Utiliser le mode dev** pour tester différentes dates
6. **Gérer automatiquement** les cadeaux manquants/en trop

## 🎨 Personnalisation

### Responsive Design
| Écran | Colonnes | Breakpoint | Optimisation |
|-------|----------|------------|--------------|
| Mobile | 3 | < 640px | Cases plus grandes, touch-friendly |
| Tablette | 5 | 640px - 768px | Équilibre taille/nombre |
| Desktop | 6 | 768px - 1024px | Affichage optimal |
| Large | 7 | > 1024px | Utilisation maximale |

### Couleurs et Thème
```
/* Palette de couleurs Noël */
:root {
  --christmas-red: #dc2626, #b91c1c;
  --christmas-gold: #fbbf24, #f59e0b;
  --dark-bg: #1f2937, #111827;
  --success-green: #10b981, #059669;
}
```

### Animations de Confettis
```
// Configuration des animations
const CONFETTI_CONFIG = {
  buildUp: {
    duration: 1200,        // ms
    particleCount: 30,
    colors: ["#feca57", "#ff9ff3", "#54a0ff"]
  },
  explosion: {
    particleCount: 150,    // Confettis massifs
    velocity: [20, 50],    // px/frame
    shapes: ["rectangle", "circle", "triangle"]
  }
}
```

## 🛡️ Sécurité

- **Authentification** par mot de passe hashé pour l'admin
- **Validation** stricte des données côté serveur
- **Sanitisation** des entrées utilisateur (XSS protection)
- **Séparation** claire des données publiques/privées
- **TypeScript** strict pour éviter les erreurs de type

## 🔄 API / Actions Serveur

### Actions Principales (Public)
```
loadSettings(): Promise<PublicSettings>     // Charger config publique
openGift(giftId: number): Promise<void>     // Ouvrir un cadeau
toggleGiftLike(giftId: number): Promise<GiftLike>  // Toggle like
```

### Actions Admin (Authentifiées)
```
authenticateAdmin(password: string): Promise<boolean>
updateGift(id: number, title: string, text: string, image?: string): Promise<void>
deleteGift(giftId: number): Promise<void>
createMissingGifts(maxDays: number): Promise<void>
cleanExtraGifts(maxDays: number): Promise<void>
updateAdminPassword(oldPassword: string, newPassword: string): Promise<boolean>
```

## 🚀 Déploiement

### Vercel (Recommandé)
```
# Build et déploiement
npm run build
npx vercel --prod

# Ou avec l'interface Vercel
# 1. Connecter le repository GitLab
# 2. Configurer les variables d'environnement si nécessaire
# 3. Déployer automatiquement
```

### Docker
```
FROM node:18-alpine
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
RUN npm ci --only=production

# Copier le code source
COPY . .

# Build de l'application
RUN npm run build

# Exposer le port
EXPOSE 3000

# Démarrer l'application
CMD ["npm", "start"]
```

### Variables d'environnement
```
# Production (optionnel)
NODE_ENV=production

# Personnalisation (optionnel)
NEXT_PUBLIC_APP_NAME="Mon Calendrier de l'Avent"
```

## 🧪 Tests et Développement

### Scripts disponibles
```
npm run dev      # Développement avec hot-reload
npm run build    # Build de production
npm run start    # Démarrage en production
npm run lint     # Vérification ESLint
```

### Mode Développement
- **Hot reload** automatique
- **Simulation de date** pour tester le calendrier
- **Logs détaillés** des actions serveur
- **Validation TypeScript** en temps réel

## 🤝 Contribution

1. **Fork** le projet sur GitLab
2. **Créer** une branche feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** les changements (`git commit -m 'Add: AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrir** une Merge Request

### Standards de code
- **TypeScript** strict activé
- **ESLint** pour la qualité du code
- **Prettier** pour le formatage (optionnel)
- **Commits conventionnels** recommandés

## 📦 Technologies Utilisées

### Core Framework
- **Next.js** `15.2.4` - Framework React full-stack
- **React** `18.2.0` - Bibliothèque UI
- **TypeScript** `^5` - Typage statique
- **Tailwind CSS** `^3.4.17` - Framework CSS utility-first

### UI Components
- **Radix UI** `1.1.x - 2.2.x` - Composants accessibles headless
- **Lucide React** `^0.454.0` - Icônes SVG
- **next-themes** `^0.4.4` - Gestion des thèmes
- **class-variance-authority** `^0.7.1` - Variants de composants

### Form & Validation
- **react-hook-form** `^7.54.1` - Gestion des formulaires
- **@hookform/resolvers** `^3.9.1` - Résolveurs de validation
- **zod** `^3.24.1` - Validation de schémas

### Date & Time
- **date-fns** `3.6.0` - Manipulation des dates
- **react-day-picker** `8.10.1` - Sélecteur de dates

### UI Enhancements
- **sonner** `^1.7.1` - Notifications toast
- **cmdk** `1.0.4` - Interface de commande
- **vaul** `^0.9.6` - Drawer mobile
- **embla-carousel-react** `8.5.1` - Carrousel
- **recharts** `2.15.0` - Graphiques et charts
- **react-resizable-panels** `^2.1.7` - Panneaux redimensionnables

### Utilities
- **clsx** `^2.1.1` - Utilitaire de classes conditionnelles
- **tailwind-merge** `^2.5.5` - Fusion intelligente de classes Tailwind
- **tailwindcss-animate** `^1.0.7` - Animations Tailwind

## 📝 Changelog

### v1.0.1 (2024-12-23)
- 🔧 **Fix**: Compatibilité React 18.2.0 avec date-fns 3.6.0
- ⬆️ **Upgrade**: Next.js 15.2.4
- ⬆️ **Upgrade**: Radix UI components vers versions stables (1.1.x - 2.2.x)
- ➕ **Add**: react-hook-form + zod pour la validation
- ➕ **Add**: sonner pour les notifications
- ➕ **Add**: cmdk, vaul, embla-carousel pour l'UI
- ➕ **Add**: recharts pour les futurs graphiques
- 📱 **Improve**: Responsive design mobile (3 colonnes)
- 🎨 **Improve**: Animations de confettis optimisées
- 🔧 **Fix**: Problèmes de compatibilité des dépendances

### v1.0.0
- ✨ **Initial**: Calendrier de l'Avent interactif
- 🎆 **Add**: Animations de confettis (build-up + explosion)
- 👨‍💼 **Add**: Panneau d'administration complet
- 💖 **Add**: Système de likes avec persistance
- 📱 **Add**: Design responsive optimisé
- 🛠️ **Add**: Mode développement avec simulation de date
- 🔄 **Add**: Re-visionnage des cadeaux ouverts

## 🐛 Problèmes Connus

- ⚠️ Les confettis peuvent être lents sur les appareils très anciens (< 2GB RAM)
- ⚠️ Le mode développement nécessite un rechargement pour certains changements de date
- ⚠️ Les images externes peuvent ne pas s'afficher si CORS bloqué

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Auteur

**Aprilox** - [GitLab](https://gitlab.com/Aprilox)

Créé avec ❤️ pour un Noël magique

---

## 🆘 Support

Pour toute question ou problème :

1. 📋 Consulter les [Issues GitLab](https://gitlab.com/Aprilox/advent-calendar-love/-/issues)
2. 🆕 Créer une nouvelle issue si nécessaire
3. 📖 Consulter cette documentation
4. 💬 Contacter [@Aprilox](https://gitlab.com/Aprilox)

---

## 🔗 Liens Utiles

- **Repository GitLab**: https://gitlab.com/Aprilox/advent-calendar-love
- **Documentation Next.js**: https://nextjs.org/docs
- **Documentation Radix UI**: https://www.radix-ui.com/
- **Documentation Tailwind CSS**: https://tailwindcss.com/docs

---

**🎄 Joyeux Noël et bonnes fêtes ! 🎅🎁**

*Que ce calendrier apporte de la magie à votre période de l'Avent !* ✨
