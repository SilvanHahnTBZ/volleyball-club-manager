# Volleyball Club Manager – Web App

This is a self-developed web application for managing a volleyball club. It provides a modern and responsive interface for organizing teams, scheduling events, coordinating volunteers, and managing user roles.

## Key Features

- Role-based user management: Admin, Coach, Player, Parent
- Team overview and administration
- Central and personal calendars
- RSVP for events (trainings, matches, tournaments)
- Volunteer shift coordination
- Google Maps integration for event locations
- File and media uploads (e.g. PDFs, images)
- Attendance and participation statistics
- Mobile-optimized and scalable

## Authentication and Backend

This project uses Supabase for authentication and backend services:

- Google Auth (OAuth 2.0)
- Email and password login
- User profile management with role logic
- PostgreSQL database
- Real-time updates and RESTful API

## Tech Stack

The application is built using the following technologies:

- Vite
- TypeScript
- React
- shadcn/ui
- Tailwind CSS
- Supabase

## Getting Started (Local Development)

### Prerequisites

- Node.js and npm installed  
  Recommended: [Install via NVM](https://github.com/nvm-sh/nvm#installing-and-updating)

### Setup Instructions

```sh
# Clone the repository
git clone <YOUR_GIT_REPOSITORY_URL>

# Navigate into the project directory
cd volleyball-club-manager

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at http://localhost:5173.

## Editing the Project

### Option 1 – Local IDE

Clone the repository, open it in your preferred code editor (e.g. VS Code), make changes, commit, and push.

### Option 2 – GitHub Web Editor

1. Open the file in the GitHub repository
2. Click the "Edit" button
3. Make changes and commit them directly

### Option 3 – GitHub Codespaces

1. Go to the repository's main page
2. Click on "Code" > "Codespaces"
3. Launch a new Codespace
4. Edit and commit changes in the browser

## Deployment

This project can be deployed using any of the following platforms:

- Vercel (recommended)
- Netlify
- Firebase Hosting
- GitHub Pages (for static builds)

Environment variables for Supabase should be defined in a `.env` file.

## About Me

I am a software developer and volleyball player. I created this application to streamline club management and communication. I implemented both frontend and backend logic using React and Supabase, including secure authentication and role-based access control.

I am also interested in machine learning and artificial intelligence and plan to integrate smart features like game analytics or automated volunteer scheduling in future versions.

## Contact

Email: hahn.silvan@gmx.ch

This project is open source and can be adapted or extended for other sports clubs.
