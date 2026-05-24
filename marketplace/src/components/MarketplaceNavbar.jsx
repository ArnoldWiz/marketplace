import { NavLink, Link } from 'react-router-dom'
import { navigationLinks } from '../data/listings.js'
import { useAuth } from '../context/AuthContext.jsx'

function MarketplaceNavbar() {
  const { user, isLoading, signOut } = useAuth()
  const userInitial = user?.username?.charAt(0)?.toUpperCase() ?? '?'

  return (
    <header className="site-header">
      <div className="container header-row">
        <Link className="brand text-decoration-none" to="/">
          MarketPlace
        </Link>

        <nav className="site-nav">
          <div className="site-nav-links">
            {navigationLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) => `site-nav-link${isActive ? ' active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="site-nav-auth">
            {!isLoading && user ? (
              <>
                <span className="site-nav-avatar" aria-hidden="true">
                  {userInitial}
                </span>
                <span className="site-nav-user">{user.username}</span>
                <button type="button" className="btn" onClick={signOut}>
                  Cerrar sesion
                </button>
              </>
            ) : (
              <Link className="btn" to="/login">
                Iniciar sesion
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}

export default MarketplaceNavbar