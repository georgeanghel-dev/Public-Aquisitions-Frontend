import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { PROCEDURE_TYPE_MENU } from './api.js'

// Global CSS
import './assets/global.css'

// ── Funcții globale compatibilitate Vue 2 → Vue 3 ──
window.$getRoleAll = () => {
  try {
    const data = JSON.parse(localStorage.getItem('roleData') || '{}')
    // Dacă role lipsește din roleData, îl extragem din JWT
    if (!data.role) {
      const token = localStorage.getItem('token') || ''
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const jwtRole = payload.userRoles?.find?.(r => r.userRoleStatus === 'active') || payload.userRoles?.[0]
        if (jwtRole?.role) {
          data.role = jwtRole.role
          data.institutionId = data.institutionId || jwtRole.institutionId || null
          data.departmentId = data.departmentId || jwtRole.departmentId || null
          data.userRoleId = data.userRoleId || jwtRole.id || null
        }
      }
    }
    return data
  } catch { return {} }
}

window.$getRoleToSend = () => {
  return window.$getRoleAll()?.role || ''
}

window.$toDateAndTime = (dateStr) => {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
  } catch { return dateStr }
}

window.$getUserInstitution = () => {
  return window.$getRoleAll()?.institutionId || null
}

const app = createApp(App)

app.use(router)
app.use(store)

// Încarcă tipurile de proceduri la boot (pentru sidebar Atribuire)
const token = localStorage.getItem('token')
if (token) {
  PROCEDURE_TYPE_MENU().then(res => res.json()).then(data => {
    if (Array.isArray(data?.data)) {
      const procedureTypes = {}
      data.data.forEach(el => {
        const key = el.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
        procedureTypes[key] = { name: el.name, id: el.id, count: el.count || 0 }
      })
      store.commit('SET_PROCEDURE_TYPES', procedureTypes)
    }
  }).catch(() => {})
}

app.mount('#app')
