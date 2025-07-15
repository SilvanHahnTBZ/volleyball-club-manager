# 🏐 Volleyball Club Manager – Web App

Dies ist meine selbst entwickelte Webanwendung zur Verwaltung eines Volleyballvereins. Sie unterstützt die digitale Organisation von Trainings, Spielen, Helfereinsätzen und Teamkommunikation – alles in einer modernen, responsiven Plattform.

---

## 🌟 Hauptfunktionen

- Rollenbasierte Benutzerverwaltung: Admin, Trainer, Spieler, Eltern
- Teamübersicht und -verwaltung
- Zentrale & persönliche Kalender
- An-/Abmeldungen für Events (Training, Spiel, Turniere)
- Organisation von Helfereinsätzen
- Google Maps Verlinkung für Eventorte
- Datei- und Medien-Uploads (z. B. PDFs, Fotos)
- Statistiken zu Anwesenheiten & Einsätzen
- Mobile-optimiert & ausbaufähig

---

## 🔐 Authentifizierung & Datenbank

Für Authentifizierung und Datenhaltung kommt **Supabase** zum Einsatz:

- **Google Auth** (OAuth 2.0)
- E-Mail/Passwort Login
- Benutzerprofile mit Rollenlogik
- PostgreSQL-basierte Datenbank
- Echtzeit-Updates & API-Zugriff

---

## 🧰 Verwendete Technologien

Die Anwendung basiert auf einem modernen Tech-Stack:

- **Vite** – ultraschneller Build & Dev-Server
- **TypeScript** – typensichere Entwicklung
- **React** – Frontend-Framework
- **shadcn/ui** – UI-Komponentenbibliothek
- **Tailwind CSS** – flexibles Utility-First CSS
- **Supabase** – Backend-as-a-Service (Auth & DB)

---

## 🚀 Lokale Entwicklung

### Voraussetzungen

- Node.js & npm installiert  
  → Empfehlung: [NVM installieren](https://github.com/nvm-sh/nvm#installing-and-updating)

### Setup-Schritte

```sh
# 1. Repository klonen
git clone <DEIN_GIT_REPO_URL>

# 2. In das Projektverzeichnis wechseln
cd volleyball-club-manager

# 3. Abhängigkeiten installieren
npm install

# 4. Entwicklungsserver starten
npm run dev
```

Die App läuft standardmäßig auf [http://localhost:5173](http://localhost:5173).

---

## ✍️ Projekt bearbeiten

### Variante 1 – Lokaler Editor

- Öffne das Projekt in VS Code oder deinem Lieblingseditor.
- Änderungen vornehmen, committen, pushen.

### Variante 2 – GitHub direkt

- Zur Datei navigieren
- ✏️ Symbol ("Edit") klicken
- Änderungen speichern und committen

### Variante 3 – GitHub Codespaces

- Auf „Code“ > „Codespaces“ klicken
- Neue Codespace-Instanz starten
- Projekt direkt im Browser bearbeiten

---

## 🌍 Deployment

Diese App kann auf folgenden Plattformen gehostet werden:

- **Vercel** (empfohlen – CI/CD integriert)
- **Netlify**
- **Firebase Hosting**
- **GitHub Pages** (statische Varianten)

Für Supabase: Die Supabase-Keys werden über Umgebungsvariablen eingebunden (`.env` Datei).

---

## 👨‍💻 Über mich

Ich bin Softwareentwickler und Volleyballspieler – dieses Projekt habe ich selbstständig umgesetzt, um den Vereinsalltag effizienter zu gestalten.  
Dabei habe ich sowohl Frontend- als auch Backendprozesse entworfen, React-Komponenten entwickelt und die gesamte Benutzerlogik mit Supabase realisiert.

Ich interessiere mich auch für Machine Learning und KI und plane, langfristig z. B. automatische Spielanalysen oder Helferplan-Vorschläge zu integrieren.

---

## 📬 Kontakt

**E-Mail:** deine.email@example.com  
**GitHub:** [https://github.com/deinBenutzername](https://github.com/deinBenutzername)  
**LinkedIn:** [https://linkedin.com/in/deinProfil](https://linkedin.com/in/deinProfil)

---

*Dieses Projekt ist Open Source und darf gerne erweitert oder für andere Sportarten adaptiert werden.*
