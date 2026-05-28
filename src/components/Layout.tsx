import { Outlet, useLocation } from 'react-router-dom'
import { FloatingHearts } from './FloatingHearts'
import { FloatingQuestions } from './FloatingQuestions'
import { LanguageSwitcher } from './LanguageSwitcher'

function isGatePath(pathname: string): boolean {
  const path = pathname.replace(/\/$/, '') || '/'
  return path === '/'
}

export function Layout() {
  const { pathname } = useLocation()
  const isGate = isGatePath(pathname)

  return (
    <div className={`app-shell${isGate ? ' app-shell--gate' : ''}`}>
      {isGate ? <FloatingQuestions /> : <FloatingHearts />}
      <header className="app-header">
        <LanguageSwitcher />
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
