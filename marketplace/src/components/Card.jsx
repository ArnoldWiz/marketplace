import { Link } from 'react-router-dom'

function Card({ listing }) {
  const coverImage = listing.images?.[0]

  return (
    <Link className="card-link" to={`/publicacion/${listing.id}`}>
      <article className="card">
        <div className="card__media">{coverImage ? <img src={coverImage} alt={listing.title} /> : <div className="card__placeholder">Sin imagen</div>}</div>
        <h3>{listing.title}</h3>
        <p>{listing.description}</p>
        <strong>{listing.price_display ?? listing.price}</strong>
      </article>
    </Link>
  )
}

export default Card