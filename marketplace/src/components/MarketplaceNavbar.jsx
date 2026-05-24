import { NavLink, Link } from 'react-router-dom'
import { navigationLinks } from '../data/listings.js'

function MarketplaceNavbar() {
  return (
    <header className="marketplace-navbar">
      <nav className="navbar navbar-expand-lg navbar-light">
        <div className="container py-3">
          <Link className="brand-mark text-decoration-none" to="/">
            <span className="brand-mark__badge" aria-hidden="true"></span>
            <span>Market Place</span>
          </Link>

          <button
            className="navbar-toggler border-0 shadow-none"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#marketplaceNavbar"
            aria-controls="marketplaceNavbar"
            aria-expanded="false"
            aria-label="Alternar navegacion"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse justify-content-end" id="marketplaceNavbar">
            <div className="navbar-nav align-items-lg-center gap-2 mt-3 mt-lg-0">
              {navigationLinks.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) => `nav-pill${isActive ? ' active' : ''}`}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default MarketplaceNavbar