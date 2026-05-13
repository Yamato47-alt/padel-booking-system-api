// src/modules/admin/Admin.jsx
import { useEffect } from "react";
import { useReservations, deleteReservation } from "../../services/reservationsService.js";

// util chiquito: primer valor definido y no vacío
const pick = (...vals) => vals.find(v => v !== undefined && v !== null && v !== "");

export default function Admin() {
  // ⚠️ Para Admin queremos TODAS las reservas
  const { reservations, loading, error, refresh } = useReservations({ mine: false });

  useEffect(() => { /* el hook ya carga */ }, []);

  const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString() : "");
  const fmtTime = (iso) => (iso ? new Date(iso).toTimeString().slice(0, 5) : "");

  return (
    <div className="p-4">
      <div className="toolbar">
        <h2>Administración • Reservas</h2>
        <div className="spacer" />
        <button className="button" onClick={refresh}>Refrescar</button>
      </div>

      {loading && <div className="muted">Cargando…</div>}
      {error && <div className="muted" style={{ color: "crimson" }}>⚠ {error}</div>}

      <table className="table" style={{ marginTop: 12 }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Tipo</th>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Notas</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((r) => {
            // Soportar camelCase / PascalCase desde la API
            const id = pick(r.id, r.Id);
            const court = pick(r.court, r.Court, "");
            const startIso = pick(r.startTime, r.StartTime);
            const notes = pick(r.notes, r.Notes, "");

            // Tipo: Clase si el nombre de la cancha dice "clase" o si llega tipado
            const tipo =
              (pick(r.tipo, r.type, "") + "").toLowerCase() === "clase" ||
              (court + "").toLowerCase().includes("clase")
                ? "Clase"
                : "Cancha";

            // Nombre & Teléfono con fallbacks
            const nombre = pick(
              r.Nombre, r.nombre, r.User, r.user, r.userFullName, r.fullName, r.email, "-"
            );
            const telefono = pick(
              r.Telefono, r.telefono, r.userPhone, r.phone, "-"
            );

            return (
              <tr key={id}>
                <td>{id}</td>
                <td>{tipo}</td>
                <td>{nombre}</td>
                <td>{telefono}</td>
                <td>{fmtDate(startIso)}</td>
                <td>{fmtTime(startIso)}</td>
                <td>{notes}</td>
                <td style={{ textAlign: "right" }}>
                  <button
                    className="button btn-danger"
                    onClick={async () => {
                      if (!confirm("¿Eliminar reserva?")) return;
                      try {
                        await deleteReservation(id);
                        await refresh();
                      } catch (err) {
                        alert(err.message || "No se pudo eliminar");
                      }
                    }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            );
          })}
          {!loading && reservations.length === 0 && (
            <tr><td colSpan="8" className="muted">No hay reservas.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
