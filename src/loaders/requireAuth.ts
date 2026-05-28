import { redirect } from 'react-router-dom'
import { validateSessionWithFirestore } from '../auth/session'

export async function requireAuthLoader() {
  const ok = await validateSessionWithFirestore()
  if (!ok) {
    throw redirect('/')
  }
  return null
}
