import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

function MarketplaceLayout() {
  return (
    <div>
      <Navbar />
      <Outlet />
      <Footer></Footer>
    </div>
  )
}

export default MarketplaceLayout