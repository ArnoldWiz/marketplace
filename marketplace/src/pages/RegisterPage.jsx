import { Link } from 'react-router-dom'

function RegisterPage() {
  const handleSubmit = (event) => {
    event.preventDefault()
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
            <input id="register-user" type="text" name="user" />
            <label htmlFor="register-password">Contraseña</label>
            <input id="register-password" type="password" name="password" />
            <Link className="boton" to="/login">
              Registrate
            </Link>
          </form>
        </div>
      </div>
    </main>
  )
}

export default RegisterPage