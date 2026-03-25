# FiKex - Digitaliser l'informel, liberer le financement

Assistant financier IA pour les micro, petites et moyennes entreprises (MPME) du Benin. Application Progressive Web App (PWA) mobile-first concue pour fonctionner dans les conditions reelles du terrain beninois : connectivite intermittente, diversite des appareils, et necessite d'operer en langues locales (Fon, Yoruba, Francais).

> Appel a l'Innovation 2026 - TechnoServe / BeniBiz & EPITECH Benin

## Fonctionnalites

### Triple canal de saisie
- **Voix** : dictez vos transactions en Francais, Fon ou Yoruba. L'IA transcrit et structure automatiquement.
- **Scanner** : photographiez un recu ou une facture. L'OCR extrait les transactions.
- **Saisie manuelle** : formulaire classique avec categories predefinies.

### Intelligence artificielle
- **Transcription vocale** : OpenAI Whisper (Francais) + Meta MMS (Fon/Yoruba)
- **Parsing NLP** : GPT-4.1-nano extrait le type, le montant, la description et la categorie
- **OCR Vision** : GPT-4.1-mini analyse les images de recus/factures
- **Multilangue** : le systeme comprend le Fon, le Yoruba et le Francais

### Mode hors ligne (PWA)
- **Installable** sur l'ecran d'accueil (Android/iOS)
- **IndexedDB** via Dexie.js pour le stockage local des transactions
- **Sync automatique** : les transactions creees hors ligne se synchronisent au retour du reseau
- **Service Worker** via Serwist pour le cache des ressources

### Scoring de solvabilite
Algorithme proprietaire base sur 4 facteurs ponderes :
- Regularite d'enregistrement (40%)
- Volume de revenus (30%)
- Rentabilite (20%)
- Volume de transactions (10%)

### Multi-canal
- **Web/PWA** : application principale avec voix, scanner et saisie manuelle
- **WhatsApp** : envoyez un message texte, vocal ou photo pour enregistrer une transaction
- **USSD** : `*384#` pour les telephones basiques sans internet

## Stack technique

| Domaine | Technologie |
|---------|------------|
| Frontend | Next.js 16, React 19, Tailwind CSS v4 |
| Backend | Next.js API Routes, TypeScript |
| Base de donnees | SQLite + Drizzle ORM |
| Offline/PWA | Serwist (Service Worker), Dexie.js (IndexedDB) |
| STT Vocal | OpenAI Whisper, Meta MMS |
| NLP + OCR | GPT-4.1-nano, GPT-4.1-mini (Vision) |
| Traduction | Meta NLLB-200 (fon_Latn) |
| USSD | Africa's Talking (gateway-agnostic) |
| Charts | Recharts |

## Installation

```bash
# Cloner le repo
git clone https://github.com/Bovisaloukou/fikex.git
cd fikex

# Installer les dependances
pnpm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Remplir OPENAI_API_KEY et HUGGINGFACE_API_TOKEN

# Pousser le schema en base
pnpm db:push

# (Optionnel) Charger les donnees de demo
pnpm db:seed

# Lancer le serveur de developpement
pnpm dev
```

## Scripts

| Commande | Description |
|----------|------------|
| `pnpm dev` | Serveur de developpement (Turbopack) |
| `pnpm build` | Build de production (webpack + Serwist) |
| `pnpm start` | Serveur de production |
| `pnpm lint` | Linter ESLint |
| `pnpm db:push` | Pousser le schema Drizzle en base |
| `pnpm db:seed` | Charger les donnees de demonstration |

## Structure du projet

```
src/
  app/
    login/             # Pages d'authentification (login, register, OTP)
    (main)/
      dashboard/       # Tableau de bord principal
      transactions/    # Journal des transactions
      passport/        # Passeport financier (scoring)
      profil/          # Profil de l'entreprise
      api/             # Routes API (WhatsApp, USSD, AI, transactions)
  components/          # Composants UI reutilisables
  lib/                 # Logique metier (AI, sync offline, auth, DB locale)
  server/
    actions/           # Server actions (CRUD, stats, scoring)
    db/                # Schema Drizzle + connexion SQLite
```

## Variables d'environnement

| Variable | Description |
|----------|------------|
| `OPENAI_API_KEY` | Cle API OpenAI (Whisper + GPT) |
| `HUGGINGFACE_API_TOKEN` | Token HuggingFace (Meta MMS) |
| `MMS_ENDPOINT_URL` | URL de l'endpoint MMS dedie (optionnel) |
| `AFRICASTALKING_API_KEY` | Cle API Africa's Talking (USSD) |
| `WHATSAPP_ACCESS_TOKEN` | Token d'acces WhatsApp Business API |
| `WHATSAPP_PHONE_NUMBER_ID` | ID du numero WhatsApp |
| `WHATSAPP_VERIFY_TOKEN` | Token de verification webhook |

## Equipe

Projet developpe par l'equipe FiKex :
- **Laurien FAGNINOU**
- **Giovanni SOKENOU**
- **Bovis ALOUKOU**

Mars 2026 - EPITECH Benin
