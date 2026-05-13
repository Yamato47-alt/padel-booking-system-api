// src/services/reservationsService.js
import api from "./api";
import { useEffect, useState, useCallback } from "react";

// ---------- utils ----------
function parseError(err) {
  // Mensaje más claro cuando hay conflicto de horario
  if (err?.response?.status === 409) {
    return "Ese horario ya está reservado para esa cancha.";
  }
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.response?.data?.error) return err.response.data.error;
  return err?.message || "Error desconocido";
}

function pad(n) { return String(n).padStart(2, "0"); }

/** Devuelve 'YYYY-MM-DDTHH:mm:ss' (hora local) */
function buildLocalIso(y, m, d, hh, mm, ss = 0) {
  const dt = new Date(y, m - 1, d, hh, mm, ss);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`;
}

/** Convierte 'YYYY-MM-DD' + 'HH:mm' => ISO local sin ms */
function toLocalIsoNoMs(date, time) {
  const [y, m, d] = (date || "").split("-").map(Number);
  const [hh, mm] = (time || "").split(":").map(Number);
  return buildLocalIso(y, m, d, hh, mm, 0);
}

/** Suma minutos a una ISO local 'YYYY-MM-DDTHH:mm:ss' sin Z */
function addMinutesIsoLocal(isoLocal, minutes = 60) {
  // formato esperado: 'YYYY-MM-DDTHH:mm:ss'
  const y = Number(isoLocal.slice(0, 4));
  const m = Number(isoLocal.slice(5, 7));
  const d = Number(isoLocal.slice(8, 10));
  const hh = Number(isoLocal.slice(11, 13));
  const mm = Number(isoLocal.slice(14, 16));
  const ss = Number(isoLocal.slice(17, 19));
  const base = new Date(y, m - 1, d, hh, mm, ss);
  const end = new Date(base.getTime() + (Number(minutes) || 60) * 60 * 1000);
  return buildLocalIso(
    end.getFullYear(),
    end.getMonth() + 1,
    end.getDate(),
    end.getHours(),
    end.getMinutes(),
    end.getSeconds()
  );
}

// ---------- API REAL (/api/Bookings) ----------
/**
 * Crea una reserva en el backend real.
 * Requiere: courtId (int), startTime (ISO), endTime (ISO).
 * También envía customerName y customerPhone para que el backend
 * actualice el perfil del usuario (FullName / Phone).
 *
 * Params esperados (input):
 *  - date: 'YYYY-MM-DD'
 *  - time: 'HH:mm'
 *  - notes: string
 *  - name | fullName | customerName: string (cualquiera de esos)
 *  - phone | telefono | customerPhone: string (cualquiera de esos)
 *  - courtId?: number
 *  - durationMinutes?: number (default 60)
 *  - type?: 'Cancha' | 'Clase' (si es 'Clase' usa COURT_ID_FOR_CLASS)
 */
export async function createReservation(input) {
  const {
    date,
    time,
    notes,
    courtId,
    durationMinutes,
    type,

    // nombres alternativos que puede mandar el form
    name,
    fullName,
    customerName,

    // teléfonos alternativos que puede mandar el form
    phone,
    telefono,
    customerPhone,
  } = input || {};

  if (!date || !time) throw new Error("Fecha y hora son requeridas");

  // 1) Normalizo fecha/hora
  const startTime = toLocalIsoNoMs(date, time);
  const minutes = Math.max(1, Number(durationMinutes ?? 60)); // mínimo 1'
  const endTime = addMinutesIsoLocal(startTime, minutes);

  // 2) Resolver courtId según tipo (Clase usa court propio para evitar solapes con Cancha)
  const COURT_ID_FOR_CLASS = Number(import.meta.env.VITE_COURT_ID_CLASS ?? 99); // asegurate que exista ese Court en DB
  const DEFAULT_COURT_ID   = Number(import.meta.env.VITE_DEFAULT_COURT_ID ?? 1);

  const isClass =
    typeof type === "string" &&
    ["clase", "class", "lesson"].includes(type.trim().toLowerCase());

  const resolvedCourtId = isClass
    ? COURT_ID_FOR_CLASS
    : Number(courtId ?? DEFAULT_COURT_ID);

  if (!Number.isFinite(resolvedCourtId)) {
    throw new Error("courtId inválido.");
  }

  // 3) Tomo nombre/teléfono con tolerancia a distintos nombres de campo
  const resolvedName  = (customerName ?? fullName ?? name ?? "").trim();
  const resolvedPhone = (customerPhone ?? telefono ?? phone ?? "").trim();

  // 4) Payload a la API
  const payload = {
    courtId: resolvedCourtId,
    startTime,
    endTime,
    notes: notes ?? "",
    // estos dos campos los usa el controller para actualizar Users
    customerName: resolvedName || undefined,
    customerPhone: resolvedPhone || undefined,
  };

  try {
    const { data } = await api.post("/api/Bookings", payload);
    return data;
  } catch (err) {
    throw new Error(`No se pudo crear la reserva: ${parseError(err)}`);
  }
}

/** Todas las reservas (admin) */
export async function listReservations() {
  try {
    const { data } = await api.get("/api/Bookings");
    return Array.isArray(data) ? data : [];
  } catch (err) {
    throw new Error(`No se pudieron listar reservas: ${parseError(err)}`);
  }
}

/** Solo mis reservas (usuario autenticado) */
export async function listMyReservations() {
  try {
    const { data } = await api.get("/api/Bookings/mine");
    return Array.isArray(data) ? data : [];
  } catch (err) {
    throw new Error(`No se pudieron obtener tus reservas: ${parseError(err)}`);
  }
}

/** Eliminar una reserva por id */
export async function deleteReservation(id) {
  if (id == null) throw new Error("id es requerido");
  try {
    await api.delete(`/api/Bookings/${id}`);
    return true;
  } catch (err) {
    throw new Error(`No se pudo eliminar la reserva #${id}: ${parseError(err)}`);
  }
}

// ---------- Hook (compat con Account.jsx) ----------
/**
 * Por defecto trae SOLO las del usuario (/api/Bookings/mine).
 * Si pasás { mine:false } trae todas (/api/Bookings).
 */
export function useReservations(options = { mine: true }) {
  const mine = options?.mine !== false;
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = mine ? await listMyReservations() : await listReservations();
      setReservations(Array.isArray(data) ? data : []);
    } catch (err) {
      setReservations([]);
      setError(err.message || "No se pudo cargar");
    } finally {
      setLoading(false);
    }
  }, [mine]);

  useEffect(() => { load(); }, [load]);

  return { reservations, loading, error, refresh: load };
}

// ---------- compat con código viejo ----------
export async function getAll() {
  return listReservations();
}
