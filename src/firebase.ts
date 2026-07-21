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

  const nameKey = bookingNameKey(booking.guestName)
  if (!nameKey) {
    throw new Error('Guest name is required')
  }

  await setDoc(
    doc(firestore, 'booking', nameKey),
    {
      ...booking,
      updatedAt: serverTimestamp(),
    },
    { merge: false },
  )
}

function parseBooking(data: Record<string, unknown>): BookingData | null {
  const guestName = String(data.guestName ?? '').trim()
  const city = String(data.city ?? '').trim()
  const date = String(data.date ?? '').trim()
  const activity = String(data.activity ?? '').trim()
  const locale = String(data.locale ?? '').trim()

  if (!guestName || !city || !date || !activity) return null
  if (date.length !== 10) return null
  if (locale !== 'nl' && locale !== 'en') return null

  return { guestName, city, date, activity, locale }
}

/** Firestore doc id for a guest booking (must match security rules). */
export function bookingNameKey(name: string): string {
  return name.trim().toLowerCase()
}

export async function fetchBooking(
  guestName: string,
): Promise<BookingData | null> {
  const firestore = getDb()
  if (!firestore) return null

  const nameKey = bookingNameKey(guestName)
  if (!nameKey) return null

  const snap = await getDoc(doc(firestore, 'booking', nameKey))
  if (!snap.exists()) return null

  return parseBooking(snap.data() as Record<string, unknown>)
}

export function namesMatch(entered: string, expected: string): boolean {
  return bookingNameKey(entered) === bookingNameKey(expected)
}
