import { useEffect, useMemo, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import type { Locale } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { CalendarSkeleton } from './CalendarSkeleton'
import {
  formatDateForDisplay,
  isDayDisabled,
  parseIsoDate,
  startOfToday,
  toIsoDate,
} from '../utils/dates'
import 'react-day-picker/style.css'

interface DatePickerProps {
  date: string
  blockedDates: string[]
  disabled?: boolean
  dateError?: string | null
  onDateChange: (date: string) => void
}

function loadDateFnsLocale(language: string): Promise<Locale> {
  return language.startsWith('en')
    ? import('date-fns/locale/en-GB').then((m) => m.enGB)
    : import('date-fns/locale/nl').then((m) => m.nl)
}

export function DatePicker({
  date,
  blockedDates,
  disabled,
  dateError,
  onDateChange,
}: DatePickerProps) {
  const { t, i18n } = useTranslation()
  const [locale, setLocale] = useState<Locale | null>(null)
  const displayLocale = i18n.language.startsWith('en') ? 'en' : 'nl'
  const selected = date ? parseIsoDate(date) : undefined
  const today = startOfToday()

  const minMonth = useMemo(() => {
    const start = new Date(today)
    start.setMonth(start.getMonth() - 3)
    start.setDate(1)
    return start
  }, [today])

  const maxDate = useMemo(() => {
    const end = new Date(today)
    end.setMonth(end.getMonth() + 4)
    return end
  }, [today])

  useEffect(() => {
    let cancelled = false
    setLocale(null)
    void loadDateFnsLocale(i18n.language).then((loc) => {
      if (!cancelled) setLocale(loc)
    })
    return () => {
      cancelled = true
    }
  }, [i18n.language])

  const handleSelect = (day: Date | undefined) => {
    if (!day || disabled) {
      onDateChange('')
      return
    }
    if (isDayDisabled(day, blockedDates)) return
    onDateChange(toIsoDate(day))
  }

  if (!locale) {
    return <CalendarSkeleton />
  }

  return (
    <div className="date-picker">
      <p className="section-label">{t('plan.pickDate')}</p>
      <div className="date-picker-card">
        <DayPicker
          mode="single"
          locale={locale}
          weekStartsOn={1}
          navLayout="around"
          selected={selected}
          onSelect={handleSelect}
          disabled={disabled ? true : (day) => isDayDisabled(day, blockedDates)}
          defaultMonth={today}
          startMonth={minMonth}
          endMonth={maxDate}
          showOutsideDays={false}
          fixedWeeks
          className="invite-calendar"
        />
      </div>
      {date && (
        <p className="date-picker-selected">
          {t('plan.dateSelected', {
            date: formatDateForDisplay(date, displayLocale),
          })}
        </p>
      )}
      <p className="date-picker-legend">{t('plan.calendarLegend')}</p>
      {dateError && <p className="field-error">{dateError}</p>}
    </div>
  )
}
