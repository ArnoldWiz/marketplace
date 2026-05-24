import { Link } from 'react-router-dom'
import ListingCard from '../components/ListingCard.jsx'
import SidebarFilters from '../components/SidebarFilters.jsx'
import { listings } from '../data/listings.js'

function HomePage() {
  return (
    <main className="container">
      <section className="hero">
        <h1>Compra y vende con personas cerca de ti</h1>
        <p>Market Place conecta a tu comunidad con productos reales y respuestas rapidas.</p>
      </section>

      <div className="layout">
        <SidebarFilters />

        <section className="section feed">
          <div className="feed-header">
            <h2>Publicaciones</h2>
            <div className="feed-actions">
              <Link className="btn" to="/publicar">
                Crear publicacion
              </Link>
            </div>
          </div>

          <div className="cards">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

export default HomePage