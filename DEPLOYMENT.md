Frontend (Vercel) — quick setup

1) Set Vercel project
- Create a Vercel project for `Eatventory-Frontend`.
- Link your Git repository and choose the `main` branch.

2) Add environment variables
- In Vercel dashboard for the frontend project, open Settings → Environment Variables
- Add the API base URL (production):
  - Key: VITE_API_URL
  - Value: https://eatventory-backend.vercel.app  (replace with your backend URL)
- Optional: add staging/preview values for preview deployments.

3) Deploy
- Push to `main` (or open a PR for preview). Vercel will build and use the injected env var.
- Your frontend code should call fetch(`${import.meta.env.VITE_API_URL}/...`).

Backend (Vercel) — quick setup

1) Create Vercel project
- Create a new Vercel project for `Eatventory-Backend` and link it to the backend repository.

2) Add required environment variables
- In Vercel dashboard for the backend project, open Settings → Environment Variables
- Add these (example names):
  - BACKEND_ALLOWED_ORIGINS = https://eatventory-frontend.vercel.app
  - GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT (see your firebase setup)
  - Any other secrets your backend expects (e.g., FIREBASE_PROJECT_ID)

3) Configure CORS
- The backend reads `BACKEND_ALLOWED_ORIGINS` (comma-separated) to allow requests from your frontend origin(s).

4) Deploy
- Push to `main` or create a preview deployment and confirm build logs.

Optional: Link preview deployments automatically (recommended)

- If you want every frontend preview to talk to its corresponding backend preview automatically, use Vercel's Related Projects feature.
- Install `@vercel/related-projects` in the frontend project and follow their docs to link the projects.

Notes
- For local development keep using `http://127.0.0.1:8000` as your backend URL.
- After deploying, test the dashboard and sales flows in a production preview and ensure CORS and Auth (Firebase) work as expected.
