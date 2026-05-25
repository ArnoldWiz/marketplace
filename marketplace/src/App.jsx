import { Navigate, Route, Routes } from 'react-router-dom'
import MarketplaceLayout from './layouts/MarketplaceLayout.jsx'
import LoginLayouts from './layouts/LoginLayouts.jsx'
import Home from './pages/Home.jsx'
import Details from './pages/Details.jsx'
import CRUD from './pages/CRUD.jsx'
import MisPublicaciones from './pages/MisPublicaciones.jsx'
import Pausada from './pages/Pausada.jsx'
import Estadisticas from './pages/Estadisticas.jsx'
import Login from './pages/Login.jsx'
import Registro from './pages/Registro.jsx'

function App() {
  return (
    <Routes>
      <Route element={<MarketplaceLayout />}>
        <Route index element={<Home />} />
        <Route path="publicacion" element={<Details />} />
        <Route path="publicacion/:listingId" element={<Details />} />
        <Route path="publicar" element={<CRUD />} />
        <Route path="publicar/:listingId" element={<CRUD />} />
        <Route path="mis-publicaciones" element={<MisPublicaciones />} />
        <Route path="admin/estadisticas" element={<Estadisticas />} />
        <Route path="publicacion/:listingId/pausada" element={<Pausada />} />
      </Route>
      <Route element={<LoginLayouts />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Registro />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
