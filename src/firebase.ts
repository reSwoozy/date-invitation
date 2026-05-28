import { initializeApp } from 'firebase/app'
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  type Firestore,
  getFirestore,
} from 'firebase/firestore'
import type { BookingData } from './types'
import { parseAppSettings } from './utils/parseSettings'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

function hasFirebaseConfig(): boolean {
  return Boolean(
    import.meta.env.VITE_FIREBASE_API_KEY &&
      import.meta.env.VITE_FIREBASE_PROJECT_ID,
  )
}

let db: Firestore | null = null

export function getDb(): Firestore | null {
  if (!hasFirebaseConfig()) return null
  if (!db) {
    const app = initializeApp(firebaseConfig)
    db = getFirestore(app)
  }
  return db
}

export async function fetchSettings() {
  const firestore = getDb()
  if (!firestore) return null

  const snap = await getDoc(doc(firestore, 'settings', 'main'))
  if (!snap.exists()) return null

  return parseAppSettings(snap.data() as Record<string, unknown>)
}

export async function saveBooking(booking: BookingData): Promise<void> {
  const firestore = getDb()
  if (!firestore) {
    throw new Error('Firebase is not configured')
  }

  // Always overwrites the single booking/current document (no duplicate records)
  await setDoc(
    doc(firestore, 'booking', 'current'),
    {
      ...booking,
      updatedAt: serverTimestamp(),
    },
    { merge: false },
  )
}

export function namesMatch(entered: string, expected: string): boolean {
  return entered.trim().toLowerCase() === expected.trim().toLowerCase()
}
