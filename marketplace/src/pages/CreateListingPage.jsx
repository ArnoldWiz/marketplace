import { Link } from 'react-router-dom'

function CreateListingPage() {
  return (
    <main className="container publish">
      <div className="publish-grid">
        <section className="publish-card">
          <h1>Crear publicacion</h1>
          <p>Completa los datos para mostrar tu producto en el market.</p>

          <form className="publish-form">
            <div className="field">
              <label htmlFor="titulo">Titulo</label>
              <input type="text" id="titulo" placeholder="Ej. Smartwatch Senda" />
            </div>
            <div className="field">
              <label htmlFor="precio">Precio</label>
              <input type="text" id="precio" placeholder="$1,450 MXN" />
            </div>
            <div className="field">
              <label htmlFor="categoria">Categoria</label>
              <select id="categoria" defaultValue="Tecnologia">
                <option>Tecnologia</option>
                <option>Hogar</option>
                <option>Moda</option>
                <option>Deportes</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="ubicacion">Ubicacion</label>
              <input type="text" id="ubicacion" placeholder="Ciudad o colonia" />
            </div>
            <div className="field full">
              <label htmlFor="descripcion">Descripcion</label>
              <textarea id="descripcion" rows="5" placeholder="Describe tu producto..."></textarea>
            </div>
            <div className="field full">
              <label htmlFor="fotos">Fotos</label>
              <div className="upload-box">Arrastra tus fotos aqui</div>
            </div>
            <div className="form-actions">
              <Link className="btn" to="/">
                Publicar
              </Link>
              <Link className="btn secondary" to="/">
                Cancelar
              </Link>
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

export default CreateListingPage