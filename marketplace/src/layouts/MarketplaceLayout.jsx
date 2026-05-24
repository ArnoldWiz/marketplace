import { Outlet } from 'react-router-dom'

function MarketplaceLayout() {
  return (
    <div>
      <header className="site-header">
        <div className="container header-row">
          <div className="brand">Market Place</div>
          <nav className="site-nav">
            <a href="/">Mis Publicaciones</a>
            <a href="/login">Iniciar sesion</a>
          </nav>
        </div>
      </header>
      <Outlet />
      <footer>
        <div className="container">Market Place 2026 · Ayuda · Contacto</div>
      </footer>
    </div>
  )
}

export default MarketplaceLayout