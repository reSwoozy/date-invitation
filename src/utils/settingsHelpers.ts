import type { AppSettings, CityOption, LocalizedOption } from '../types'
import { findOptionLabel, optionLabelRu } from './labels'

export function getCity(
  settings: AppSettings,
  cityId: string,
): CityOption | undefined {
  return settings.cities.find((c) => c.id === cityId)
}

export function getCityActivities(
  settings: AppSettings,
  cityId: string,
): LocalizedOption[] {
  return getCity(settings, cityId)?.activities ?? []
}

export function findCityActivityLabel(
  settings: AppSettings,
  cityId: string,
  activityId: string,
  language: string,
): string {
  return findOptionLabel(getCityActivities(settings, cityId), activityId, language)
}

export function findCityActivityLabelRu(
  settings: AppSettings,
  cityId: string,
  activityId: string,
): string {
  const activity = getCityActivities(settings, cityId).find(
    (a) => a.id === activityId,
  )
  return activity ? optionLabelRu(activity) : activityId
}
