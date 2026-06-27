# nearish mobile

**nearish mobile** is the iOS companion to the nearish web app — a long-distance couples travel and memory-planning app designed to make shared experiences more intentional and meaningful.

It gives couples a space to plan visits, count down to seeing each other, organize daily activities, save memories with photos or videos, and keep shared wishlists — on iPhone.

This project is currently under active development.

## Setup

See `backend/.env.example` and `frontend/.env.example` templates and fill in real `.env` files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

`frontend/.env` needs Firebase config, Google OAuth client IDs (bundle ID: `com.nearish.mobile`), and `EXPO_PUBLIC_API_URL`.

## Development

Start the API and database with Docker. The Expo app runs locally on your machine or in the iOS Simulator.

```bash
docker compose -f compose.mobile.yaml up --build -d
docker compose -f compose.mobile.yaml exec backend python init_db.py
```

API: `http://localhost:8000`

Then install and start the mobile app:

```bash
cd frontend
npm install
npm start
# Press i to open in the iOS Simulator
```

**Simulator:** set `EXPO_PUBLIC_API_URL=http://localhost:8000`

**Physical device:** set `EXPO_PUBLIC_API_URL=http://<your-machine-ip>:8000` (find your IP with `ifconfig | grep "inet " | grep -v 127`)

## Features

**Google Authentication (Firebase Auth)**

- Secure, passwordless sign-in via Google
- Private, couple-only access
- Session persisted on device via AsyncStorage

**Couple Connection**

- Create or join a couple using a short invite code
- Guided onboarding flow (name → create or join)

**Visit Planning**

- Plan upcoming visits with start/end dates
- Automatic visit status (planned, active, complete)
- Countdown-focused home dashboard

**Daily Schedules**

- View day-by-day activity schedules per visit
- Schedule builder and editor (planned)

**Activities Library** *(planned)*

- Save reusable activities by category
- Get random activity suggestions
- Mix saved activities into visit schedules

**Memories** *(planned)*

- Save notes with optional photos or videos
- Media stored securely in AWS S3
- Memories tied to visits and sorted by recency

**Wishlists** *(planned)*

- Separate personal and partner wishlists
- Fulfillment tracking

## Tech Stack

### Mobile app

- React Native
- Expo SDK 54
- TypeScript
- Expo Router
- NativeWind
- Zustand
- Firebase Authentication

### Backend

- FastAPI
- PostgreSQL
- Firebase Admin SDK
- AWS S3 *(planned — memories media)*

### Design

Figma Prototype:
https://www.figma.com/design/j6v6r3BGDCvw9iIf1iSzXt/Untitled

## API Overview

The backend exposes REST endpoints for:

- Authentication & couple connection
- Home dashboard state
- Visits & schedules
- Activities
- Memories & media uploads
- Wishlists

Authentication is handled via Firebase ID tokens, sent on API requests using the `Authorization` header with the `Bearer` scheme (the raw Firebase ID token as the bearer value).

The mobile app currently uses:

| Area | Endpoints |
|---|---|
| Auth | `GET /auth/me`, `PATCH /auth/update-name`, `GET /auth/create-code`, `POST /auth/join-couple` |
| Home | `GET /home` |
| Visits | `GET /visits`, `POST /visits`, `DELETE /visits/:id`, `GET /visits/:id/schedule`, `PATCH /visits/:id/schedule` |
