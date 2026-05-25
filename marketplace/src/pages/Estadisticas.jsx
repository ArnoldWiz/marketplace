import { useEffect, useState } from 'react'
import { getAdminPublications } from '../api/marketplaceApi.js'

function Estadisticas() {
  const [range, setRange] = useState('30d')
  const [query, setQuery] = useState('')
  const [publications, setPublications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [ordering, setOrdering] = useState('-created_at')
  const pageSize = 20

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      try {
        const data = await getAdminPublications({ range, query, ordering, page, pageSize })
        setPublications(data.results || [])
        setTotalPages(data.total_pages || 1)
      } catch {
        setPublications([])
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [range, query, page, ordering])

  const toggleSort = (field) => {
    if (ordering === field) setOrdering('-' + field)
    else if (ordering === '-' + field) setOrdering(field)
    else setOrdering('-' + field)
    setPage(1)
  }

  return (
    <main className="container publish">
      <section className="publish-card">
        <h1>Estadísticas</h1>
        <p>Panel de administración: publicaciones.</p>

        <div style={{ marginTop: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            {['24h', '7d', '30d', '1y', '2025', '2024'].map((r) => (
              <button key={r} className={`btn ${range === r ? 'active' : ''}`} onClick={() => { setRange(r); setPage(1) }}>{r}</button>
            ))}
          </div>

          <div style={{ marginBottom: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input placeholder="Buscar por cualquier cosa" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} />
            <div> Página {page} de {totalPages} </div>
          </div>

          {isLoading ? <p>Cargando...</p> : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th onClick={() => toggleSort('id')}>ID</th>
                    <th onClick={() => toggleSort('title')}>Titulo</th>
                    <th onClick={() => toggleSort('seller')}>Vendedor</th>
                    <th onClick={() => toggleSort('category')}>Categoria</th>
                    <th onClick={() => toggleSort('price')}>Precio</th>
                    <th onClick={() => toggleSort('location')}>Ubicacion</th>
                    <th onClick={() => toggleSort('clicks')}>Clicks</th>
                    <th onClick={() => toggleSort('is_paused')}>Pausada</th>
                    <th onClick={() => toggleSort('created_at')}>Publicado</th>
                  </tr>
                </thead>
                <tbody>
                  {publications.map((p) => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>{p.title}</td>
                      <td>{p.seller?.username}</td>
                      <td>{p.category?.name}</td>
                      <td>{p.price}</td>
                      <td>{p.location}</td>
                      <td>{p.clicks}</td>
                      <td>{p.is_paused ? 'Sí' : 'No'}</td>
                      <td>{new Date(p.created_at).toLocaleString('es-MX')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button className="btn" onClick={() => setPage((s) => Math.max(1, s - 1))} disabled={page <= 1}>Anterior</button>
                <button className="btn" onClick={() => setPage((s) => Math.min(totalPages, s + 1))} disabled={page >= totalPages}>Siguiente</button>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default Estadisticas
