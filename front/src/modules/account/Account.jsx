// src/modules/account/Account.jsx
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getSession, logoutUser, updateMyProfile } from "../../services/userService.js";
import { useReservations, deleteReservation } from "../../services/reservationsService.js";

export default function Account() {
  const nav = useNavigate();
  const session = getSession();

  // Si no hay sesión, ir al login
  useEffect(() => { if (!session) nav("/cuenta/ingresar"); }, []); // eslint-disable-line

  const { reservations, loading, error, refresh } = useReservations(); // trae /api/Bookings/mine

  // ----  para detectar CLASES ----
  const isClass = (r) => {
    if (r?.type) {
      const t = String(r.type).toLowerCase();
      if (t === "clase" || t === "class") return true;
    }
    if ((r?.status || "").toLowerCase() === "class") return true;
    if (r?.courtId == null) return true; // sin courtId => clase
    if ((r?.notes || "").toLowerCase().includes("clase")) return true;
    return false;
  };

  const clases  = reservations.filter(isClass);
  const canchas = reservations.filter(r => !isClass(r));

  const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString() : "";
  const fmtTime = (iso) => iso ? new Date(iso).toTimeString().slice(0, 5) : "";

  async function onDelete(id) {
    if (!confirm("¿Eliminar esta reserva?")) return;
    try { await deleteReservation(id); await refresh(); }
    catch (err) { alert(err.message || "No se pudo eliminar"); }
  }

  async function onSaveProfile(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    try {
      await updateMyProfile({ name: f.get("name"), phone: f.get("phone") });
      alert("Perfil actualizado");
    } catch (err) {
      alert(err.message || "No se pudo actualizar el perfil");
    }
  }

  return (
    <div className="p-4 grid" style={{ gap: 16 }}>
      <header className="toolbar">
        <h2>Mi cuenta</h2>
        <div className="spacer" />
        <button className="button" onClick={() => { logoutUser(); nav("/"); }}>
          Cerrar sesión
        </button>
      </header>

      {/* Perfil */}
      <section className="card">
        <h3>Perfil</h3>
        <form className="grid two" onSubmit={onSaveProfile} style={{ gap: 12 }}>
          <label>Nombre
            <input className="input" name="name" defaultValue={session?.name || ""} />
          </label>
          <label>Teléfono
            <input className="input" name="phone" defaultValue={session?.phone || ""} />
          </label>
          <button className="button primary" type="submit">Guardar</button>
        </form>
      </section>

      {/* Mis reservas */}
      <section className="card">
        <div className="toolbar">
          <h3>Mis reservas</h3>
          <div className="spacer" />
          <button className="button" onClick={refresh}>Refrescar</button>
        </div>

        {loading && <div className="muted">Cargando…</div>}
        {error && <div className="muted" style={{ color: "crimson" }}>⚠ {error}</div>}

        {/* CANCHAS */}
        <h4 style={{ marginTop: 10 }}>Canchas</h4>
        <table className="table">
          <thead>
            <tr>
              <th>Cancha</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Notas</th>
              <th style={{ textAlign: "right" }}></th>
            </tr>
          </thead>
          <tbody>
            {canchas.map(r => (
              <tr key={`c-${r.id}`}>
                <td>{r.court || (r.courtId != null ? `#${r.courtId}` : "")}</td>
                <td>{fmtDate(r.startTime)}</td>
                <td>{fmtTime(r.startTime)}</td>
                <td>{r.notes || ""}</td>
                <td style={{ textAlign: "right" }}>
                  <button className="button btn-danger" onClick={() => onDelete(r.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
            {!loading && canchas.length === 0 && (
              <tr>
                <td colSpan="5" className="muted">
                  No tenés reservas de canchas. <Link to="/reservas">Reservar →</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* CLASES */}
        <h4 style={{ marginTop: 14 }}>Clases</h4>
        <table className="table">
          <thead>
            <tr>
              <th>Clase</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Notas</th>
              <th style={{ textAlign: "right" }}></th>
            </tr>
          </thead>
          <tbody>
            {clases.map(r => (
              <tr key={`cl-${r.id}`}>
                <td>{r.court || "Clase"}</td>
                <td>{fmtDate(r.startTime)}</td>
                <td>{fmtTime(r.startTime)}</td>
                <td>{r.notes || ""}</td>
                <td style={{ textAlign: "right" }}>
                  <button className="button btn-danger" onClick={() => onDelete(r.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
            {!loading && clases.length === 0 && (
              <tr>
                <td colSpan="5" className="muted">No tenés reservas de clases.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
