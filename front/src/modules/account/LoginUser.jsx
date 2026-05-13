import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api.js";

export default function LoginUser() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/api/Auth/login", {
        usernameOrEmail: email,
        password,
      });
      console.log("Login OK:", data);

      // 1) token para Authorization
      if (data?.token) localStorage.setItem("padel_token", data.token);

      // 2) sesión con la misma clave que lee el front: "padel.session"
      const u = data?.user || {};
      const session = {
        id: u.id ?? u.userId ?? null,
        name: u.fullName || u.name || u.username || "",
        email: u.email || "",
        phone: u.phone || "",
        role: u.role || u.roleName || "User",
      };
      localStorage.setItem("padel.session", JSON.stringify(session));

      // 3) listo: a /cuenta
      nav("/cuenta", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Error al iniciar sesión";
      alert(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 fade-in">
      <h2>Iniciar sesión</h2>
      <form onSubmit={onSubmit} className="grid" style={{ gap: 10, maxWidth: 380, margin: "20px auto" }}>
        <input
          placeholder="Correo electrónico o usuario"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
          required
        />
        <input
          placeholder="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
          required
        />
        <button className="button primary" type="submit" disabled={loading}>
          {loading ? "Ingresando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
