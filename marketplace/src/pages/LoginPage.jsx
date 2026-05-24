import { Link } from 'react-router-dom'

function LoginPage() {
  const handleSubmit = (event) => {
    event.preventDefault()
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
            <label htmlFor="login-user">Usuario</label>
            <input id="login-user" type="text" name="user" />
            <label htmlFor="login-password">Contraseña</label>
            <input id="login-password" type="password" name="password" />
            <Link className="boton" to="/">
              Iniciar sesión
            </Link>
          </form>
        </div>
      </div>
    </main>
  )
}

export default LoginPage