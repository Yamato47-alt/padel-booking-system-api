import { useState } from "react";
import { registerUser } from "/src/services/authService.js";

export default function Register(){
  const [fullName, setFullName] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");

  async function onSubmit(e){
    e.preventDefault();
    setError("");
    try{
      const res = await registerUser(fullName, email, password);
      // opcional: guardar token de registro
      // localStorage.setItem("token", res.token);
      // localStorage.setItem("user", JSON.stringify(res.user));
      alert("Cuenta creada: " + res.user.username);
    }catch(err){
      // Muestra el mensaje real que devuelve la API
      const msg = err?.response?.data || err.message || "Error al registrar";
      console.error("register error:", err);
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid" style={{gap:8}}>
      <input value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Nombre completo" />
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Contraseña" />
      <button>Crear cuenta</button>
      {error && <div style={{color:"salmon"}}>{error}</div>}
    </form>
  );
}
