<template>
  <div class="page">
    <!-- Breadcrumb -->
    <div class="page__breadcrumb">
      <router-link to="/"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></router-link>
      <span class="bc-sep">›</span><span>Acasă</span>
      <span class="bc-sep">›</span><span class="bc-cur">Profilul meu</span>
    </div>

    <div class="page__content">

      <!-- Hero card -->
      <div class="hero-card">
        <div class="hero-card__left">
          <div class="avatar-wrapper">
            <div class="avatar-circle" v-if="!avatarSrc">{{ initials }}</div>
            <img v-else :src="avatarSrc" class="avatar-img" alt="Avatar" />
            <label class="avatar-upload-btn" title="Schimbă poza">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              <input type="file" accept="image/*" @change="uploadAvatar" style="display:none" />
            </label>
          </div>
          <div class="hero-info">
            <div class="hero-name">{{ fullName }}</div>
            <div class="hero-role-wrap">
              <span class="role-pill">{{ roleLabel }}</span>
            </div>
            <div class="hero-meta">
              <span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,12 2,6"/></svg>
                {{ email }}
              </span>
              <span v-if="phone">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.72 6.72l1.06-1.06a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                {{ phone }}
              </span>
              <span>ID: {{ userId }}</span>
            </div>
          </div>
        </div>
        <div class="hero-stats">
          <div class="stat-box">
            <div class="stat-val">{{ allRoles.length }}</div>
            <div class="stat-lbl">Roluri</div>
          </div>
          <div class="stat-box">
            <div class="stat-val">{{ activeRolesCount }}</div>
            <div class="stat-lbl">Active</div>
          </div>
          <div class="stat-box">
            <div class="stat-val stat-val--sm">{{ institutionName || '—' }}</div>
            <div class="stat-lbl">Instituție</div>
          </div>
        </div>
      </div>

      <!-- Grid secțiuni -->
      <div class="sections-grid">

        <!-- Date personale -->
        <div class="section-card">
          <div class="section-card__header" @click="toggle('personal')">
            <div class="section-card__title">
              <div class="section-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
              Date personale
            </div>
            <svg class="chevron" :class="{ open: open.personal }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <div class="section-card__body" v-show="open.personal">
            <div class="form-row">
              <div class="form-group">
                <label>E-mail de corespondență</label>
                <input v-model="form.correspondenceEmail" type="email" class="f-input" placeholder="email@exemplu.ro" />
              </div>
              <div class="form-group">
                <label>Telefon</label>
                <input v-model="form.phone" type="tel" class="f-input" placeholder="+40 7xx xxx xxx" />
              </div>
            </div>
            <div class="form-group">
              <label>Username / E-mail de autentificare</label>
              <input :value="email" type="text" class="f-input f-input--disabled" disabled />
            </div>
            <div class="form-group">
              <label>Data creării contului</label>
              <input :value="registrationDate" type="text" class="f-input f-input--disabled" disabled />
            </div>
            <div class="section-card__actions">
              <button class="btn-save" @click="savePersonal" :disabled="savingPersonal || !personalChanged">
                <span v-if="!savingPersonal">Salvează modificările</span>
                <span v-else class="btn-spinner"></span>
              </button>
            </div>
            <div v-if="messages.personal" :class="['msg', messages.personal.type]">{{ messages.personal.text }}</div>
          </div>
        </div>



        <!-- Schimbă parola -->
        <div class="section-card">
          <div class="section-card__header" @click="toggle('parola')">
            <div class="section-card__title">
              <div class="section-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg></div>
              Schimbă parola
            </div>
            <svg class="chevron" :class="{ open: open.parola }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <div class="section-card__body" v-show="open.parola">
            <div class="pass-rules">
              Parola trebuie să conțină minimum 6 caractere: cel puțin o cifră, o minusculă, o majusculă și un caracter special ($, @, !, %, ^, *).
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Parola veche</label>
                <div class="pass-wrapper">
                  <input v-model="passForm.old" :type="showPass.old ? 'text' : 'password'" class="f-input" autocomplete="new-password" />
                  <button type="button" class="pass-eye" @click="showPass.old = !showPass.old"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
                </div>
              </div>
              <div class="form-group">
                <label>Parola nouă</label>
                <div class="pass-wrapper">
                  <input v-model="passForm.new" :type="showPass.new ? 'text' : 'password'" class="f-input" autocomplete="new-password" />
                  <button type="button" class="pass-eye" @click="showPass.new = !showPass.new"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
                </div>
                <span class="pass-err" v-if="passForm.new && !isValidPassword(passForm.new)">Parola nu este suficient de sigură.</span>
              </div>
            </div>
            <div class="form-group">
              <label>Confirmă parola nouă</label>
              <div class="pass-wrapper">
                <input v-model="passForm.confirm" :type="showPass.confirm ? 'text' : 'password'" class="f-input" autocomplete="new-password" />
                <button type="button" class="pass-eye" @click="showPass.confirm = !showPass.confirm"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
              </div>
              <span class="pass-err" v-if="passForm.confirm && passForm.new !== passForm.confirm">Parolele nu coincid.</span>
            </div>
            <div class="section-card__actions">
              <button class="btn-save" @click="savePassword" :disabled="savingPass || !isPasswordReady">
                <span v-if="!savingPass">Salvează parola</span>
                <span v-else class="btn-spinner"></span>
              </button>
            </div>
            <div v-if="messages.parola" :class="['msg', messages.parola.type]">{{ messages.parola.text }}</div>
          </div>
        </div>

        <!-- Roluri utilizator -->
        <div class="section-card section-card--full">
          <div class="section-card__header" @click="toggle('roluri')">
            <div class="section-card__title">
              <div class="section-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
              Roluri utilizator
            </div>
            <svg class="chevron" :class="{ open: open.roluri }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <div class="section-card__body" v-show="open.roluri">
            <div class="roles-table-wrap">
              <table class="roles-table">
                <thead>
                  <tr>
                    <th>#</th><th>Rol</th><th>Instituție</th><th>Structură organizatorică</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="!allRoles.length">
                    <td colspan="5" class="empty-row">Nu sunt roluri disponibile</td>
                  </tr>
                  <tr v-for="(r, i) in allRoles" :key="r.id" :class="{ 'row--active': r.isActive }">
                    <td class="td-nr">{{ i + 1 }}</td>
                    <td><span class="role-tag" :class="'role-tag--' + r.role">{{ formatRole(r.role) }}</span></td>
                    <td>{{ r.institutionName || '—' }}</td>
                    <td>{{ r.departmentName || '—' }}</td>
                    <td><span class="status-pill" :class="'status--' + r.userRoleStatus">{{ formatStatus(r.userRoleStatus) }}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const avatarSrc = ref(localStorage.getItem('USER_AVATAR_BASE64') || '')
const profileData = ref({ id: '', uuid: '', first_name: '', last_name: '', email: '', emailForCommunication: '', phone: '', createdAt: '', userRoles: [] })
const form = ref({ correspondenceEmail: '', phone: '' })
const originalForm = ref({ correspondenceEmail: '', phone: '' })
const passForm = ref({ old: '', new: '', confirm: '' })
const showPass = ref({ old: false, new: false, confirm: false })
const savingPersonal = ref(false)
const savingPass = ref(false)
const open = ref({ personal: true, parola: true, poza: true, roluri: true })
const messages = ref({ personal: null, parola: null, poza: null })

function getJwt() {
  try { const t = localStorage.getItem('token') || ''; return t ? JSON.parse(atob(t.split('.')[1])) : {} } catch { return {} }
}
const jwt = getJwt()
const roleData = computed(() => window.$getRoleAll?.() || {})

const fullName = computed(() => {
  const fn = profileData.value.first_name || jwt.first_name || ''
  const ln = profileData.value.last_name  || jwt.last_name  || ''
  return `${ln} ${fn}`.trim() || 'Utilizator'
})
const email    = computed(() => profileData.value.email || jwt.email || '—')
const uuid     = computed(() => profileData.value.uuid  || jwt.uuid  || '')
const userId   = computed(() => profileData.value.id    || jwt.id    || '—')
const phone    = computed(() => profileData.value.phone || '')
const institutionName = computed(() => roleData.value?.institution?.name || roleData.value?.institutionName || '')
const registrationDate = computed(() => {
  const d = profileData.value.createdAt; if (!d) return '—'
  try { const dt = new Date(d); return `${String(dt.getDate()).padStart(2,'0')}.${String(dt.getMonth()+1).padStart(2,'0')}.${dt.getFullYear()}` } catch { return d }
})
const initials = computed(() => fullName.value.split(' ').map(w => w[0]).join('').substring(0,2).toUpperCase() || '?')
const allRoles = computed(() => {
  const activeId = localStorage.getItem('activeRoleId')
  const roles = profileData.value.userRoles?.length ? profileData.value.userRoles : (jwt.userRoles || [])
  return roles.map(r => ({ ...r, isActive: activeId ? String(r.id) === String(activeId) : r.userRoleStatus === 'active' }))
})
const activeRolesCount = computed(() => allRoles.value.filter(r => r.userRoleStatus === 'active').length)
const roleLabel = computed(() => formatRole(roleData.value?.role || jwt.role || ''))
const personalChanged = computed(() => form.value.correspondenceEmail !== originalForm.value.correspondenceEmail || form.value.phone !== originalForm.value.phone)
const isPasswordReady = computed(() => passForm.value.old.trim().length >= 4 && isValidPassword(passForm.value.new) && passForm.value.new === passForm.value.confirm)

function toggle(key) { open.value[key] = !open.value[key] }
function isValidPassword(p) { return /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){6,}$/.test(p) }
function formatRole(role) {
  const map = { superadmin: 'Superadmin', admin_institutie: 'Admin instituție', responsabil_achizitii: 'Responsabil achiziții', supervizor_achizitii: 'Supervizor achiziții', responsabil_buget: 'Responsabil buget', sef_institutie: 'Șef instituție', angajat: 'Angajat', supervisor: 'Supervisor' }
  return map[role] || role || '—'
}
function formatStatus(s) {
  const map = { active: 'Activ', unconfirmed: 'Neconfirmat', disabled: 'Dezactivat' }
  return map[s] || s || '—'
}

function getHeaders() {
  const token = localStorage.getItem('token') || ''
  const r = window.$getRoleAll?.() || {}
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'conectx-userid-role': JSON.stringify({ id: r.userRoleId, institutionId: r.institutionId, departmentId: r.departmentId || null, role: r.role }) }
}

async function loadProfile() {
  try {
    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/'
    const res  = await fetch(`${BASE_URL}users/me/`, { headers: getHeaders() })
    const data = await res.json()
    if (data?.data?.result) {
      const me = data.data.result
      profileData.value = me
      form.value.correspondenceEmail = me.emailForCommunication || me.email || ''
      form.value.phone = me.phone || ''
      originalForm.value = { ...form.value }
    }
  } catch {
    form.value.correspondenceEmail = jwt.email || ''
    originalForm.value = { ...form.value }
  }
}

async function savePersonal() {
  savingPersonal.value = true; messages.value.personal = null
  try {
    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/'
    const body = {}
    if (form.value.correspondenceEmail !== originalForm.value.correspondenceEmail) body.emailForCommunication = form.value.correspondenceEmail
    if (form.value.phone !== originalForm.value.phone) body.phone = form.value.phone
    const res  = await fetch(`${BASE_URL}users/me`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify(body) })
    const data = await res.json()
    if (res.ok || data?.meta?.HttpStatusCode == 200) {
      originalForm.value = { ...form.value }
      messages.value.personal = { type: 'success', text: 'Datele personale au fost salvate.' }
    } else { messages.value.personal = { type: 'error', text: 'Salvarea a eșuat. Încercați din nou.' } }
  } catch { messages.value.personal = { type: 'error', text: 'Eroare de conexiune.' } }
  finally { savingPersonal.value = false }
}

async function savePassword() {
  savingPass.value = true; messages.value.parola = null
  try {
    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/'
    const res  = await fetch(`${BASE_URL}users/me`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify({ password: passForm.value.new, oldPassword: passForm.value.old }) })
    const data = await res.json()
    if (res.ok || data?.meta?.HttpStatusCode == 200) {
      passForm.value = { old: '', new: '', confirm: '' }
      messages.value.parola = { type: 'success', text: 'Parola a fost schimbată cu succes.' }
    } else {
      messages.value.parola = { type: 'error', text: data?.message?.includes('old') ? 'Parola veche este incorectă.' : 'Salvarea a eșuat.' }
    }
  } catch { messages.value.parola = { type: 'error', text: 'Eroare de conexiune.' } }
  finally { savingPass.value = false }
}

async function uploadAvatar(e) {
  const file = e.target.files[0]; if (!file) return

  // Preview instant local — indiferent de raspunsul backend
  const reader = new FileReader()
  reader.onload = ev => {
    const base64 = ev.target.result
    avatarSrc.value = base64
    localStorage.setItem('USER_AVATAR_BASE64', base64)
    window.dispatchEvent(new CustomEvent('user-avatar-updated', { detail: base64 }))
  }
  reader.readAsDataURL(file)

  // Upload la backend in background
  try {
    const formData = new FormData(); formData.append('file', file)
    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/'
    const token = localStorage.getItem('token') || ''
    const r = window.$getRoleAll?.() || {}
    const res = await fetch(`${BASE_URL}users/upload/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'conectx-userid-role': JSON.stringify({ id: r.userRoleId, institutionId: r.institutionId, departmentId: r.departmentId || null, role: r.role })
      },
      body: formData
    })
    if (res.ok) {
      messages.value.poza = { type: 'success', text: 'Poza de profil a fost salvată.' }
    } else {
      messages.value.poza = { type: 'success', text: 'Poza actualizată local. Sincronizare cu serverul în așteptare.' }
    }
  } catch {
    messages.value.poza = { type: 'success', text: 'Poza actualizată local. Verificați conexiunea pentru sincronizare.' }
  }
}

onMounted(loadProfile)
</script>

<style scoped>
.page { display: flex; flex-direction: column; height: 100%; font-family: 'Roboto', sans-serif; }
.page__breadcrumb { background: #1565C0; padding: 9px 24px; display: flex; align-items: center; gap: 6px; font-size: 12px; color: rgba(255,255,255,0.8); flex-shrink: 0; }
.page__breadcrumb a { color: rgba(255,255,255,0.8); text-decoration: none; }
.bc-sep { color: rgba(255,255,255,0.4); }
.bc-cur { color: white; font-weight: 500; }

.page__content { flex: 1; overflow-y: auto; padding: 24px; background: #F5F7FA; display: flex; flex-direction: column; gap: 20px; }

/* Hero */
.hero-card { background: white; border-radius: 12px; border: 1px solid #E8ECF0; padding: 28px 32px; display: flex; align-items: center; justify-content: space-between; gap: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.hero-card__left { display: flex; align-items: center; gap: 24px; }
.avatar-wrapper { position: relative; flex-shrink: 0; }
.avatar-circle { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #1565C0, #1E88E5); color: white; font-size: 26px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.avatar-circle--lg { width: 100px; height: 100px; font-size: 32px; }
.avatar-img { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid #E0E0E0; }
.avatar-img--lg { width: 100px; height: 100px; }
.avatar-upload-btn { position: absolute; bottom: 0; right: 0; width: 26px; height: 26px; border-radius: 50%; background: #1565C0; cursor: pointer; display: flex; align-items: center; justify-content: center; border: 2px solid white; transition: background 0.2s; }
.avatar-upload-btn:hover { background: #1976D2; }
.hero-name { font-size: 22px; font-weight: 700; color: #1a1a2e; margin-bottom: 6px; }
.hero-role-wrap { margin-bottom: 10px; }
.role-pill { display: inline-block; background: #E3F2FD; color: #1565C0; font-size: 12px; font-weight: 600; padding: 3px 12px; border-radius: 20px; }
.hero-meta { display: flex; flex-wrap: wrap; gap: 14px; font-size: 13px; color: #616161; }
.hero-meta span { display: flex; align-items: center; gap: 5px; }
.hero-stats { display: flex; gap: 12px; flex-shrink: 0; }
.stat-box { background: #F8FAFF; border: 1px solid #E3F2FD; border-radius: 10px; padding: 16px 20px; text-align: center; min-width: 80px; }
.stat-val { font-size: 20px; font-weight: 700; color: #1565C0; }
.stat-val--sm { font-size: 13px; font-weight: 600; }
.stat-lbl { font-size: 11px; color: #9e9e9e; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.5px; }

/* Grid */
.sections-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: stretch; }
.section-card--full { grid-column: 1 / -1; }
.section-card { background: white; border-radius: 10px; border: 1px solid #E8ECF0; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.05); }
.section-card__header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; cursor: pointer; user-select: none; transition: background 0.15s; }
.section-card__header:hover { background: #F8FAFF; }
.section-card__title { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 600; color: #1a1a2e; }
.section-icon { width: 32px; height: 32px; border-radius: 8px; background: #E3F2FD; color: #1565C0; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.chevron { color: #9e9e9e; transition: transform 0.2s; flex-shrink: 0; }
.chevron.open { transform: rotate(180deg); }
.section-card__body { padding: 0 20px 20px; border-top: 1px solid #F0F0F0; }

/* Form */
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.form-group { display: flex; flex-direction: column; gap: 5px; margin-top: 14px; }
.form-group label { font-size: 11px; font-weight: 600; color: #757575; text-transform: uppercase; letter-spacing: 0.5px; }
.f-input { padding: 9px 12px; border: 1.5px solid #E0E0E0; border-radius: 7px; font-size: 13px; font-family: 'Roboto', sans-serif; color: #1a1a2e; background: #fafafa; outline: none; transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box; width: 100%; }
.f-input:focus { border-color: #1565C0; background: white; box-shadow: 0 0 0 3px rgba(21,101,192,0.08); }
.f-input--disabled { background: #F5F5F5; color: #9e9e9e; cursor: not-allowed; }
.pass-wrapper { position: relative; }
.pass-eye { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #9e9e9e; padding: 4px; display: flex; align-items: center; }
.pass-eye:hover { color: #1565C0; }
.pass-err { font-size: 11px; color: #E53935; margin-top: 3px; }
.pass-rules { margin-top: 14px; padding: 10px 14px; background: #E3F2FD; border-radius: 7px; font-size: 12px; color: #1565C0; line-height: 1.5; }
.section-card__actions { margin-top: 18px; }
.btn-save { padding: 9px 22px; background: #1565C0; color: white; border: none; border-radius: 7px; font-size: 13px; font-weight: 600; font-family: 'Roboto', sans-serif; cursor: pointer; transition: background 0.2s; display: flex; align-items: center; justify-content: center; min-height: 38px; }
.btn-save:hover:not(:disabled) { background: #1976D2; }
.btn-save:disabled { opacity: 0.55; cursor: not-allowed; }
.btn-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }
.msg { margin-top: 12px; padding: 9px 14px; border-radius: 7px; font-size: 13px; }
.msg.success { background: #E8F5E9; color: #2E7D32; }
.msg.error   { background: #FFEBEE; color: #C62828; }

/* Avatar section */
.avatar-section { display: flex; align-items: center; gap: 24px; margin-top: 14px; }
.avatar-upload-area { display: flex; flex-direction: column; gap: 10px; }
.avatar-hint { font-size: 12px; color: #9e9e9e; margin: 0; }
.btn-upload { display: inline-flex; align-items: center; gap: 7px; padding: 9px 18px; background: #F5F7FA; border: 1.5px solid #E0E0E0; border-radius: 7px; font-size: 13px; font-weight: 500; color: #424242; cursor: pointer; transition: border-color 0.2s, background 0.2s; }
.btn-upload:hover { border-color: #1565C0; background: #E3F2FD; color: #1565C0; }

/* Roles table */
.roles-table-wrap { overflow-x: auto; margin-top: 4px; }
.roles-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.roles-table th { text-align: left; padding: 10px 14px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; color: #9e9e9e; background: #FAFAFA; border-bottom: 1px solid #F0F0F0; }
.roles-table td { padding: 11px 14px; border-bottom: 1px solid #F5F5F5; color: #333; }
.roles-table tr:last-child td { border-bottom: none; }
.roles-table tr.row--active td { background: #F0F7FF; }
.td-nr { color: #9e9e9e; font-size: 12px; width: 36px; }
.role-tag { display: inline-block; padding: 3px 10px; border-radius: 5px; font-size: 12px; font-weight: 600; background: #E3F2FD; color: #1565C0; }
.role-tag--superadmin { background: #E8F5E9; color: #2E7D32; }
.role-tag--admin_institutie { background: #F3E5F5; color: #7B1FA2; }
.status-pill { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
.status--active      { background: #E8F5E9; color: #2E7D32; }
.status--unconfirmed { background: #FFF8E1; color: #F57F17; }
.status--disabled    { background: #FFEBEE; color: #C62828; }
.empty-row { text-align: center; color: #9e9e9e; padding: 24px; }

@media (max-width: 900px) {
  .sections-grid { grid-template-columns: 1fr; }
  .hero-card { flex-direction: column; align-items: flex-start; }
  .form-row { grid-template-columns: 1fr; }
  .hero-stats { flex-wrap: wrap; }
}
</style>
