import { Outlet } from 'react-router-dom'
import MarketplaceNavbar from '../components/MarketplaceNavbar.jsx'

function MarketplaceLayout() {
  return (
    <div>
      <MarketplaceNavbar />
      <Outlet />
      <footer>
        <div className="container">Market Place 2026 · Ayuda · Contacto</div>
      </footer>
    </div>
  )
}

export default MarketplaceLayout