import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface Props {
  children: React.ReactNode
}

export function Layout({ children }: Props) {
  const { signOut } = useAuth()

  return (
    <div className="app-layout">
      <nav className="navbar pixel-border">
        <div className="nav-brand">AlwaysUp</div>
        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Profile
          </NavLink>
          <NavLink to="/actions" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Today
          </NavLink>
          <NavLink to="/trophies" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Trophies
          </NavLink>
          <NavLink to="/admin" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Admin
          </NavLink>
        </div>
        <button className="nav-logout pixel-btn-small" onClick={signOut}>
          Logout
        </button>
      </nav>
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
