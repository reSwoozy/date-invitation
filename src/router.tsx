import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { Layout } from './components/Layout'
import { PageSpinner } from './components/PageSpinner'
import { requireAuthLoader } from './loaders/requireAuth'

const GatePage = lazy(() =>
  import('./pages/GatePage').then((m) => ({ default: m.GatePage })),
)
const AskPage = lazy(() =>
  import('./pages/AskPage').then((m) => ({ default: m.AskPage })),
)
const CelebratePage = lazy(() =>
  import('./pages/CelebratePage').then((m) => ({ default: m.CelebratePage })),
)
const PlanPage = lazy(() =>
  import('./pages/PlanPage').then((m) => ({ default: m.PlanPage })),
)
const DonePage = lazy(() =>
  import('./pages/DonePage').then((m) => ({ default: m.DonePage })),
)

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined

function LazyPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageSpinner />}>{children}</Suspense>
}

export const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      children: [
        {
          index: true,
          element: (
            <LazyPage>
              <GatePage />
            </LazyPage>
          ),
        },
        {
          loader: requireAuthLoader,
          element: <Outlet />,
          children: [
            {
              path: 'ask',
              element: (
                <LazyPage>
                  <AskPage />
                </LazyPage>
              ),
            },
            {
              path: 'celebrate',
              element: (
                <LazyPage>
                  <CelebratePage />
                </LazyPage>
              ),
            },
            {
              path: 'plan',
              element: (
                <LazyPage>
                  <PlanPage />
                </LazyPage>
              ),
            },
            {
              path: 'done',
              element: (
                <LazyPage>
                  <DonePage />
                </LazyPage>
              ),
            },
          ],
        },
        { path: '*', element: <Navigate to="/" replace /> },
      ],
    },
  ],
  { basename },
)
