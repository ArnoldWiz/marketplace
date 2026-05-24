import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCsrfToken } from '../utils/csrf.js'

function RegisterPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    firstName: '',
    lastName: '',
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
      const csrfToken = await getCsrfToken()

      const response = await fetch('/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          password_confirm: formData.passwordConfirm,
          first_name: formData.firstName,
          last_name: formData.lastName,
        }),
      })

      const payload = await response.json()

      if (!response.ok) {
        const firstError = Object.values(payload).flat()?.[0]
        setErrorMessage(firstError || 'No se pudo crear la cuenta.')
        return
      }

      navigate('/login', { state: { registered: true } })
    } catch {
      setErrorMessage('No se pudo conectar con el servidor.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="contenedor registro">
        <div className="color">
          <h1>Bienvenido</h1>
          <h2>Inicia sesión para continuar</h2>
          <p>Si ya tienes una cuenta:</p>
          <Link className="boton" to="/login">
            Iniciar sesión
          </Link>
        </div>

        <div className="inputs">
          <form onSubmit={handleSubmit} className="d-grid gap-2">
            <label htmlFor="register-user">Usuario</label>
            <input id="register-user" type="text" name="username" value={formData.username} onChange={handleChange} required />

            <label htmlFor="register-email">Correo</label>
            <input id="register-email" type="email" name="email" value={formData.email} onChange={handleChange} required />

            <label htmlFor="register-first-name">Nombre</label>
            <input id="register-first-name" type="text" name="firstName" value={formData.firstName} onChange={handleChange} />

            <label htmlFor="register-last-name">Apellidos</label>
            <input id="register-last-name" type="text" name="lastName" value={formData.lastName} onChange={handleChange} />

            <label htmlFor="register-password">Contraseña</label>
            <input id="register-password" type="password" name="password" value={formData.password} onChange={handleChange} required minLength={8} />

            <label htmlFor="register-password-confirm">Confirmar contraseña</label>
            <input
              id="register-password-confirm"
              type="password"
              name="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={handleChange}
              required
              minLength={8}
            />

            {errorMessage ? <p className="text-danger m-0">{errorMessage}</p> : null}

            <button className="boton" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Registrando...' : 'Registrate'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

export default RegisterPage