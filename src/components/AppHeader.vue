<template>
  <header class="app-header">
    <!-- Logo -->
    <router-link to="/" class="app-logo">
      <div class="app-logo__icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
      </div>
      <div class="app-logo__text">
        <span class="app-logo__name">Achiziții <em>Publice</em></span>
        <span class="app-logo__tagline">PLATFORMĂ DE MANAGEMENT</span>
      </div>
    </router-link>

    <div class="app-header__spacer"></div>

    <!-- Notificări — ascuns pentru superadmin -->
    <router-link v-if="userRole !== 'superadmin'" to="/notificari" class="header-notif">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
      </svg>
      <span v-if="notifCount > 0" class="header-notif__badge">{{ notifCount }}</span>
    </router-link>

    <!-- User dropdown -->
    <div class="header-user" @click="toggleDropdown" ref="userMenuRef">
      <div class="header-user__info">
        <span class="header-user__name">{{ userName }}</span>
        <span class="header-user__role">{{ userRole }} · ID: {{ userId }}</span>
      </div>
      <div class="header-user__avatar">
        <img v-if="userAvatar" :src="userAvatar" class="header-avatar-img" alt="Avatar" />
        <span v-else>{{ userInitials }}</span>
      </div>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>

      <!-- Dropdown -->
      <div v-if="dropdownOpen" class="header-dropdown" @click.stop>

        <div class="header-dropdown__header">
          {{ identities.length }} Identit{{ identities.length === 1 ? 'ate' : 'ăți' }} disponibil{{ identities.length === 1 ? 'ă' : 'e' }}
        </div>

        <div
          v-for="identity in identities"
          :key="identity.id"
          class="header-dropdown__identity"
          :class="{ active: identity.isActive }"
          @click="selectIdentity(identity)"
        >
          <div class="identity-avatar">{{ getInitials(identity.name) }}</div>
          <span class="identity-name">{{ identity.name }}</span>
          <svg v-if="identity.isActive" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1565C0" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left:auto; flex-shrink:0;">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>

        <div class="header-dropdown__divider"></div>

        <!-- Profil utilizator -->
        <router-link to="/profil" class="header-dropdown__item" @click="dropdownOpen = false">
          <div class="dropdown-item__icon dropdown-item__icon--blue">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1565C0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <span class="dropdown-item__label dropdown-item__label--blue">Profil</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left:auto;">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </router-link>

        <div class="header-dropdown__divider"></div>

        <!-- Deconectare -->
        <button class="header-dropdown__item header-dropdown__item--btn" @click="logout">
          <div class="dropdown-item__icon dropdown-item__icon--red">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E53935" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </div>
          <span class="dropdown-item__label dropdown-item__label--red">Deconectare</span>
        </button>

      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const router = useRouter()
const store = useStore()

const dropdownOpen = ref(false)
const userMenuRef = ref(null)
const notifCount = ref(0)
const userAvatar = ref(localStorage.getItem('USER_AVATAR_BASE64') || '')

const onAvatarUpdated = (e) => {
  userAvatar.value = e.detail || localStorage.getItem('USER_AVATAR_BASE64') || ''
}

const userName = computed(() => {
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token') || ''
    if (!token) return 'Utilizator'
    const p = JSON.parse(atob(token.split('.')[1]))
    return `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.email || 'Utilizator'
  } catch { return 'Utilizator' }
})
const userRole = computed(() => window.$getRoleAll?.()?.role || '')
const userId   = computed(() => {
  try {
    const token = localStorage.getItem('token') || ''
    if (!token) return ''
    return JSON.parse(atob(token.split('.')[1]))?.id || ''
  } catch { return '' }
})
const userInitials = computed(() => getInitials(userName.value))

const identities = ref([])

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
}

// Populează identitățile din JWT (userRoles) — identic cu codul vechi
function loadIdentities() {
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token') || ''
    if (!token) return
    const payload = JSON.parse(atob(token.split('.')[1]))
    const roles = payload?.userRoles || []
    const activeId = localStorage.getItem('activeRoleId')
    
    identities.value = roles.map(r => ({
      id:       r.id,
      name:     r.role || r.roleName || 'Rol necunoscut',
      roleName: r.role,
      isActive: activeId ? String(r.id) === String(activeId) : (r.userRoleStatus === 'active'),
      raw:      r,
    }))
  } catch (e) {
    console.error('loadIdentities:', e)
  }
}

function toggleDropdown() {
  loadIdentities()   // reîncarcă la fiecare deschidere
  dropdownOpen.value = !dropdownOpen.value
}

function selectIdentity(identity) {
  // Schimbă rolul activ
  localStorage.setItem('activeRoleId', identity.id)
  // Actualizează roleData pentru $getRoleAll
  try {
    const rd = window.$getRoleAll?.() || {}
    const newRd = {
      ...rd,
      id:            identity.id,
      role:          identity.roleName,
      userRoleId:    identity.id,
      institutionId: identity.raw?.institutionId || null,
      departmentId:  identity.raw?.departmentId  || null,
    }
    localStorage.setItem('roleData', JSON.stringify(newRd))
  } catch {}
  identities.value.forEach(i => i.isActive = i.id === identity.id)
  dropdownOpen.value = false
  window.location.reload()
}

function logout() {
  store.dispatch('logout')
  localStorage.clear()
  sessionStorage.clear()
  router.push('/login')
}

function handleClickOutside(e) {
  if (userMenuRef.value && !userMenuRef.value.contains(e.target)) {
    dropdownOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
onMounted(() => {
  window.addEventListener('user-avatar-updated', onAvatarUpdated)
})
onUnmounted(() => {
  window.removeEventListener('user-avatar-updated', onAvatarUpdated)
})
</script>
<style scoped>
.app-header {
  background: #1565C0;
  display: flex;
  align-items: center;
  padding: 0 20px;
  height: 64px;
  flex-shrink: 0;
  gap: 16px;
  position: relative;
  z-index: 200;
}

.app-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
}

.app-logo__icon {
  width: 34px; height: 34px;
  background: rgba(255,255,255,0.2);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.app-logo__text { display: flex; flex-direction: column; }
.app-logo__name { font-size: 15px; font-weight: 700; color: white; letter-spacing: -0.3px; line-height: 1.1; }
.app-logo__name em { color: rgba(255,255,255,0.75); font-style: normal; }
.app-logo__tagline { font-size: 11px; color: rgba(255,255,255,0.6); letter-spacing: 0.5px; margin-top: 3px; }

.app-header__spacer { flex: 1; }

.header-notif {
  position: relative;
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  transition: background 0.15s;
  flex-shrink: 0;
}
.header-notif:hover { background: rgba(255,255,255,0.1); }
.header-notif__badge {
  position: absolute; top: 4px; right: 4px;
  background: #E53935; color: white;
  font-size: 10px; font-weight: 700;
  width: 16px; height: 16px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}

.header-user {
  display: flex; align-items: center; gap: 10px;
  cursor: pointer; padding: 6px 10px;
  border-radius: 8px;
  transition: background 0.15s;
  position: relative;
  flex-shrink: 0;
}
.header-user:hover { background: rgba(255,255,255,0.1); }

.header-user__info { text-align: right; }
.header-user__name { display: block; font-size: 14px; font-weight: 600; color: white; line-height: 1.2; }
.header-user__role { display: block; font-size: 12px; color: rgba(255,255,255,0.75); }

.header-user__avatar {
  width: 52px; height: 52px;
  border-radius: 50%;
  background: #0D47A1;
  border: 2px solid rgba(255,255,255,0.3);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 700; color: white;
  flex-shrink: 0;
  overflow: hidden;
}

.header-avatar-img {
  width: 100%; height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

/* Dropdown */
.header-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border-radius: 12px;
  border: 0.5px solid #E0E0E0;
  width: 270px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  z-index: 99999;
  overflow: hidden;
}

.header-dropdown__header {
  padding: 12px 16px;
  font-size: 11px;
  font-weight: 600;
  color: #9e9e9e;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: #FAFAFA;
  border-bottom: 1px solid #F0F0F0;
}

.header-dropdown__identity {
  display: flex; align-items: center; gap: 10px;
  padding: 11px 16px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #F5F5F5;
}
.header-dropdown__identity:last-child { border-bottom: none; }
.header-dropdown__identity:hover { background: #F5F7FA; }
.header-dropdown__identity.active { background: #EFF5FF; }

.identity-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: #1565C0; color: white;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; flex-shrink: 0;
}
.identity-name { font-size: 13px; color: #1a1a2e; flex: 1; }

.header-dropdown__divider { border: none; border-top: 1px solid #F0F0F0; margin: 0; }

.header-dropdown__logout {
  display: flex; align-items: center; gap: 10px;
  width: 100%; padding: 12px 16px;
  background: none; border: none; cursor: pointer;
  font-size: 13px; color: #E53935;
  transition: background 0.15s;
}
.header-dropdown__logout:hover { background: #FFF5F5; }

.header-dropdown__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 16px;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #F5F5F5;
  width: 100%;
  text-align: left;
  background: none;
  border-left: none;
  border-right: none;
  border-top: none;
  font-family: 'Roboto', sans-serif;
}
.header-dropdown__item:last-child { border-bottom: none; }
.header-dropdown__item:hover { background: #F5F7FA; }
.header-dropdown__item--btn { border: none; }

.dropdown-item__icon {
  width: 30px; height: 30px;
  border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.dropdown-item__icon--blue { background: #E3F2FD; color: #1565C0; }
.dropdown-item__icon--red  { background: #FFEBEE; color: #E53935; }

.dropdown-item__label {
  font-size: 13px;
  font-weight: 500;
  flex: 1;
}
.dropdown-item__label--blue { color: #1565C0; }
.dropdown-item__label--red  { color: #E53935; }
</style>
