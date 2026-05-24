import { Navigate, Route, Routes } from 'react-router-dom'
import MarketplaceLayout from './layouts/MarketplaceLayout.jsx'
import AuthLayout from './layouts/AuthLayout.jsx'
import HomePage from './pages/HomePage.jsx'
import ListingDetailPage from './pages/ListingDetailPage.jsx'
import CreateListingPage from './pages/CreateListingPage.jsx'
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
