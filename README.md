# Budget Tracker

Application mobile de suivi de budget personnel, construite avec **Ionic + Angular + Capacitor**. Créez vos catégories de dépenses avec leur budget mensuel, enregistrez vos dépenses au fil du mois, et suivez où passe votre argent — le tout stocké en local sur l'appareil.

## Fonctionnalités

- **Dashboard mensuel** — vue d'ensemble du budget total, du montant dépensé et du reste à dépenser, avec un indicateur visuel selon que vous êtes dans les clous ou en dépassement.
- **Catégories personnalisables** — créez, modifiez (nom, icône, couleur, budget) ou supprimez vos propres catégories, chacune avec une jauge de progression circulaire.
- **Suivi des dépenses** — ajoutez une dépense en choisissant sa catégorie ; les montants peuvent être négatifs pour corriger une erreur de saisie.
- **Historique par mois** — l'onglet Transactions liste les dépenses du mois sélectionné, synchronisé avec le dashboard.
- **Statistiques** — répartition des dépenses par catégorie sous forme de donut chart.
- **Reconduction automatique des mois** — chaque nouveau mois reprend les catégories/budgets du mois précédent, remet les dépenses à zéro, et respecte les catégories supprimées (elles restent visibles dans l'historique passé).
- **Thème clair / sombre** — bascule manuelle, mémorisée entre les sessions.
- **100% hors-ligne** — toutes les données sont stockées localement (`localStorage` côté web, adaptable en base native via Capacitor).

## Stack technique

- [Angular 20](https://angular.dev/) (modules classiques, pas de composants standalone)
- [Ionic 8](https://ionicframework.com/) pour l'UI mobile
- [Capacitor 7](https://capacitorjs.com/) pour l'empaquetage natif (Android / iOS)
- [Vitest](https://vitest.dev/) comme test runner (`ng test`)
- TypeScript strict, ESLint

## Prérequis

- Node.js 20+
- npm

## Installation

```bash
npm install
```

## Lancer en local (navigateur)

```bash
npm start
```

L'application est servie sur [http://localhost:4200](http://localhost:4200) avec rechargement à chaud.

## Tests

```bash
npm test
```

## Build web de production

```bash
npm run build
```

Les fichiers statiques sont générés dans `www/`.

## Générer une APK Android

Le projet Android n'est pas versionné (généré à la demande). Prérequis : JDK 21, [Android SDK command-line tools](https://developer.android.com/studio#command-tools).

```bash
npm run build
npx cap add android      # première fois seulement
npx cap sync android
cd android
./gradlew assembleDebug
```

L'APK debug se trouve dans `android/app/build/outputs/apk/debug/app-debug.apk`.

## Installer sur iOS

Nécessite un Mac avec Xcode installé.

```bash
npm run build
npx cap add ios          # première fois seulement
npx cap sync ios
npx cap open ios
```

Puis lancez le build depuis Xcode sur un simulateur ou un appareil branché.

## Structure du projet

```
src/app/
├── core/
│   ├── models/         # Interfaces de données (Category, Expense, Month, ...)
│   ├── repositories/   # Accès CRUD générique par-dessus le stockage local
│   ├── services/       # Logique métier (dashboard, mois, catégories, thème, ...)
│   └── utils/          # Fonctions pures (calculs de budget, formatage, dates)
├── shared/
│   ├── components/     # Composants réutilisables (jauge circulaire, formulaires modaux, ...)
│   └── pipes/          # Pipes (formatage devise)
├── tabs/                # Coquille de navigation par onglets
└── features/
    ├── dashboard/       # Écran d'accueil
    ├── transactions/    # Historique des dépenses
    ├── stats/           # Statistiques par catégorie
    └── more/            # Section additionnelle
```

## Licence

Projet personnel — usage privé.
