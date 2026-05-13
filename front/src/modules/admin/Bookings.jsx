// src/modules/admin/Bookings.jsx
import { useState } from 'react'
import { createReservation } from '../../services/reservationsService.js'
import { getSession } from '../../services/userService.js'

export default function Bookings(){
  const [type, setType] = useState('cancha')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    if(!name || !phone || !date || !time) return alert('Completá todos los campos obligatorios')

    try {
      setLoading(true)
      const session = getSession()
      await createReservation({
        type,
        name: name || session?.name,
        phone: phone || session?.phone,
        email: session?.email || '',
        date, time, notes
      })
      alert('¡Reserva creada!')
      setName(''); setPhone(''); setDate(''); setTime(''); setNotes('')
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid two">
      <section className="card">
        <h3>Reservar</h3>
        <form className="grid" onSubmit={onSubmit} style={{gap:12}}>
          <label>Tipo
            <select value={type} onChange={e=>setType(e.target.value)}>
              <option value="cancha">Cancha</option>
              <option value="clase">Clase</option>
            </select>
          </label>
          <label>Nombre y apellido
            <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Tu nombre" />
          </label>
          <label>Teléfono / WhatsApp
            <input className="input" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+54 9 ..." />
          </label>
          <div className="grid two" style={{gap:12}}>
            <label>Fecha
              <input className="input" type="date" value={date} onChange={e=>setDate(e.target.value)} />
            </label>
            <label>Hora
              <input className="input" type="time" value={time} onChange={e=>setTime(e.target.value)} />
            </label>
          </div>
          <label>Notas
            <textarea className="input" rows="3" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Nivel, profesor preferido, etc."/>
          </label>

          <button className="button primary" type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Confirmar reserva'}
          </button>
        </form>
      </section>

      <section className="card">
        <h3>Tips</h3>
        <ul className="muted">
          <li>Recordá llegar 10 minutos antes</li>
          <li>Cancelaciones hasta 2 horas antes sin cargo</li>
          <li>Traé hidratación 🧴</li>
          <li>Cancha Precio x H: $25000</li>
          <li>Clase individual: $ 35000</li>
        </ul>
      </section>
    </div>
  )
}
