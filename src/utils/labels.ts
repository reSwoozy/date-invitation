import type { LocalizedOption } from '../types'

export function localeKey(language: string): string {
  return language.startsWith('en') ? 'en' : 'nl'
}

export function optionLabel(
  option: LocalizedOption,
  language: string,
): string {
  const key = localeKey(language)
  return option.labels[key] ?? option.labels.en ?? option.labels.nl ?? option.id
}

export function findOption(
  options: LocalizedOption[],
  id: string,
): LocalizedOption | undefined {
  return options.find((o) => o.id === id)
}

export function findOptionLabel(
  options: LocalizedOption[],
  id: string,
  language: string,
): string {
  const option = findOption(options, id)
  return option ? optionLabel(option, language) : id
}

/** Telegram messages use Russian labels when provided in Firestore. */
export function optionLabelRu(option: LocalizedOption): string {
  return option.labels.ru ?? option.labels.en ?? option.labels.nl ?? option.id
}
