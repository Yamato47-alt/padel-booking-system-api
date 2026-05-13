// src/modules/App.jsx
import { NavLink, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Home from './Home.jsx'
import Bookings from './admin/Bookings.jsx'
import Admin from './admin/Admin.jsx'
import Login from './admin/Login.jsx'          // login de ADMIN (/admin/login)
import Account from './account/Account.jsx'
import LoginUser from './account/LoginUser.jsx' // login de USUARIO (/cuenta/ingresar)
import Register from './account/Register.jsx'   // registro de usuario

import { isLogged, logout } from '../services/authService.js'      // admin auth
import { getSession as getUserSession, logoutUser } from '../services/userService.js' // user auth

function AdminRoute({ children }){
  return isLogged() ? children : <Navigate to="/admin/login" replace />
}

function Topbar(){
  const loc = useLocation()
  const adminLogged = isLogged()
  const user = getUserSession() // {name, email, phone} si hay sesión de usuario

  return (
    <nav className="navbar">
      <div className="navinner container">
        <div className="brand">
          <span className="brand-badge">P</span> Padel Club
        </div>

        <div className="navlinks" style={{display:'flex', gap:8, alignItems:'center'}}>
          <NavLink to="/" end>Inicio</NavLink>
          <NavLink to="/reservas">Reservar</NavLink>
          <NavLink to="/admin">Admin</NavLink>

          {/* Cuenta de usuario */}
          {user ? (
            <>
              <NavLink to="/cuenta">{user.name || 'Mi cuenta'}</NavLink>
              {/* Botón salir solo cuando estoy en /cuenta */}
              {loc.pathname.startsWith('/cuenta') && (
                <button
                  className="button btn-ghost"
                  onClick={() => { logoutUser(); window.location.href = '/cuenta/ingresar' }}
                >
                  Salir
                </button>
              )}
            </>
          ) : (
            <NavLink to="/cuenta/ingresar">Ingresar</NavLink>
          )}

          {/* Salir de admin solo en /admin */}
          {adminLogged && loc.pathname.startsWith('/admin') && (
            <button
              className="button btn-ghost"
              onClick={() => { logout(); window.location.href = '/admin/login' }}
            >
              Salir admin
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

export default function App(){
  return (
    <div>
      <Topbar/>
      <main className="container">
        <Routes>
          <Route path="/" element={<Home/>} />

          {/* Reservar (form simple) */}
          <Route path="/reservas" element={<Bookings/>} />

          {/* Admin */}
          <Route path="/admin/login" element={<Login/>} />
          <Route path="/admin" element={<AdminRoute><Admin/></AdminRoute>} />

          {/* Cuenta de usuario */}
          <Route path="/cuenta" element={<Account/>} />
          <Route path="/cuenta/ingresar" element={<LoginUser/>} />
          <Route path="/cuenta/registrar" element={<Register/>} />
        </Routes>
      </main>

      <div className="footer">© {new Date().getFullYear()} Padel Club - Contacto:3517662142</div>
    </div>
  )
}
