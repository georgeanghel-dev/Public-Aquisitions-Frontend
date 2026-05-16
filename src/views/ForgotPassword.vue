<template>
  <div class="login-page">

    <!-- Stânga: Formular -->
    <div class="login-left">
      <div class="login-left__inner">

        <div class="app-logo">
          <div class="app-logo__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <div class="app-logo__text">
            <span class="app-logo__name">Achiziții <em>Publice</em></span>
            <span class="app-logo__tagline">PLATFORMĂ DE MANAGEMENT</span>
          </div>
        </div>

        <div class="login-header">
          <h1 class="login-title">Resetare parolă</h1>
          <p class="login-subtitle">Introduceți adresa de email asociată contului</p>
        </div>

        <form @submit.prevent="submitForm" autocomplete="off" class="login-form">

          <div class="field-group">
            <label for="email" class="field-label">Email</label>
            <input
              id="email"
              v-model.trim="email"
              type="email"
              class="field-input"
              autocomplete="off"
              required
              @focus="errorMessage = ''; successMessage = ''"
            />
          </div>

          <div v-if="errorMessage" class="login-error">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {{ errorMessage }}
          </div>

          <div v-if="successMessage" class="login-success">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            {{ successMessage }}
          </div>

          <button type="submit" class="btn-login" :disabled="apiLoading">
            <span v-if="!apiLoading">Trimite link de resetare</span>
            <span v-else class="btn-spinner"></span>
          </button>

          <div class="login-back">
            Ți-ai amintit parola?
            <router-link to="/login">Autentifică-te</router-link>
          </div>

        </form>

      </div>
    </div>

    <!-- Dreapta -->
    <div class="login-right">
      <div class="login-right__card">

        <div class="process-item">
          <div class="process-item__icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div class="process-item__text">
            <strong>Planificare</strong>
            <span>PAAP, referate de necesitate, bugete</span>
          </div>
        </div>

        <div class="process-divider"></div>

        <div class="process-item">
          <div class="process-item__icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div class="process-item__text">
            <strong>Achiziție / Atribuire</strong>
            <span>Proceduri, documente, furnizori</span>
          </div>
        </div>

        <div class="process-divider"></div>

        <div class="process-item">
          <div class="process-item__icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </div>
          <div class="process-item__text">
            <strong>Monitorizare</strong>
            <span>Rapoarte, contracte, urmărire</span>
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
import { ref } from 'vue'
import { REQUEST_PASSWORD_RESET } from '@/api.js'

const email = ref('')
const apiLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function submitForm() {
  errorMessage.value = ''
  successMessage.value = ''
  if (!email.value.trim()) {
    errorMessage.value = 'Introduceți adresa de email.'
    return
  }
  apiLoading.value = true
  try {
    await REQUEST_PASSWORD_RESET(email.value.trim())
    successMessage.value = 'Un email cu instrucțiuni a fost trimis dacă adresa există în sistem.'
    email.value = ''
  } catch {
    errorMessage.value = 'A apărut o eroare. Încercați din nou.'
  } finally {
    apiLoading.value = false
  }
}
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

.login-error { display: flex; align-items: center; gap: 8px; padding: 11px 14px; background: #FFEBEE; border: 1px solid #FFCDD2; border-radius: 8px; color: #C62828; font-size: 13px; }
.login-success { display: flex; align-items: center; gap: 8px; padding: 11px 14px; background: #E8F5E9; border: 1px solid #C8E6C9; border-radius: 8px; color: #2E7D32; font-size: 13px; }

.btn-login { width: 100%; padding: 13px; background: #1565C0; color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; font-family: 'Roboto', sans-serif; cursor: pointer; transition: background 0.2s, box-shadow 0.2s, transform 0.1s; display: flex; align-items: center; justify-content: center; min-height: 48px; }
.btn-login:hover:not(:disabled) { background: #1976D2; box-shadow: 0 4px 12px rgba(21,101,192,0.3); transform: translateY(-1px); }
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
.process-item__icon svg { width: 26px; height: 26px; }
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
