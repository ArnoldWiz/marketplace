import { Link, useParams } from 'react-router-dom'
import { getListingById } from '../data/listings.js'

function ListingDetailPage() {
  const { listingId } = useParams()
  const listing = getListingById(listingId)

  return (
    <main className="container detail">
      <div className="detail-grid">
        <section className="detail-card">
          <div className="detail-media"></div>
          <h1 className="detail-title">{listing.title}</h1>
          <p>{listing.description}</p>
          <p className="detail-price">{listing.price}</p>
          <Link className="btn" to="/">
            Volver a publicaciones
          </Link>
        </section>

        <aside className="detail-card">
          <h2>Detalles</h2>
          <div className="detail-list">
            {listing.details.map((detail) => (
              <span key={detail}>{detail}</span>
            ))}
          </div>
          <Link className="btn" to="/login" style={{ marginTop: '18px' }}>
            Contactar vendedor
          </Link>
        </aside>
      </div>
    </main>
  )
}

export default ListingDetailPage