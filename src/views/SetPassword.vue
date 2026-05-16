<template>
  <div class="login-page">

    <!-- Stânga: Formular -->
    <div class="login-left">
      <div class="login-left__inner">

        <div class="app-logo">
          <div class="app-logo__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <div class="app-logo__text">
            <span class="app-logo__name">Achiziții <em>Publice</em></span>
            <span class="app-logo__tagline">PLATFORMĂ DE MANAGEMENT</span>
          </div>
        </div>

        <div class="login-header">
          <h1 class="login-title">{{ pageTitle }}</h1>
          <p class="login-subtitle">{{ pageSubtitle }}</p>
        </div>

        <!-- Token invalid / deja folosit -->
        <div v-if="invalidCode" class="login-error">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Acest link a expirat sau a fost deja folosit. Solicitați un link nou.
        </div>

        <form v-else @submit.prevent="submit" autocomplete="new-password" class="login-form">

          <!-- Email (readonly dacă vine din URL) -->
          <div class="field-group">
            <label class="field-label">Utilizator</label>
            <input
              v-model="email"
              type="email"
              class="field-input"
              :class="{ 'field-input--readonly': !!emailFromRoute }"
              :disabled="!!emailFromRoute"
              autocomplete="new-password"
            />
          </div>

          <!-- Parolă nouă -->
          <div class="field-group">
            <label class="field-label">Parola nouă</label>
            <div class="password-wrap">
              <input
                v-model="password"
                :type="showPass ? 'text' : 'password'"
                class="field-input"
                autocomplete="new-password"
                @copy.prevent @paste.prevent
              />
              <button type="button" class="btn-eye" @click="showPass = !showPass">
                <svg v-if="!showPass" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
            <!-- Indicator putere parolă -->
            <div class="strength-bar">
              <div class="strength-bar__segment" :class="strengthLevel >= 1 ? `strength-${strengthLevel}` : ''"></div>
              <div class="strength-bar__segment" :class="strengthLevel >= 2 ? `strength-${strengthLevel}` : ''"></div>
              <div class="strength-bar__segment" :class="strengthLevel >= 3 ? `strength-${strengthLevel}` : ''"></div>
              <div class="strength-bar__segment" :class="strengthLevel >= 4 ? `strength-${strengthLevel}` : ''"></div>
            </div>
            <span v-if="password && strengthLevel < 3" class="strength-hint">{{ strengthMessages[strengthLevel] }}</span>
          </div>

          <!-- Confirmare parolă -->
          <div class="field-group">
            <label class="field-label">Confirmă parola</label>
            <div class="password-wrap">
              <input
                v-model="passwordConfirm"
                :type="showPassConfirm ? 'text' : 'password'"
                class="field-input"
                autocomplete="new-password"
              />
              <button type="button" class="btn-eye" @click="showPassConfirm = !showPassConfirm">
                <svg v-if="!showPassConfirm" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
          </div>

          <div v-if="errorMessage" class="login-error">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {{ errorMessage }}
          </div>

          <div v-if="successMessage" class="login-success">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            {{ successMessage }}
          </div>

          <button v-if="!successMessage" type="submit" class="btn-login" :disabled="loading">
            <span v-if="!loading">{{ submitLabel }}</span>
            <span v-else class="btn-spinner"></span>
          </button>

          <div class="login-back">
            <router-link to="/login">Înapoi la autentificare</router-link>
          </div>

        </form>

      </div>
    </div>

    <!-- Dreapta -->
    <div class="login-right">
      <div class="login-right__card">
        <div class="process-item">
          <div class="process-item__icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <div class="process-item__text">
            <strong>Securitate</strong>
            <span>Parolă minimă 8 caractere, majusculă, cifră și caracter special</span>
          </div>
        </div>
        <div class="process-divider"></div>
        <div class="process-item">
          <div class="process-item__icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div class="process-item__text">
            <strong>Activare cont</strong>
            <span>După setarea parolei te poți autentifica imediat</span>
          </div>
        </div>
      </div>
      <div class="powered-by">
        <span>powered by</span>
        <img src="@/assets/media/conectx-light.webp" alt="ConectX" />
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ACTIVATE_ACCOUNT, PASSWORD_RESTORE, CHECK_PASSWORD_TOKEN } from '@/api.js'

const route = useRoute()
const router = useRouter()

const token = computed(() => route.params.token || null)
const emailFromRoute = computed(() => route.params.email || null)
// firstReset=true înseamnă activare cont prima dată (meta.firstReset)
const isFirstReset = computed(() => !!route.meta?.firstReset)

const email = ref(emailFromRoute.value || '')
const password = ref('')
const passwordConfirm = ref('')
const showPass = ref(false)
const showPassConfirm = ref(false)
const loading = ref(false)
const invalidCode = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const pageTitle = computed(() => isFirstReset.value ? 'Creare parolă nouă' : 'Resetare parolă')
const pageSubtitle = computed(() => isFirstReset.value
  ? 'Setați o parolă pentru a vă activa contul'
  : 'Introduceți noua parolă pentru contul dvs.')
const submitLabel = computed(() => isFirstReset.value ? 'Stabilește parola' : 'Setează parola')

const strengthMessages = {
  1: 'Parola trebuie să aibă minim 8 caractere.',
  2: 'Adaugă o majusculă, o cifră și un caracter special.',
  3: 'Parolă medie — mai adaugă un caracter special.',
}

const strengthLevel = computed(() => {
  const p = password.value
  if (!p) return 0
  if (/^(?=.{9,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*\W).*$/.test(p)) return 4
  if (/^(?=.{8,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*\W).*$/.test(p)) return 3
  if (/(?=.{8,}).*/.test(p)) return 2
  return 1
})

async function submit() {
  errorMessage.value = ''

  if (!email.value.trim()) {
    errorMessage.value = 'Introduceți adresa de email.'
    return
  }
  if (strengthLevel.value < 2) {
    errorMessage.value = strengthMessages[strengthLevel.value] || 'Parola este prea slabă.'
    return
  }
  if (password.value.trim() !== passwordConfirm.value.trim()) {
    errorMessage.value = 'Parolele nu coincid.'
    return
  }

  loading.value = true
  try {
    const api = isFirstReset.value ? ACTIVATE_ACCOUNT : PASSWORD_RESTORE
    const res = await api({ email: email.value.trim(), password: password.value, token: token.value })
    const data = await res.json()

    if (res.ok || data?.data !== undefined) {
      successMessage.value = isFirstReset.value
        ? 'Contul a fost activat. Vă puteți autentifica.'
        : 'Parola a fost resetată. Vă puteți autentifica.'
      setTimeout(() => router.push('/login'), 2500)
    } else {
      errorMessage.value = data?.message || 'Setarea parolei a eșuat. Încercați din nou.'
    }
  } catch {
    errorMessage.value = 'A apărut o eroare. Încercați din nou.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (!token.value || token.value.length !== 36) {
    router.push('/login')
    return
  }

  // Verifică dacă token-ul este încă valid
  try {
    const res = await CHECK_PASSWORD_TOKEN({ email: email.value, token: token.value })
    const data = await res.json()
    if (!res.ok || data?.statusCode === 401) {
      invalidCode.value = true
    }
  } catch {
    invalidCode.value = true
  }
})
</script>

<style scoped>
.login-page { display: flex; min-height: 100vh; font-family: 'Roboto', sans-serif; }

.login-left { flex: 0 0 50%; display: flex; align-items: center; justify-content: center; background: #ffffff; padding: 40px; }
.login-left__inner { width: 100%; max-width: 400px; display: flex; flex-direction: column; gap: 28px; }

.app-logo { display: flex; align-items: center; gap: 12px; }
.app-logo__icon { width: 40px; height: 40px; background: linear-gradient(135deg, #1565C0, #1E88E5); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.app-logo__text { display: flex; flex-direction: column; gap: 2px; }
.app-logo__name { font-size: 17px; font-weight: 700; color: #1a1a2e; letter-spacing: -0.3px; line-height: 1.1; }
.app-logo__name em { color: #1565C0; font-style: normal; }
.app-logo__tagline { font-size: 10px; color: #9e9e9e; letter-spacing: 0.5px; }

.login-header { display: flex; flex-direction: column; gap: 4px; }
.login-title { font-size: 26px; font-weight: 700; color: #1a1a2e; margin: 0; letter-spacing: -0.5px; }
.login-subtitle { font-size: 14px; color: #757575; margin: 0; }

.login-form { display: flex; flex-direction: column; gap: 18px; }
.field-group { display: flex; flex-direction: column; gap: 5px; }
.field-label { font-size: 11px; font-weight: 600; color: #616161; text-transform: uppercase; letter-spacing: 0.5px; }
.field-input { width: 100%; padding: 11px 14px; border: 1.5px solid #E0E0E0; border-radius: 8px; font-size: 14px; font-family: 'Roboto', sans-serif; color: #1a1a2e; background: #fafafa; transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box; outline: none; }
.field-input:focus { border-color: #1565C0; background: #fff; box-shadow: 0 0 0 3px rgba(21,101,192,0.1); }
.field-input--readonly { background: #f0f0f0; color: #757575; cursor: not-allowed; }

.password-wrap { position: relative; }
.password-wrap .field-input { padding-right: 42px; }
.btn-eye { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #9e9e9e; display: flex; align-items: center; padding: 0; }
.btn-eye:hover { color: #1565C0; }

.strength-bar { display: flex; gap: 4px; margin-top: 6px; }
.strength-bar__segment { flex: 1; height: 4px; border-radius: 2px; background: #E0E0E0; transition: background 0.2s; }
.strength-1 { background: #E53935; }
.strength-2 { background: #FB8C00; }
.strength-3 { background: #FDD835; }
.strength-4 { background: #43A047; }
.strength-hint { font-size: 11px; color: #757575; margin-top: 3px; }

.login-error { display: flex; align-items: center; gap: 8px; padding: 11px 14px; background: #FFEBEE; border: 1px solid #FFCDD2; border-radius: 8px; color: #C62828; font-size: 13px; }
.login-success { display: flex; align-items: center; gap: 8px; padding: 11px 14px; background: #E8F5E9; border: 1px solid #C8E6C9; border-radius: 8px; color: #2E7D32; font-size: 13px; }

.btn-login { width: 100%; padding: 13px; background: #1565C0; color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; font-family: 'Roboto', sans-serif; cursor: pointer; transition: background 0.2s; display: flex; align-items: center; justify-content: center; min-height: 48px; }
.btn-login:hover:not(:disabled) { background: #1976D2; }
.btn-login:disabled { opacity: 0.7; cursor: not-allowed; }
.btn-spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }

.login-back { text-align: center; font-size: 13px; color: #757575; }
.login-back a { color: #1565C0; text-decoration: none; font-weight: 500; }
.login-back a:hover { text-decoration: underline; }

.login-right { flex: 0 0 50%; background: linear-gradient(135deg, #1565C0 0%, #1976D2 60%, #1E88E5 100%); display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; padding: 48px 56px; }
.login-right::before { content: ''; position: absolute; width: 400px; height: 400px; border-radius: 50%; background: rgba(255,255,255,0.05); top: -120px; right: -100px; }
.login-right::after { content: ''; position: absolute; width: 250px; height: 250px; border-radius: 50%; background: rgba(255,255,255,0.05); bottom: -80px; left: -60px; }
.login-right__card { position: relative; z-index: 1; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); border-radius: 20px; padding: 52px 56px; width: 100%; max-width: 560px; }
.process-item { display: flex; align-items: center; gap: 20px; }
.process-item__icon { width: 60px; height: 60px; background: rgba(255,255,255,0.15); border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.process-item__text { display: flex; flex-direction: column; gap: 3px; }
.process-item__text strong { color: white; font-size: 20px; font-weight: 600; }
.process-item__text span { color: rgba(255,255,255,0.65); font-size: 15px; line-height: 1.4; }
.process-divider { border-top: 1px solid rgba(255,255,255,0.15); margin: 32px 0; }
.powered-by { position: absolute; bottom: 16px; right: 20px; z-index: 1; display: flex; align-items: center; gap: 7px; }
.powered-by span { font-size: 10px; color: rgba(255,255,255,0.7); font-style: italic; }
.powered-by img { height: 18px; width: auto; }

@media (max-width: 768px) {
  .login-page { flex-direction: column; }
  .login-right { flex: 0 0 auto; padding: 32px 24px 40px; }
  .login-left { flex: 1; padding: 32px 24px; }
}
</style>
