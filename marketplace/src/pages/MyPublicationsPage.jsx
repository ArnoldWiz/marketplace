import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function MyPublicationsPage() {
  const navigate = useNavigate()
  const { user, isLoading } = useAuth()
  const [publications, setPublications] = useState([])
  const [isFetching, setIsFetching] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [toggling, setToggling] = useState({})

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login')
    }
  }, [isLoading, navigate, user])

  useEffect(() => {
    const loadPublications = async () => {
      try {
        const response = await fetch('/api/publications/', {
          credentials: 'include',
        })

        if (!response.ok) {
          setErrorMessage('No se pudieron cargar tus publicaciones.')
          return
        }

        const payload = await response.json()
        setPublications(payload)
      } catch {
        setErrorMessage('No se pudieron cargar tus publicaciones.')
      } finally {
        setIsFetching(false)
      }
    }

    if (!isLoading && user) {
      loadPublications()
    }
  }, [isLoading, user])

  if (isLoading || isFetching) {
    return (
      <main className="container publish">
        <section className="publish-card">
          <h1>Mis publicaciones</h1>
          <p>Cargando tus publicaciones...</p>
        </section>
      </main>
    )
  }

  return (
    <main className="container publish my-publications-page">
      <section className="publish-card my-publications-header">
        <div>
          <h1>Mis publicaciones</h1>
          <p>Revisa aqui las publicaciones creadas con tu cuenta.</p>
        </div>
        <div className="my-publications-profile">
          <span className="site-nav-avatar" aria-hidden="true">
            {user?.username?.charAt(0)?.toUpperCase() ?? '?'}
          </span>
          <div>
            <strong>{user?.username}</strong>
            <p>{user?.email}</p>
          </div>
        </div>
      </section>

      {errorMessage ? <p className="text-danger">{errorMessage}</p> : null}

      {!errorMessage && publications.length === 0 ? (
        <section className="publish-card empty-state">
          <h2>Aun no publicas nada</h2>
          <p>Cuando subas una publicacion aparecerá aqui con su informacion e imagenes.</p>
          <Link className="btn" to="/publicar">
            Crear publicacion
          </Link>
        </section>
      ) : null}

      <section className="my-publications-grid">
        {publications.map((publication) => (
          <article className="publish-card publication-card" key={publication.id}>
            <div className="publication-card__media">
              {publication.images?.[0] ? (
                <img src={publication.images[0]} alt={publication.title} />
              ) : (
                <div className="publication-card__placeholder">Sin imagen</div>
              )}
            </div>

            <div className="publication-card__body">
              <div className="publication-card__topline">
                <h2>{publication.title}</h2>
                <strong>${Number(publication.price).toLocaleString('es-MX')} MXN</strong>
              </div>
              <p>{publication.description}</p>
              <div className="publication-card__meta">
                <span>{publication.category?.name}</span>
                <span>{publication.location}</span>
                <span>{new Date(publication.created_at).toLocaleDateString('es-MX')}</span>
              </div>
            </div>
            <div className="publication-card__actions">
              <button className="btn" onClick={() => navigate(`/publicar/${publication.id}`)}>Editar</button>
              <button
                className="btn secondary"
                onClick={async () => {
                  const pid = publication.id
                  if (toggling[pid]) return
                  setToggling((s) => ({ ...s, [pid]: true }))
                  try {
                    const csrf = await (await import('../utils/csrf.js')).getCsrfToken()
                    const res = await fetch(`/api/publications/${pid}/`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf },
                      credentials: 'include',
                      body: JSON.stringify({ is_paused: !publication.is_paused }),
                    })
                    if (res.ok) {
                      const updated = await res.json()
                      setPublications((prev) => prev.map(p => p.id === pid ? { ...p, is_paused: updated.is_paused } : p))
                    }
                  } finally {
                    setToggling((s) => ({ ...s, [pid]: false }))
                  }
                }}
              >
                {publication.is_paused ? 'Reanudar' : 'Pausar'}
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}

export default MyPublicationsPage