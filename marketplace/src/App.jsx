import { Navigate, Route, Routes } from 'react-router-dom'
import MarketplaceLayout from './layouts/MarketplaceLayout.jsx'
import AuthLayout from './layouts/AuthLayout.jsx'
import HomePage from './pages/HomePage.jsx'
import ListingDetailPage from './pages/ListingDetailPage.jsx'
import CreateListingPage from './pages/CreateListingPage.jsx'
import MyPublicationsPage from './pages/MyPublicationsPage.jsx'
import PublicationPausedPage from './pages/PublicationPausedPage.jsx'
import AdminStatsPage from './pages/AdminStatsPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'

function App() {
  return (
    <Routes>
      <Route element={<MarketplaceLayout />}>
        <Route index element={<HomePage />} />
        <Route path="publicacion" element={<ListingDetailPage />} />
        <Route path="publicacion/:listingId" element={<ListingDetailPage />} />
        <Route path="publicar" element={<CreateListingPage />} />
        <Route path="publicar/:listingId" element={<CreateListingPage />} />
        <Route path="mis-publicaciones" element={<MyPublicationsPage />} />
        <Route path="admin/estadisticas" element={<AdminStatsPage />} />
        <Route path="publicacion/:listingId/pausada" element={<PublicationPausedPage />} />
      </Route>
      <Route element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
