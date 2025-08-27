# Arizon - Plateforme Agricole Intelligente

Une plateforme moderne pour connecter producteurs agricoles et consommateurs, construite avec Next.js 15, TypeScript, et Tailwind CSS.

## 🚀 Fonctionnalités

- **Système d'authentification complet** avec inscription, connexion et récupération de mot de passe
- **Interface utilisateur moderne** avec thème vert agricole et design responsive
- **Gestion des utilisateurs** avec rôles et permissions
- **Catalogue de produits** pour les entreprises agricoles
- **Suivi des commandes** en temps réel
- **Analyses et rapports** pour optimiser votre activité
- **Plateforme multilingue** (français par défaut)

## 🛠️ Technologies utilisées

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4 avec thème personnalisé vert
- **Base de données**: Prisma avec PostgreSQL
- **Authentification**: JWT avec sessions sécurisées
- **Validation**: Zod pour la validation des données
- **Tests**: Jest avec configuration complète
- **Linting**: ESLint avec règles strictes

## 🎨 Thème et Design

Le projet utilise un thème vert moderne inspiré de l'agriculture durable :

- **Couleurs principales**: Palette de verts (oklch) pour un rendu naturel
- **Gradients**: Effets visuels subtils avec des ombres et lueurs vertes
- **Typographie**: Hiérarchie claire avec des polices lisibles
- **Responsive**: Design adaptatif pour tous les appareils
- **Accessibilité**: Respect des standards WCAG avec attributs ARIA

## 📱 Pages d'authentification

### Inscription (`/signup`)
- Formulaire d'inscription complet avec validation
- Choix du type d'utilisateur (client/entreprise)
- Validation en temps réel des champs
- Intégration avec l'API backend

### Connexion (`/login`)
- Formulaire de connexion sécurisé
- Gestion des erreurs d'authentification
- Lien vers la récupération de mot de passe
- Connexion sociale avec Google

### Mot de passe oublié (`/forgot-password`)
- Demande de réinitialisation par email
- Validation de l'adresse email
- Confirmation de l'envoi

### Tableau de bord (`/dashboard`)
- Interface utilisateur après authentification
- Statistiques et métriques clés
- Actions rapides et navigation
- Activité récente

## 🔧 Installation et configuration

1. **Cloner le repository**
   ```bash
   git clone <repository-url>
   cd arizon
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration de la base de données**
   ```bash
   # Copier le fichier d'environnement
   cp .env.example .env
   
   # Configurer les variables d'environnement
   # DATABASE_URL, JWT_SECRET, etc.
   
   # Générer le client Prisma
   npx prisma generate
   
   # Exécuter les migrations
   npx prisma migrate dev
   ```

4. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

5. **Ouvrir dans le navigateur**
   ```
   http://localhost:3000
   ```

## 🧪 Tests

```bash
# Tests unitaires
npm run test:unit

# Tests d'intégration
npm run test:integration

# Tests avec couverture
npm run test:coverage

# Tests en mode watch
npm run test:watch
```

## 🌱 Seed de données

```bash
# Nettoyer la base de données
npm run seed:clean

# Créer les rôles de base
npm run seed:roles

# Ajouter les modèles d'entreprise
npm run seed:business

# Ajouter les templates
npm run seed:templates

# Ajouter les données de test
npm run seed:data

# Ou tout exécuter en une fois
npm run seed
```

## 📁 Structure du projet

```
src/
├── app/                    # Pages Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Pages d'authentification
│   ├── dashboard/         # Tableau de bord
│   └── globals.css        # Styles globaux
├── components/             # Composants React réutilisables
│   ├── ui/                # Composants UI de base
│   └── auth/              # Composants d'authentification
├── hooks/                  # Hooks React personnalisés
├── lib/                    # Utilitaires et services
│   ├── auth-service.ts    # Service d'authentification
│   ├── prisma.ts          # Client Prisma
│   └── validations.ts     # Schémas de validation
└── scripts/                # Scripts de seed et maintenance
```

## 🔐 Sécurité

- **Validation des données** avec Zod
- **Rate limiting** sur les API sensibles
- **Hachage sécurisé** des mots de passe
- **Sessions JWT** avec expiration
- **CORS** configuré pour la production
- **Middleware** de sécurité centralisé

## 🚀 Déploiement

Le projet est optimisé pour le déploiement sur Vercel :

1. **Build de production**
   ```bash
   npm run build
   ```

2. **Variables d'environnement** à configurer sur Vercel
3. **Base de données** PostgreSQL (recommandé Supabase ou PlanetScale)
4. **Domaine personnalisé** optionnel

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou support :
- Ouvrir une issue sur GitHub
- Contacter l'équipe de développement
- Consulter la documentation technique

---

**Arizon** - Transformons l'agriculture ensemble 🌱
