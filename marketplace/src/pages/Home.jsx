import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCategories, getPublicationsFeed } from '../api/marketplaceApi.js'
import Card from '../components/Card.jsx'
import Sidebar from '../components/Sidebar.jsx'

function Home() {
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
        const payload = await getCategories()
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
        const payload = await getPublicationsFeed({
          filter: selectedFilter === 'Populares' ? 'popular' : 'new',
          category: selectedCategory,
        })
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
        <Sidebar
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
                  <Card key={listing.id} listing={listing} />
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

export default Home