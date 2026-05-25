import { Link } from 'react-router-dom'

function Pausada() {
  return (
    <main className="container detail">
      <section className="detail-card">
        <h1>Publicación pausada</h1>
        <p>Lo sentimos — esta publicación está pausada y no está disponible en el marketplace.</p>
        <div style={{ marginTop: '18px' }}>
          <Link className="btn" to="/">Volver a publicaciones</Link>
        </div>
      </section>
    </main>
  )
}

export default Pausada
