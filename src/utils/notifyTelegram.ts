import type { AppSettings, BookingData } from '../types'
import { findOption, optionLabelRu } from './labels'
import { formatDateForTelegram } from './dates'
import {
  findCityActivityLabelRu,
} from './settingsHelpers'

export function canNotifyTelegram(): boolean {
  return Boolean(import.meta.env.VITE_TELEGRAM_WEBHOOK_URL)
}

export async function notifyTelegram(
  booking: BookingData,
  settings: AppSettings,
): Promise<void> {
  const url = import.meta.env.VITE_TELEGRAM_WEBHOOK_URL
  if (!url) return

  const cityOption = findOption(settings.cities, booking.city)
  const cityLabel = cityOption ? optionLabelRu(cityOption) : booking.city
  const activityLabel = findCityActivityLabelRu(
    settings,
    booking.city,
    booking.activity,
  )
  const dateLabel = formatDateForTelegram(booking.date)

  const text = [
    '💕 Приглашение на свидание принято! 💕',
    '',
    `Гость: ${booking.guestName}`,
    `Город: ${cityLabel}`,
    `Дата: ${dateLabel}`,
    `План: ${activityLabel}`,
  ].join('\n')

  const payload: { text: string; secret?: string } = { text }
  const secret = import.meta.env.VITE_TELEGRAM_WEBHOOK_SECRET
  if (secret) payload.secret = secret

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  })

  let result: { ok?: boolean; error?: string } | null = null
  try {
    result = (await response.json()) as { ok?: boolean; error?: string }
  } catch {
    /* non-JSON body */
  }

  if (!response.ok || result?.ok === false) {
    const detail = result?.error ?? String(response.status)
    throw new Error(`Telegram webhook failed: ${detail}`)
  }
}
