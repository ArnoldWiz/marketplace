import { Link } from 'react-router-dom'
import { marketplaceMenu, quickFilters } from '../data/listings.js'

function SidebarFilters() {
  return (
    <aside className="sidebar">
      <div>
        <h2>Explorar</h2>
        <nav className="menu">
          {marketplaceMenu.map((item) => (
            <Link key={item.label} to={item.to}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="filtros">
        <h3>Filtros</h3>
        <div>
          {quickFilters.map((filter) => (
            <span key={filter} className="chip">
              {filter}
            </span>
          ))}
        </div>
      </div>
    </aside>
  )
}

export default SidebarFilters