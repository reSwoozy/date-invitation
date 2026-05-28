import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { BookingProvider } from './context/BookingContext'
import { SettingsProvider } from './context/SettingsContext'
import './i18n'
import './index.css'
import { router } from './router'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SettingsProvider>
      <BookingProvider>
        <RouterProvider router={router} />
      </BookingProvider>
    </SettingsProvider>
  </StrictMode>,
)
