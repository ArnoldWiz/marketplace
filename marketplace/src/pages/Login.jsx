import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { loginUser } from '../api/marketplaceApi.js'
import { useAuth } from '../context/authContext.js'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const payload = await loginUser(formData)

      signIn(payload)
      navigate('/')
    } catch (error) {
      setErrorMessage(error.message || 'No se pudo conectar con el servidor.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="contenedor">
        <div className="color">
          <h1>Bienvenido</h1>
          <h2>Inicia sesión para continuar</h2>
          <p>Si no tienes una cuenta:</p>
          <Link className="boton" to="/register">
            Registrate
          </Link>
        </div>

        <div className="inputs">
          <form onSubmit={handleSubmit} className="d-grid gap-2">
            {location.state?.registered ? <p className="text-success m-0">Cuenta creada correctamente. Ahora inicia sesión.</p> : null}
            <label htmlFor="login-user">Usuario</label>
            <input id="login-user" type="text" name="username" value={formData.username} onChange={handleChange} required />
            <label htmlFor="login-password">Contraseña</label>
            <input id="login-password" type="password" name="password" value={formData.password} onChange={handleChange} required />
            {errorMessage ? <p className="text-danger m-0">{errorMessage}</p> : null}
            <button className="boton" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Ingresando...' : 'Iniciar sesion'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

export default Login