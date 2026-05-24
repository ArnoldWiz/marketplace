import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { marketplaceMenu, quickFilters } from '../data/listings.js'

function SidebarFilters({ categories, selectedCategory, selectedFilter, onCategoryChange, onFilterChange }) {
  const categoryOptions = useMemo(() => categories ?? [], [categories])

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

        <div className="category-filter">
          <label htmlFor="category-filter-select">Categoria</label>
          <select id="category-filter-select" value={selectedCategory} onChange={(event) => onCategoryChange(event.target.value)}>
            <option value="">Todas</option>
            {categoryOptions.map((category) => (
              <option key={category.id} value={String(category.id)}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="filtros">
        <h3>Filtros</h3>
        <div>
          {quickFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={`chip${selectedFilter === filter ? ' active' : ''}`}
              onClick={() => onFilterChange(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}

export default SidebarFilters