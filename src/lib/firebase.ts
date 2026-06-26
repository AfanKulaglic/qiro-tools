import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getDatabase, type Database } from 'firebase/database'

/**
 * Firebase: Realtime Database + Authentication.
 * Web config values are public by design (security is enforced by Auth + RTDB
 * rules, not by hiding these keys). Env vars override the baked-in defaults so
 * the same build can target a different project.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDPhuF0retdom3ofiwj-PsfrKEcQoMJE3o',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'qiro-a23a4.firebaseapp.com',
  databaseURL:
    import.meta.env.VITE_FIREBASE_DATABASE_URL ||
    'https://qiro-a23a4-default-rtdb.firebaseio.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'qiro-a23a4',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'qiro-a23a4.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '520643138759',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:520643138759:web:71eef26411758073b09ae2',
}

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.databaseURL)

let app: FirebaseApp | undefined
let authInstance: Auth | undefined
let dbInstance: Database | undefined

export function getFirebaseApp(): FirebaseApp {
  if (!app) app = initializeApp(firebaseConfig)
  return app
}

export function getAuthClient(): Auth {
  if (!authInstance) authInstance = getAuth(getFirebaseApp())
  return authInstance
}

/** Realtime Database instance. */
export function getDb(): Database {
  if (!dbInstance) dbInstance = getDatabase(getFirebaseApp())
  return dbInstance
}

// Eager singletons for convenience in components/hooks.
export const auth = getAuthClient()
export const db = getDb()
