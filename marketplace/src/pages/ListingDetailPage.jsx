import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getCsrfToken } from '../utils/csrf.js'

function ListingDetailPage() {
  const { listingId } = useParams()
  const [listing, setListing] = useState(null)
  const [questions, setQuestions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [newQuestion, setNewQuestion] = useState('')
  const [answerText, setAnswerText] = useState({})

  const { user } = useAuth()

  const navigate = useNavigate()

  useEffect(() => {
    const loadListing = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/publications/${listingId}/`)

        if (!response.ok) {
          setErrorMessage('No se pudo cargar la publicacion.')
          return
        }

        const payload = await response.json()
        // if publication is paused, redirect to paused page
        if (payload.is_paused) {
          navigate(`/publicacion/${listingId}/pausada`)
          return
        }

        setListing(payload)
        setQuestions(payload.questions || [])
        setErrorMessage('')
      } catch {
        setErrorMessage('No se pudo cargar la publicacion.')
      } finally {
        setIsLoading(false)
      }
    }

    loadListing()
  }, [listingId])

  if (isLoading) {
    return (
      <main className="container detail">
        <section className="detail-card">
          <p>Cargando publicacion...</p>
        </section>
      </main>
    )
  }

  if (errorMessage || !listing) {
    return (
      <main className="container detail">
        <section className="detail-card">
          <h1>Publicacion no encontrada</h1>
          <p>{errorMessage || 'La publicacion no existe o fue eliminada.'}</p>
          <Link className="btn" to="/">
            Volver a publicaciones
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="container detail">
      <div className="detail-grid">
        <section className="detail-card">
          <div className="detail-media">
            {listing.images?.[0] ? <img src={listing.images[0]} alt={listing.title} /> : <div className="detail-media__placeholder">Sin imagen</div>}
          </div>
          <h1 className="detail-title">{listing.title}</h1>
          <p>{listing.description}</p>
          <p className="detail-price">{listing.price_display}</p>
          <p className="detail-meta">Categoria: {listing.category?.name}</p>
          <p className="detail-meta">Ubicacion: {listing.location}</p>
          <p className="detail-meta">Vendedor: {listing.seller?.username}</p>
          <Link className="btn" to="/">
            Volver a publicaciones
          </Link>
        </section>

        <aside className="detail-card">
          <h2>Detalles</h2>
          <div className="detail-list">
            <span>Clicks: {listing.clicks}</span>
            <span>Publicado: {new Date(listing.created_at).toLocaleDateString('es-MX')}</span>
            <span>Actualizado: {new Date(listing.updated_at).toLocaleDateString('es-MX')}</span>
          </div>
          {listing.images?.length > 1 ? (
            <div className="detail-gallery">
              {listing.images.slice(1, 4).map((image) => (
                <img key={image} src={image} alt={listing.title} />
              ))}
            </div>
          ) : null}
          <div style={{ marginTop: '18px' }}>
            {listing.is_paused ? (
              <div className="paused-overlay">
                <h3>Publicación pausada</h3>
                <p>Esta publicación está actualmente pausada y no aparece en la página principal.</p>
              </div>
            ) : null}
            <h3>Preguntas y respuestas</h3>

            {questions.length === 0 ? <p>No hay preguntas aun.</p> : (
              <div className="qa-list">
                {questions.map((q) => (
                  <div key={q.id} className="qa-item">
                    <div className="qa-question">
                      <strong>{q.author?.username}</strong> preguntó:
                      <p>{q.body}</p>
                      <small>{new Date(q.created_at).toLocaleString('es-MX')}</small>
                    </div>

                    <div className="qa-answers">
                      {q.answers && q.answers.length > 0 ? (
                        q.answers.map((a) => (
                          <div key={a.id} className="qa-answer">
                            <strong>{a.author?.username}</strong> respondió:
                            <p>{a.body}</p>
                            <small>{new Date(a.created_at).toLocaleString('es-MX')}</small>
                          </div>
                        ))
                      ) : (
                        <div className="qa-no-answers">Sin respuestas aun.</div>
                      )}

                      {user && user.id === listing.seller?.id ? (
                        <div className="qa-reply">
                          <textarea value={answerText[q.id] || ''} onChange={(e) => setAnswerText({...answerText, [q.id]: e.target.value})} placeholder="Escribe una respuesta..." />
                          <button className="btn" onClick={async () => {
                            const text = (answerText[q.id] || '').trim()
                            if (!text) return
                            const csrf = await getCsrfToken()
                            const res = await fetch(`/api/questions/${q.id}/answers/`, {
                              method: 'POST',
                              headers: {'Content-Type': 'application/json', 'X-CSRFToken': csrf},
                              credentials: 'include',
                              body: JSON.stringify({body: text}),
                            })
                            if (res.ok) {
                              const data = await res.json()
                              setQuestions((prev) => prev.map(item => item.id === q.id ? {...item, answers: [...(item.answers||[]), data]} : item))
                              setAnswerText({...answerText, [q.id]: ''})
                            }
                          }}>Responder</button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {user && user.id !== listing.seller?.id ? (
              <div className="qa-ask">
                <textarea value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} placeholder="Haz una pregunta al vendedor" />
                <button className="btn" onClick={async () => {
                  const text = newQuestion.trim()
                  if (!text) return
                  const csrf = await getCsrfToken()
                  const res = await fetch(`/api/publications/${listingId}/questions/`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json', 'X-CSRFToken': csrf},
                    credentials: 'include',
                    body: JSON.stringify({body: text}),
                  })
                  if (res.ok) {
                    const data = await res.json()
                    setQuestions((prev) => [data, ...prev])
                    setNewQuestion('')
                  }
                }}>Preguntar</button>
              </div>
            ) : (
              !user ? <Link to="/login" className="btn">Inicia sesion para preguntar</Link> : null
            )}
          </div>
        </aside>
      </div>
    </main>
  )
}

export default ListingDetailPage