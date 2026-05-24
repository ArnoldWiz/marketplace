import { Link } from 'react-router-dom'

function ListingCard({ listing }) {
  return (
    <Link className="card-link" to={`/publicacion/${listing.id}`}>
      <article className="card">
        <h3>{listing.title}</h3>
        <p>{listing.summary}</p>
        <strong>{listing.price}</strong>
      </article>
    </Link>
  )
}

export default ListingCard