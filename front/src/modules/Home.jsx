import React from 'react'
import { Link } from 'react-router-dom'

export default function Home(){
  return (
    <div className="grid" style={{gap:16}}>
      <section className="hero fade-in">
        <div className="glass">
          <span className="badge glow">🎾 Club Padel Cordoba</span>
          <h1>Reservas de Pádel sin vueltas</h1>
          <p className="muted">Canchas y clases en un clic.</p>
          <div className="toolbar" style={{marginTop:12}}>
            <Link className="button primary" to="/reservas">Reservar ahora</Link>
            <Link className="button" to="/cuenta/ingresar">Ingresar</Link>
            <Link className="button" to="/cuenta/registrar">Registrarme</Link>
          </div>
        </div>
      </section>

      <div className="grid two">
        <div className="image-card pop fade-in">
          <img src="public/techada.jpg" alt="Canchas de pádel" />
          <div className="overlay" />
          <div className="caption">Canchas techadas</div>
        </div>
        <div className="image-card pop fade-in">
          <img src="public/padeliluminada.webp" alt="Pelota de tenis" />
          <div className="overlay" />
          <div className="caption">Iluminación LED & césped pro</div>
        </div>
      </div>

      <div className="grid two">
        <section className="card pop">
          <h3>Horarios populares</h3>
          <p className="muted">18:00–22:00 · Viernes y sábados con alta demanda.</p>
        </section>
        <section className="card pop">
          <h3>Clases por niveles</h3>
          <p className="muted">Inicial, intermedio y avanzado. Profes certificados.</p>
        </section>
        <section className="card pop">
          <h3>Beneficios</h3>
          <ul>
            <li>Recordatorios automáticos</li>
            <li>Cancelación sin cargo hasta 2h antes</li>
            <li>Promos semanales</li>
          </ul>
        </section>
        <section className="card pop">
          <h3>Contacto</h3>
          <p className="muted">WhatsApp: +5493517662142 · Av. Laplace 5567, Córdoba</p>
        </section>
      </div>
    </div>
  )
}
