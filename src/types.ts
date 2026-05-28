export interface LocalizedOption {
  id: string
  labels: Record<string, string>
}

export interface CityOption extends LocalizedOption {
  activities: LocalizedOption[]
}

export interface BookingData {
  guestName: string
  city: string
  date: string
  activity: string
  locale: string
}

export interface AppSettings {
  expectedName: string
  blockedDates: string[]
  cities: CityOption[]
  surpriseEnabled: boolean
}

export const VERIFIED_KEY = 'dateInviteVerified'
export const GUEST_NAME_KEY = 'dateInviteGuestName'
