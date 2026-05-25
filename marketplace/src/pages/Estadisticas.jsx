import { useEffect, useMemo, useRef, useState } from 'react'
import { getAdminPublications } from '../api/marketplaceApi.js'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from 'recharts'

function Estadisticas() {
  const [range, setRange] = useState('30d')
  const [query, setQuery] = useState('')
  const [publications, setPublications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [ordering, setOrdering] = useState('-created_at')
  const [isExportingPdf, setIsExportingPdf] = useState(false)
  const reportRef = useRef(null)
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

  const exportCSV = () => {
    if (!publications || publications.length === 0) return

    const headers = ['ID', 'Titulo', 'Vendedor', 'Categoria', 'Precio', 'Ubicacion', 'Clicks', 'Pausada', 'Publicado']
    const rows = publications.map((p) => [
      p.id,
      p.title,
      p.seller?.username ?? '',
      p.category?.name ?? '',
      p.price,
      p.location,
      p.clicks,
      p.is_paused ? 'Sí' : 'No',
      p.created_at,
    ])

    const escape = (v) => {
      if (v === null || v === undefined) return ''
      const s = String(v)
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return '"' + s.replace(/"/g, '""') + '"'
      }
      return s
    }

    const csvContent = [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const fileName = `estadisticas_publicaciones_${range}_${new Date().toISOString().slice(0,10)}.csv`
    a.setAttribute('download', fileName)
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const exportPDF = async () => {
    if (!reportRef.current || publications.length === 0) return

    setIsExportingPdf(true)

    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ])

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pageWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`estadisticas_publicaciones_${range}_${new Date().toISOString().slice(0, 10)}.pdf`)
    } finally {
      setIsExportingPdf(false)
    }
  }

  const categoryData = useMemo(() => {
    if (!publications || publications.length === 0) return []
    const counts = {}
    publications.forEach((p) => {
      const name = p.category?.name || 'Sin categoría'
      counts[name] = (counts[name] || 0) + 1
    })
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
  }, [publications])

  const clicksOverTime = useMemo(() => {
    if (!publications || publications.length === 0) return []
    const byDate = {}
    publications.forEach((p) => {
      if (!p.created_at) return
      const iso = p.created_at.slice(0, 10)
      byDate[iso] = (byDate[iso] || 0) + (p.clicks || 0)
    })
    return Object.keys(byDate).sort().map((date) => ({ date, clicks: byDate[date] }))
  }, [publications])

  return (
    <main className="container publish">
      <section className="publish-card">
        <h1>Estadísticas</h1>
        <p>Panel de administración: publicaciones.</p>

        <div style={{ marginTop: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
            <div style={{ background: '#fff', padding: '8px', borderRadius: 6 }}>
              <h4 style={{ margin: '6px 0' }}>Publicaciones por categoría</h4>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <BarChart data={categoryData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ background: '#fff', padding: '8px', borderRadius: 6 }}>
              <h4 style={{ margin: '6px 0' }}>Clicks por fecha</h4>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <LineChart data={clicksOverTime} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="clicks" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            {['24h', '7d', '30d', '1y', '2025', '2024'].map((r) => (
              <button key={r} className={`btn ${range === r ? 'active' : ''}`} onClick={() => { setRange(r); setPage(1) }}>{r}</button>
            ))}
          </div>

          <div style={{ marginBottom: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input placeholder="Buscar por cualquier cosa" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} />
            <div> Página {page} de {totalPages} </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
              <button className="btn" onClick={exportCSV} type="button">Exportar CSV</button>
              <button className="btn" onClick={exportPDF} type="button" disabled={isExportingPdf}>{isExportingPdf ? 'Generando PDF...' : 'Exportar PDF'}</button>
            </div>
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

      <section
        ref={reportRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: '-10000px',
          top: 0,
          width: '1200px',
          background: '#ffffff',
          color: '#111827',
          padding: '24px',
        }}
      >
        <h1 style={{ marginBottom: '8px' }}>Reporte de publicaciones</h1>
        <p style={{ marginTop: 0, marginBottom: '16px' }}>Rango: {range} | Total en vista: {publications.length}</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px' }}>
            <h3 style={{ marginTop: 0 }}>Publicaciones por categoría</h3>
            <div style={{ width: '100%', height: '280px' }}>
              <ResponsiveContainer>
                <BarChart data={categoryData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px' }}>
            <h3 style={{ marginTop: 0 }}>Clicks por fecha</h3>
            <div style={{ width: '100%', height: '280px' }}>
              <ResponsiveContainer>
                <LineChart data={clicksOverTime} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="clicks" stroke="#059669" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr>
              {['ID', 'Titulo', 'Vendedor', 'Categoria', 'Precio', 'Ubicacion', 'Clicks', 'Pausada', 'Publicado'].map((col) => (
                <th key={col} style={{ border: '1px solid #d1d5db', background: '#f9fafb', padding: '8px', textAlign: 'left' }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {publications.map((p) => (
              <tr key={p.id}>
                <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>{p.id}</td>
                <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>{p.title}</td>
                <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>{p.seller?.username}</td>
                <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>{p.category?.name}</td>
                <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>{p.price}</td>
                <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>{p.location}</td>
                <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>{p.clicks}</td>
                <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>{p.is_paused ? 'Sí' : 'No'}</td>
                <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>{new Date(p.created_at).toLocaleString('es-MX')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  )
}

export default Estadisticas
