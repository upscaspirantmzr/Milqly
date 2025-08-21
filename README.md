# KsheerFresh – Vanilla JS + Firebase Portal

Multi-page portal using **HTML + Tailwind + Vanilla JS** with **Firebase** backend, designed for **GitHub Pages** (frontend) and **Firebase Free Tier**.

## Files
- `index.html` – Landing page
- `signup.html` – Sign up / Log in (role-based redirect)
- `user-dashboard.html` – Customer dashboard
- `farmer-dashboard.html` – Farmer dashboard
- `admin-panel.html` – Admin dashboard
- `firebase-config.js` – Your Firebase keys (same folder)
- `app-init.js` – Initializes Firebase and exports `auth`, `db`
- `auth.js`, `user.js`, `farmer.js`, `admin.js` – Page logic
- `firestore.rules` – Basic Firestore security rules

## Quick Start
1. Create a Firebase project → Enable **Authentication** (Email/Password, Google optional) and **Firestore** (in **Test mode** just for initial testing).
2. Copy your Firebase config into `firebase-config.js` (replace placeholders).
3. Open `index.html` locally or host the folder on **GitHub Pages**.
4. Update **Firestore Rules** from `firestore.rules` once you have users.

## Role-based Redirects
- `customer` → `user-dashboard.html`
- `farmer` → `farmer-dashboard.html`
- `admin` → `admin-panel.html`

> Tip: Create the first admin by signing up, then in Firestore set `users/{uid}.role = "admin"`.
