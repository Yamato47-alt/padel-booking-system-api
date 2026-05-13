// src/services/bookingsService.js
import api from "./api";

/** Normaliza una fecha cualquiera a 'YYYY-MM-DD' (zona local) */
function toYmd(d) {
  const dt = d instanceof Date ? d : new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Convierte Date o string aceptable a 'YYYY-MM-DDTHH:mm:ss' (local) */
function toLocalIsoNoMs(d) {
  const dt = d instanceof Date ? d : new Date(d);
  const pad = (n) => String(n).padStart(2, "0");
  const y = dt.getFullYear();
  const m = pad(dt.getMonth() + 1);
  const day = pad(dt.getDate());
  const hh = pad(dt.getHours());
  const mm = pad(dt.getMinutes());
  const ss = pad(dt.getSeconds());
  return `${y}-${m}-${day}T${hh}:${mm}:${ss}`;
}

/** Extrae mensaje de error del backend (si existe) */
function parseError(err) {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.response?.data?.error) return err.response.data.error;
  return err?.message || "Error desconocido";
}

/** Lista reservas. Si pasás date, filtra por ese día (YYYY-MM-DD). */
export async function listBookings(date) {
  try {
    const params = {};
    if (date) params.date = toYmd(date); // asegura YYYY-MM-DD
    const { data } = await api.get("/api/Bookings", { params });
    return Array.isArray(data) ? data : [];
  } catch (err) {
    throw new Error(`No se pudo listar reservas: ${parseError(err)}`);
  }
}

/** Obtiene una reserva por ID */
export async function getBooking(id) {
  if (id == null) throw new Error("Falta el ID de la reserva");
  try {
    const { data } = await api.get(`/api/Bookings/${id}`);
    return data;
  } catch (err) {
    throw new Error(`No se pudo obtener la reserva #${id}: ${parseError(err)}`);
  }
}

/**
 * Crea una reserva
 * input:
 * {
 *   courtId: number,
 *   startTime: Date | string (ISO o parseable), // requerido
 *   endTime: Date | string (ISO o parseable),   // requerido
 *   playerName?: string,
 *   playerPhone?: string,
 *   notes?: string
 * }
 */
export async function createBooking(input) {
  if (!input?.startTime) throw new Error("startTime es requerido");
  if (!input?.endTime) throw new Error("endTime es requerido");

  const payload = {
    courtId: input.courtId != null ? Number(input.courtId) : null,
    startTime:
      typeof input.startTime === "string"
        ? input.startTime
        : toLocalIsoNoMs(input.startTime),
    endTime:
      typeof input.endTime === "string"
        ? input.endTime
        : toLocalIsoNoMs(input.endTime),
    playerName: input.playerName ?? null,
    playerPhone: input.playerPhone ?? null,
    notes: input.notes ?? null,
  };

  try {
    const { data } = await api.post("/api/Bookings", payload);
    return data;
  } catch (err) {
    throw new Error(`No se pudo crear la reserva: ${parseError(err)}`);
  }
}

/**
 * Actualiza una reserva
 * Campos iguales a createBooking; solo envía los presentes en input
 */
export async function updateBooking(id, input) {
  if (id == null) throw new Error("Falta el ID de la reserva");

  const patch = {};
  if (input?.courtId != null) patch.courtId = Number(input.courtId);
  if (input?.startTime != null)
    patch.startTime =
      typeof input.startTime === "string"
        ? input.startTime
        : toLocalIsoNoMs(input.startTime);
  if (input?.endTime != null)
    patch.endTime =
      typeof input.endTime === "string"
        ? input.endTime
        : toLocalIsoNoMs(input.endTime);
  if (Object.prototype.hasOwnProperty.call(input ?? {}, "playerName"))
    patch.playerName = input.playerName;
  if (Object.prototype.hasOwnProperty.call(input ?? {}, "playerPhone"))
    patch.playerPhone = input.playerPhone;
  if (Object.prototype.hasOwnProperty.call(input ?? {}, "notes"))
    patch.notes = input.notes;

  try {
    const { data } = await api.put(`/api/Bookings/${id}`, patch);
    return data;
  } catch (err) {
    throw new Error(`No se pudo actualizar la reserva #${id}: ${parseError(err)}`);
  }
}

/** Elimina (o cancela) una reserva por ID */
export async function deleteBooking(id) {
  if (id == null) throw new Error("Falta el ID de la reserva");
  try {
    const { data } = await api.delete(`/api/Bookings/${id}`);
    return data ?? true;
  } catch (err) {
    throw new Error(`No se pudo eliminar la reserva #${id}: ${parseError(err)}`);
  }
}

/**
 * (Opcional) Lista canchas para combos/select
 * Ajustá la URL si en tu API es diferente.
 */
export async function listCourts() {
  try {
    const { data } = await api.get("/api/Courts");
    return Array.isArray(data) ? data : [];
  } catch (err) {
    throw new Error(`No se pudieron listar canchas: ${parseError(err)}`);
  }
}
