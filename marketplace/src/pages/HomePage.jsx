import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ListingCard from '../components/ListingCard.jsx'
import SidebarFilters from '../components/SidebarFilters.jsx'

function HomePage() {
  const [categories, setCategories] = useState([])
  const [publications, setPublications] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('Nuevos')
  const [visibleCount, setVisibleCount] = useState(10)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/categories/')
        const payload = await response.json()
        setCategories(payload)
      } catch {
        setCategories([])
      }
    }

    loadCategories()
  }, [])

  useEffect(() => {
    const loadPublications = async () => {
      try {
        setIsLoading(true)
        const params = new URLSearchParams()
        params.set('filter', selectedFilter === 'Populares' ? 'popular' : 'new')

        if (selectedCategory) {
          params.set('category', selectedCategory)
        }

        const response = await fetch(`/api/publications/all/?${params.toString()}`)
        const payload = await response.json()
        setPublications(payload)
        setVisibleCount(10)
        setErrorMessage('')
      } catch {
        setErrorMessage('No se pudieron cargar las publicaciones.')
      } finally {
        setIsLoading(false)
      }
    }

    loadPublications()
  }, [selectedCategory, selectedFilter])

  const visiblePublications = useMemo(() => publications.slice(0, visibleCount), [publications, visibleCount])
  const canLoadMore = visibleCount < publications.length

  return (
    <main className="container">
      <section className="hero">
        <h1>Compra y vende con personas cerca de ti</h1>
        <p>Market Place conecta a tu comunidad con productos reales y respuestas rapidas.</p>
      </section>

      <div className="layout">
        <SidebarFilters
          categories={categories}
          selectedCategory={selectedCategory}
          selectedFilter={selectedFilter}
          onCategoryChange={setSelectedCategory}
          onFilterChange={setSelectedFilter}
        />

        <section className="section feed">
          <div className="feed-header">
            <h2>Publicaciones</h2>
            <div className="feed-actions">
              <Link className="btn" to="/publicar">
                Crear publicacion
              </Link>
            </div>
          </div>

          {errorMessage ? <p className="text-danger">{errorMessage}</p> : null}

          {isLoading ? <p>Cargando publicaciones...</p> : null}

          {!isLoading ? (
            <>
              {visiblePublications.length === 0 ? (
                <div className="publish-card empty-state">
                  <h2>No hay publicaciones para mostrar</h2>
                  <p>Prueba cambiando la categoria o el orden de filtrado.</p>
                </div>
              ) : null}

              <div className="cards">
                {visiblePublications.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>

              {canLoadMore ? (
                <div className="feed-actions feed-actions--center">
                  <button className="btn secondary" type="button" onClick={() => setVisibleCount((currentCount) => currentCount + 10)}>
                    Ver mas
                  </button>
                </div>
              ) : null}
            </>
          ) : null}
        </section>
      </div>
    </main>
  )
}

export default HomePage