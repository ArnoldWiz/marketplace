import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  createPublication,
  getCategories,
  getPublication,
  setPublicationPaused,
  updatePublication,
} from '../api/marketplaceApi.js'
import { useAuth } from '../context/authContext.js'

const estados = [
  'Aguascalientes',
  'Baja California',
  'Baja California Sur',
  'Campeche',
  'Chiapas',
  'Chihuahua',
  'Ciudad de Mexico',
  'Coahuila',
  'Colima',
  'Durango',
  'Guanajuato',
  'Guerrero',
  'Hidalgo',
  'Jalisco',
  'Estado de Mexico',
  'Michoacan',
  'Morelos',
  'Nayarit',
  'Nuevo Leon',
  'Oaxaca',
  'Puebla',
  'Queretaro',
  'Quintana Roo',
  'San Luis Potosi',
  'Sinaloa',
  'Sonora',
  'Tabasco',
  'Tamaulipas',
  'Tlaxcala',
  'Veracruz',
  'Yucatan',
  'Zacatecas',
]

function CRUD() {
  const navigate = useNavigate()
  const { listingId } = useParams()
  const { user, isLoading } = useAuth()
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: '',
    location: '',
    description: '',
  })
  const [selectedImages, setSelectedImages] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const payload = await getCategories()
        setCategories(payload)
        if (payload.length > 0) {
          setFormData((currentForm) => ({
            ...currentForm,
            category: String(payload[0].id),
          }))
        }
      } catch {
        setCategories([])
      }
    }

    loadCategories()
  }, [])

  useEffect(() => {
    const loadPublication = async () => {
      if (!listingId) return
      try {
        const data = await getPublication(listingId)
        setFormData({
          title: data.title || '',
          price: data.price || '',
          category: data.category?.id ? String(data.category.id) : '',
          location: data.location || '',
          description: data.description || '',
        })
        setIsPaused(Boolean(data.is_paused))
      } catch {
      }
    }

    loadPublication()
  }, [listingId])

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login')
    }
  }, [isLoading, navigate, user])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  const handleImagesChange = (event) => {
    setSelectedImages(Array.from(event.target.files ?? []))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setErrorMessage('')
    setIsSubmitting(true)

    try {
      if (listingId) {
        await updatePublication(listingId, {
          title: formData.title,
          price: formData.price,
          category: formData.category,
          location: formData.location,
          description: formData.description,
        })
      } else {
        await createPublication({
          title: formData.title,
          price: formData.price,
          category: formData.category,
          location: formData.location,
          description: formData.description,
          images: selectedImages,
        })
      }

      navigate('/')
    } catch (error) {
      setErrorMessage(error.message || 'No se pudo conectar con el servidor.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="container publish">
      <div className="publish-grid">
        <section className="publish-card">
          <h1>{listingId ? 'Editar publicacion' : 'Crear publicacion'}</h1>
          <p>Completa los datos para mostrar tu producto en el market.</p>

          <form className="publish-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="titulo">Titulo</label>
              <input type="text" id="titulo" name="title" value={formData.title} onChange={handleChange} placeholder="Ej. Smartwatch Senda" required />
            </div>
            <div className="field">
              <label htmlFor="precio">Precio</label>
              <input type="number" id="precio" name="price" value={formData.price} onChange={handleChange} placeholder="1450" min="0" step="0.01" required />
            </div>
            <div className="field">
              <label htmlFor="categoria">Categoria</label>
              <select id="categoria" name="category" value={formData.category} onChange={handleChange} required>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="ubicacion">Ubicacion</label>
              <select id="ubicacion" name="location" value={formData.location} onChange={handleChange} required>
                <option value="">Selecciona un estado</option>
                {estados.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
            <div className="field full">
              <label htmlFor="descripcion">Descripcion</label>
              <textarea id="descripcion" name="description" rows="5" value={formData.description} onChange={handleChange} placeholder="Describe tu producto..." required></textarea>
            </div>
            <div className="field full">
              <label htmlFor="fotos">Fotos</label>
              <div className="upload-box">
                <input id="fotos" type="file" accept="image/*" multiple onChange={handleImagesChange} />
                <span>{selectedImages.length > 0 ? `${selectedImages.length} imagenes seleccionadas` : 'Selecciona una o varias imagenes'}</span>
              </div>
            </div>
            {errorMessage ? <p className="text-danger m-0">{errorMessage}</p> : null}
                  <div className="form-actions">
                    <button className="btn" type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (listingId ? 'Guardando...' : 'Publicando...') : (listingId ? 'Guardar cambios' : 'Publicar')}
                    </button>
                    {listingId ? (
                      <button
                        className="btn secondary"
                        type="button"
                        onClick={async () => {
                              const data = await setPublicationPaused(listingId, !isPaused)
                              setIsPaused(Boolean(data.is_paused))
                        }}
                      >
                        {isPaused ? 'Reanudar' : 'Pausar'}
                      </button>
                    ) : (
                      <Link className="btn secondary" to="/">
                        Cancelar
                      </Link>
                    )}
                  </div>
          </form>
        </section>

        <aside className="publish-card">
          <h2>Consejos rapidos</h2>
          <ul className="steps-list">
            <li>Usa un titulo claro y corto.</li>
            <li>Agrega fotos con buena luz.</li>
            <li>Indica la ubicacion exacta.</li>
            <li>Responde rapido para vender mas.</li>
          </ul>
          <div className="mini-preview" style={{ marginTop: '18px' }}>
            <div className="mini-thumb" aria-hidden="true"></div>
            <div>
              <h3>Vista previa</h3>
              <p>Asi se vera tu publicacion.</p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}

export default CRUD