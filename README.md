# Property Rental System Frontend

React + Vite customer website for the Property Rental System. The backend is a separate NestJS repository and all data access goes through HTTP API calls.

## Setup

```bash
npm install
npm run start
```

The app runs on `http://127.0.0.1:3002` by default.

## Environment

Use `.env.example` as the template:

```bash
VITE_API_URL=http://localhost:3000
```

Keep the real `.env` local and out of commits.

## Routes

- `/` public property search and filters
- `/login` login form
- `/signup` registration form
- `/properties/:id` public property details, booking form, and reviews
- `/properties/:id` also shows blocked availability ranges, cancellation policy, and house rules
- `/my-bookings` customer bookings, payment actions, guest details, and invoice viewing
- `/notifications` logged-in user notifications with mark-read actions
- `/dashboard` authenticated dashboard entry
- `/admin`, `/business/operations`, `/business/reviews` tenant admin management panel
- `/platform/tenant-management` SuperAdmin tenant management and search history

## API Integration

The frontend calls the backend endpoints in `src/services/api.js`, including auth, public search, property details, bookings, booking guests, availability blocks, property rules, cancellation policies, invoices, notifications, payments, favorites, and reviews. Auth state is shared through `src/context/AuthContext.jsx`.

The AI assistant UI calls the backend AI endpoint. It depends on the backend running and the backend being able to reach a local Ollama server, for example with `OLLAMA_BASE_URL=http://localhost:11434` and the `llama3.2` model pulled locally.

## Build

```bash
npm run build
```

## CI/CD Status

Frontend CI is defined in `.github/workflows/ci.yml`. It installs dependencies and runs the production Vite build. No real frontend deployment pipeline is currently implemented in this repository; deployment remains future work.

## Collaboration Workflow

Use GitHub Projects or Jira for requirements, issues, and subissues. Create feature branches, open pull requests, link the issue, include build/test evidence, and request review before merging. Do not commit local `.env` files or rewrite shared history.
