import { useState } from 'react'
import { loginAdmin } from '/src/services/authService.js'
import { useNavigate } from 'react-router-dom'

export default function Login(){
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const nav = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await loginAdmin(password)   // ← hace POST a /api/Auth/login con email del .env
      nav('/admin')
    } catch (ex) {
      console.error('admin login error', ex)
      setError('Contraseña incorrecta')
    }
  }

  return (
    <div className="grid two">
      <section className="card">
        <h3>Ingreso Admin</h3>
        <form className="grid" onSubmit={submit} style={{gap:12}}>
          <label>Contraseña
            <input
              className="input"
              type="password"
              value={password}
              onChange={e=>setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>
          <button className="button primary" type="submit">Ingresar</button>
          {error && <span className="badge danger">{error}</span>}
          <p className="sub">Demo: <code>admin123</code></p>
        </form>
      </section>
      <section className="card">
        <h3>¿Qué puedo hacer como Admin?</h3>
        <ul>
          <li>Ver todas las reservas (clases y canchas)</li>
          <li>Cancelar y eliminar reservas</li>
          <li>Enviar aviso por WhatsApp o llamar</li>
          <li>Buscar y filtrar por tipo</li>
        </ul>
      </section>
    </div>
  )
}
