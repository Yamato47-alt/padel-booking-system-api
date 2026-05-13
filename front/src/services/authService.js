// src/services/authService.js
import api from "./api";

// === Claves reales que estás usando en LocalStorage ===
const KEY_TOKEN_MAIN = "padel_token";
const KEY_USER_MAIN  = "padel_user";

// Compat (por si en algún lado viejo quedó 'token'/'user')
const KEY_TOKEN_LEGACY = "token";
const KEY_USER_LEGACY  = "user";

// ---------- helpers ----------
function safeJsonParse(str) {
  try { return JSON.parse(str); } catch { return null; }
}

function base64urlToJson(str) {
  try {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '==='.slice((base64.length + 3) % 4);
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return {};
  }
}

function decodeJwt(token) {
  if (!token || typeof token !== "string") return {};
  const parts = token.split(".");
  if (parts.length !== 3) return {};
  return base64urlToJson(parts[1]);
}

function buildUserFromJwt(token) {
  const c = decodeJwt(token);
  if (!c || typeof c !== "object") return null;
  return {
    id: c.sub ? Number(c.sub) : (c.userId ?? null),
    email: c.email ?? "",
    username: c.username ?? c.unique_name ?? "",
    fullName: c.fullName ?? c.name ?? "",
    role: c.role ?? c.rol ?? "",
  };
}

// ---------- API ----------
export async function registerUser(fullName, email, password){
  const { data } = await api.post("/api/Auth/register", { fullName, email, password });
  return data; // { token, user } o { Token, User } según tu backend
}

export async function loginUser(identifier, password){
  const { data } = await api.post("/api/Auth/login", {
    usernameOrEmail: identifier,
    password
  });

  // tolerante a mayúsculas/minúsculas del backend
  const token = data.token ?? data.Token ?? data.accessToken ?? data.AccessToken;
  const user  = data.user  ?? data.User;

  if (!token) throw new Error("El backend no devolvió token en /api/Auth/login");

  localStorage.setItem(KEY_TOKEN_MAIN, token);
  if (user) localStorage.setItem(KEY_USER_MAIN, JSON.stringify(user));

  return user ?? buildUserFromJwt(token);
}

// alias de compat
export const login = loginUser;

export function logout(){
  // limpia todas las variantes
  [KEY_TOKEN_MAIN, KEY_USER_MAIN, KEY_TOKEN_LEGACY, KEY_USER_LEGACY, "session", "padel.session"]
    .forEach(k => localStorage.removeItem(k));
}

export function getToken(){
  // intenta primero las claves reales; si no, las legacy
  return (
    localStorage.getItem(KEY_TOKEN_MAIN) ||
    localStorage.getItem(KEY_TOKEN_LEGACY) ||
    null
  );
}

export function getAuthToken() { return getToken(); }

export function getAuthHeader() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export function getCurrentUser(){
  const rawMain = localStorage.getItem(KEY_USER_MAIN);
  const userMain = rawMain ? safeJsonParse(rawMain) : null;
  if (userMain) return userMain;

  const rawLegacy = localStorage.getItem(KEY_USER_LEGACY);
  const userLegacy = rawLegacy ? safeJsonParse(rawLegacy) : null;
  if (userLegacy) return userLegacy;

  const token = getToken();
  if (!token) return null;
  return buildUserFromJwt(token);
}

export function isLogged(){
  return !!getToken();
}

// admin helper
export async function loginAdmin(password) {
  const email = import.meta.env.VITE_ADMIN_EMAIL || "admin@padel.club";
  return await loginUser(email, password);
}
export const adminLogin = loginAdmin;
