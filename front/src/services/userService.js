// src/services/userService.js

const KEY_USERS = "padel.users";
const KEY_SESSION = "padel.session";

/** Registra un nuevo usuario */
export function register({ name, email, phone, password }) {
  const users = JSON.parse(localStorage.getItem(KEY_USERS) || "[]");

  if (users.find((u) => u.email === email)) {
    throw new Error("El email ya está registrado");
  }

  const user = {
    id: crypto.randomUUID(),
    name: name?.trim() || "",
    email: email?.trim().toLowerCase(),
    phone: phone?.trim() || "",
    password, // solo guardado localmente
  };

  users.push(user);
  localStorage.setItem(KEY_USERS, JSON.stringify(users));

  // guarda sesión activa
  const session = { id: user.id, name: user.name, email: user.email, phone: user.phone };
  localStorage.setItem(KEY_SESSION, JSON.stringify(session));

  return session;
}

/** Inicia sesión (login) */
export function loginUser({ email, password }) {
  const users = JSON.parse(localStorage.getItem(KEY_USERS) || "[]");
  const u = users.find(
    (x) => x.email === email?.trim().toLowerCase() && x.password === password
  );

  if (!u) throw new Error("Credenciales inválidas");

  const session = { id: u.id, name: u.name, email: u.email, phone: u.phone };
  localStorage.setItem(KEY_SESSION, JSON.stringify(session));

  return session;
}

/** Cierra sesión */
export function logoutUser() {
  localStorage.removeItem(KEY_SESSION);
}

/** Devuelve la sesión actual (o null) */
export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(KEY_SESSION)) || null;
  } catch {
    return null;
  }
}

/** Devuelve todos los usuarios (solo para debug/admin local) */
export function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(KEY_USERS)) || [];
  } catch {
    return [];
  }
}

/** Actualiza nombre/teléfono del usuario actual */
export function updateMyProfile({ name, phone }) {
  const session = getSession();
  if (!session) return null;

  const users = getUsers().map((u) =>
    u.id === session.id ? { ...u, name: name ?? u.name, phone: phone ?? u.phone } : u
  );

  localStorage.setItem(KEY_USERS, JSON.stringify(users));

  const updated = { ...session, name: name ?? session.name, phone: phone ?? session.phone };
  localStorage.setItem(KEY_SESSION, JSON.stringify(updated));

  return updated;
}
