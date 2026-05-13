import api from './api'

export async function getCourts(){
  try {
    const { data } = await api.get('/api/Courts')
    return Array.isArray(data) ? data : []
  } catch (e) {
    console.error('getCourts error:', e)
    return [] // <-- evita undefined
  }
}
