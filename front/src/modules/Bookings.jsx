import { useState } from "react";
import { createReservation } from "@/services/reservationsService";

export default function Bookings() {
  const [type, setType] = useState("cancha");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  async function onSubmit(e) {
    e.preventDefault();

    try {
      // Fecha y hora actuales por si no se completan
      const todayYmd = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const nowHm = new Date().toTimeString().slice(0, 5); // HH:mm

      // Asignamos courtId por tipo
      const courtId = type === "clase" ? 2 : 1; // si usás solo una cancha podés dejarlo en 1

      // Construimos el input para la reserva
      const input = {
        courtId,
        date: date || todayYmd,
        time: time || nowHm,
        durationMinutes: 60,
        name: fullName || "—",
        notes: notes || "",
      };

      console.log("⏩ Enviando reserva:", input);
      const res = await createReservation(input);

      console.log("✅ Reserva creada:", res);
      alert("Reserva creada correctamente ✅");

      // Limpiamos el formulario después de reservar
      setFullName("");
      setPhone("");
      setDate("");
      setTime("");
      setNotes("");
    } catch (err) {
      console.error("❌ Error al crear reserva:", err);
      alert("Error al crear reserva: " + err.message);
    }
  }

  return (
    <div className="reserva-page" style={{ display: "flex", justifyContent: "center" }}>
      <form
        onSubmit={onSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          background: "#1a1f36",
          padding: "20px",
          borderRadius: "10px",
          width: "400px",
          color: "#fff",
        }}
      >
        <h2>Reservar</h2>

        <label>Tipo</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{ padding: "8px", borderRadius: "5px" }}
        >
          <option value="clase">Clase</option>
          <option value="cancha">Cancha</option>
        </select>

        <label>Nombre y apellido</label>
        <input
          type="text"
          placeholder="Tu nombre"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          style={{ padding: "8px", borderRadius: "5px" }}
        />

        <label>Teléfono / WhatsApp</label>
        <input
          type="text"
          placeholder="+54 9 ..."
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ padding: "8px", borderRadius: "5px" }}
        />

        <label>Fecha</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ padding: "8px", borderRadius: "5px" }}
        />

        <label>Hora</label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          style={{ padding: "8px", borderRadius: "5px" }}
        />

        <label>Notas</label>
        <textarea
          placeholder="Nivel, profesor preferido, etc."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ padding: "8px", borderRadius: "5px" }}
        ></textarea>

        <button
          type="submit"
          style={{
            background: "linear-gradient(to right, #00c6ff, #0072ff)",
            color: "white",
            padding: "10px",
            borderRadius: "5px",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Confirmar reserva
        </button>
      </form>

      <div
        className="tips"
        style={{
          marginLeft: "40px",
          padding: "20px",
          background: "rgba(255,255,255,0.05)",
          borderRadius: "10px",
          color: "#fff",
          maxWidth: "300px",
        }}
      >
        <h3>Tips</h3>
        <ul>
          <li>Recordá llegar 10 minutos antes</li>
          <li>Cancelaciones hasta 2 horas antes sin cargo</li>
          <li>Traé hidratación 💧</li>
          <li>Cancha Precio x H: $25000</li>
          <li>Clase individual: $ 35000</li>
        </ul>
      </div>
    </div>
  );
}
