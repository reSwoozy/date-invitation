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

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ text }),
  })

  if (!response.ok) {
    throw new Error(`Telegram webhook failed: ${response.status}`)
  }
}
