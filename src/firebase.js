import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

// Use Vite env variables: VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, etc.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

let app = null
let auth = null
let isConfigured = true

// Quick check for required keys
const required = [firebaseConfig.apiKey, firebaseConfig.projectId, firebaseConfig.appId]
if (!required.every(Boolean)) {
  // Not configured: avoid calling initializeApp / getAuth which will throw in the client
  console.warn('Firebase not configured (missing VITE_FIREBASE_* env vars). Auth features will be disabled.')
  isConfigured = false
} else {
  try {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
  } catch (e) {
    console.warn('Failed to initialize Firebase:', e)
    // Don't rethrow — allow app to continue without Firebase
    app = null
    auth = null
    isConfigured = false
  }
}

export { isConfigured }
export { auth }
export default app
