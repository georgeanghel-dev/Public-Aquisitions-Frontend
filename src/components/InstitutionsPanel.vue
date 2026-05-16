<template>
  <div class="panel">

    <!-- Role badge -->
    <div class="panel__role">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
      {{ roleLabel }}
    </div>

    <div v-if="action === 'create'" class="panel__counter">
      Total instituții: {{ options.totalRecords }}
    </div>

    <!-- Logo upload cu cropper -->
    <div class="panel__logo-section">
      <LogoCropper
        v-model="logoPreview"
        :is-superadmin="isSuperadmin"
        @save="onLogoCropSave"
      />
    </div>

    <!-- Form -->
    <div class="panel__form">

      <!-- Cheie + ID + Sync -->
      <div class="form-section">
        <div class="form-section__title">Conectare ConectX</div>
        <div class="form-row form-row--3">
          <div class="field-group" :class="{ 'field-group--error': errors.conectxKey }">
            <label class="field-label">Cheia instituției <span class="required">*</span></label>
            <input v-model="models.conectxKey" type="text" class="field-input" :disabled="!isSuperadmin" :class="{ 'field-input--disabled': !isSuperadmin }" />
          </div>
          <div class="field-group" :class="{ 'field-group--error': errors.conectxid }">
            <label class="field-label">ID instituției <span class="required">*</span></label>
            <input v-model="models.conectxid" type="text" class="field-input" :disabled="!isSuperadmin" :class="{ 'field-input--disabled': !isSuperadmin }" />
          </div>
          <div class="field-group field-group--sync">
            <label class="field-label">&nbsp;</label>
            <button class="btn-sync" @click="syncInstitution" :disabled="!isSuperadmin || syncing || !models.conectxKey || !models.conectxid">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="{ 'rotating': syncing }"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
              {{ syncing ? 'Sincronizare...' : 'Sincronizează' }}
            </button>
          </div>
        </div>
        <div v-if="syncMessage" class="sync-message" :class="syncSuccess ? 'sync-message--success' : 'sync-message--error'">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline v-if="syncSuccess" points="20 6 9 17 4 12"></polyline>
            <circle v-else cx="12" cy="12" r="10"></circle>
          </svg>
          {{ syncMessage }}
        </div>
      </div>

      <!-- Date principale -->
      <div class="form-section">
        <div class="form-section__title">Date instituție</div>
        <div class="form-row form-row--3">
          <div class="field-group" :class="{ 'field-group--error': errors.name }">
            <label class="field-label">
              Denumirea instituției <span class="required">*</span>
              <span v-if="disabledData.name" class="field-synced">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1565C0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                ConectX
              </span>
            </label>
            <input v-model="models.name" type="text" class="field-input" :disabled="disabledData.name" :class="{ 'field-input--synced': disabledData.name }" />
          </div>
          <div class="field-group" :class="{ 'field-group--error': errors.cif }">
            <label class="field-label">
              CIF <span class="required">*</span>
              <span v-if="disabledData.cif" class="field-synced">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1565C0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                ConectX
              </span>
            </label>
            <input v-model="models.cif" type="text" class="field-input" :disabled="disabledData.cif" :class="{ 'field-input--synced': disabledData.cif }" />
          </div>
          <div class="field-group" :class="{ 'field-group--error': errors.email }">
            <label class="field-label">
              Email <span class="required">*</span>
              <span v-if="disabledData.email" class="field-synced">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1565C0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                ConectX
              </span>
            </label>
            <input v-model="models.email" type="email" class="field-input" :disabled="disabledData.email" :class="{ 'field-input--synced': disabledData.email }" />
          </div>
        </div>

        <div class="form-row form-row--3">
          <div class="field-group" :class="{ 'field-group--error': errors.phone }">
            <label class="field-label">
              Telefon <span class="required">*</span>
              <span v-if="disabledData.phone" class="field-synced">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1565C0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                ConectX
              </span>
            </label>
            <input v-model="models.phone" type="text" class="field-input" :disabled="disabledData.phone" :class="{ 'field-input--synced': disabledData.phone }" />
          </div>
          <div class="field-group field-group--wide" :class="{ 'field-group--error': errors.address }">
            <label class="field-label">
              Adresa <span class="required">*</span>
              <span v-if="disabledData.address" class="field-synced">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1565C0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                ConectX
              </span>
            </label>
            <input v-model="models.address" type="text" class="field-input" :disabled="disabledData.address" :class="{ 'field-input--synced': disabledData.address }" />
          </div>
        </div>
      </div>

      <!-- Clasificare -->
      <div class="form-section">
        <div class="form-section__title">Clasificare</div>
        <div class="form-row form-row--3">
          <div class="field-group">
            <label class="field-label">
              Tip administrație <span class="required">*</span>
              <span v-if="disabledData.type" class="field-synced">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1565C0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                ConectX
              </span>
            </label>
            <select v-model="models.type" class="field-select" :disabled="disabledData.type || !isSuperadmin" :class="{ 'field-input--synced': disabledData.type }">
              <option value="">Selectează...</option>
              <option value="Administrație publică locală">Administrație publică locală</option>
              <option value="Administrație publică centrală">Administrație publică centrală</option>
            </select>
          </div>
          <div class="field-group">
            <label class="field-label">
              Tipul de instituție <span class="required">*</span>
              <span v-if="disabledData.institutionType" class="field-synced">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1565C0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                ConectX
              </span>
            </label>
            <select v-model="models.institutionType" class="field-select" :disabled="disabledData.institutionType" :class="{ 'field-input--synced': disabledData.institutionType }">
              <option value="">Selectează...</option>
              <option v-for="t in institutionTypes" :key="t.id" :value="t">{{ t.name }}</option>
            </select>
          </div>
          <div class="field-group">
            <label class="field-label">
              Tip ordonator de credite <span class="required">*</span>
              <span v-if="disabledData.creditOrdererType" class="field-synced">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1565C0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                ConectX
              </span>
            </label>
            <select v-model="models.creditOrdererType" class="field-select" :disabled="disabledData.creditOrdererType" :class="{ 'field-input--synced': disabledData.creditOrdererType }">
              <option value="">Selectează...</option>
              <option v-for="t in creditOrdererTypes" :key="t.id" :value="t">{{ t.name }}</option>
            </select>
          </div>
        </div>

        <!-- Ordonator superior - apare doar daca tipul selectat nu are parinte -->
        <div v-if="models.creditOrdererType && !models.creditOrdererType?.parent" class="form-row">
          <div class="field-group" :class="{ 'field-group--error': errors.creditOrderer }">
            <label class="field-label">
              Ordonator de credite superior <span class="required">*</span>
              <span v-if="disabledData.creditOrderer" class="field-synced">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1565C0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                ConectX
              </span>
            </label>
            <input v-model="models.creditOrderer" type="text" class="field-input" :disabled="disabledData.creditOrderer" :class="{ 'field-input--synced': disabledData.creditOrderer }" />
          </div>
        </div>
      </div>

      <!-- Configurare -->
      <div class="form-section">
        <div class="form-section__title">Configurare flux</div>

        <div class="flux-warning">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Aceste setări modifică fluxul de lucru al întregii instituții. Schimbările intră în vigoare imediat după salvare.
        </div>

        <div class="form-checkboxes">
          <div class="checkbox-item">
            <label class="checkbox-label" :class="{ 'checkbox-label--disabled': !isSuperadmin }">
              <input type="checkbox" v-model="models.approveMode" :disabled="!isSuperadmin" class="checkbox-input" />
              <span class="checkbox-custom"></span>
              <span class="checkbox-text">Activează modul de aprobare</span>
            </label>
            <p class="checkbox-description">
              Propunerile de nevoi vor necesita aprobare explicită din partea Responsabilului sau Supervizorului de achiziții înainte de includerea în referat. Secțiunea <strong>„Aprobări"</strong> devine vizibilă în meniul de navigare.
            </p>
          </div>

          <div class="checkbox-item" :class="{ 'checkbox-item--disabled': !models.approveMode }">
            <label class="checkbox-label" :class="{ 'checkbox-label--disabled': !models.approveMode || !isSuperadmin }">
              <input type="checkbox" v-model="models.avizoMode" :disabled="!models.approveMode || !isSuperadmin" class="checkbox-input" />
              <span class="checkbox-custom"></span>
              <span class="checkbox-text">Activează modul de avizare</span>
              <span v-if="!models.approveMode" class="checkbox-hint">— necesită activarea modului de aprobare</span>
            </label>
            <p class="checkbox-description">
              Referatele de necesitate vor parcurge un flux de avizare multi-nivel înainte de aprobare finală. Secțiunea devine <strong>„Avizare &amp; Aprobare"</strong>. Dezactivarea modului de aprobare dezactivează automat și avizarea.
            </p>
          </div>
        </div>
      </div>

      <!-- Actiuni -->
      <div v-if="isSuperadmin" class="panel__actions">
        <button class="btn-save" @click="saveData" :disabled="saving">
          <span v-if="!saving">{{ action === 'create' ? 'Creează' : 'Modifică' }}</span>
          <span v-else class="btn-spinner"></span>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import {
  INSTITUTION_ADD, INSTITUTION_MODIFY, INSTITUTION_UPLOAD,
  INSTITUTION_DOWNLOAD, INSTITUTION_TYPE, CREDIT_ORDERER_TYPE, INSTITUTION_INFO
} from '@/api.js'
import LogoCropper from '@/components/LogoCropper.vue'

const props = defineProps({
  options: { type: Object, required: true }
})

const emit = defineEmits(['closePanel', 'saved'])

const syncing = ref(false)
const saving = ref(false)
const syncMessage = ref('')
const syncSuccess = ref(false)
const logoPreview = ref('')
const logoFile = ref(null)
const logoEdited = ref(false)
const editId = ref(null)
const institutionTypes = ref([])
const creditOrdererTypes = ref([])
const fileInput = ref(null)
const errors = ref({})

const models = ref({
  name: '', email: '', address: '', cif: '', phone: '',
  type: '', avizoMode: false, approveMode: false,
  institutionType: null, creditOrdererType: null,
  creditOrderer: null, conectxid: '', conectxKey: ''
})

const disabledData = ref({
  name: true, email: true, address: true, cif: true, phone: true,
  type: true, institutionType: true, creditOrdererType: true,
  creditOrderer: false, sync: true, conectxid: true, conectxKey: true,
  approveMode: true, avizoMode: true
})

const isSuperadmin = computed(() => window.$getRoleAll?.()?.role === 'superadmin')
const action = computed(() => props.options.action || 'create')

const roleLabel = computed(() => ({
  superadmin: 'Superadmin', admin: 'Admin', admin_institutie: 'Admin Institutie'
}[window.$getRoleAll?.()?.role] || 'Utilizator'))

watch(() => models.value.approveMode, val => { if (!val) models.value.avizoMode = false })

function triggerFileInput() {
  if (isSuperadmin.value) fileInput.value?.click()
}

function _onFileChange_unused(e) {
  const file = e.target.files[0]
  if (!file) return
  logoFile.value = file
  logoEdited.value = true
  const reader = new FileReader()
  reader.onload = ev => { logoPreview.value = ev.target.result }
  reader.readAsDataURL(file)
}

async function syncInstitution() {
  if (!models.value.conectxKey || !models.value.conectxid) return
  syncing.value = true
  syncMessage.value = ''

  try {
    const res = await INSTITUTION_INFO({ apiKey: models.value.conectxKey, institutionId: models.value.conectxid })
    const data = await res.json()

    if (data?.data?.result) {
      const d = data.data.result
      const set = (key, val, disabledKey) => {
        if (val) { models.value[key] = val; disabledData.value[disabledKey || key] = true }
        else { disabledData.value[disabledKey || key] = false }
      }

      set('name', d.name)
      set('address', d.address)
      set('email', d.email)
      set('phone', d.phone)
      set('cif', d.cui, 'cif')

      if (d.administration_type) {
        // Normalizam stringul ca in codul vechi: spatii->underscore, lowercase, fara diacritice
        const normalize = s => s.replace(/ /g,'_').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
        const adminOpts = ['Administrație publică locală', 'Administrație publică centrală']
        const found = adminOpts.find(o => normalize(o) === normalize(d.administration_type) || o === d.administration_type)
        if (found) { models.value.type = found; disabledData.value.type = true }
        else { models.value.type = d.administration_type; disabledData.value.type = true }
      }
      if (d.institution_type) {
        const found = institutionTypes.value.find(t => t.name?.toLowerCase() === d.institution_type?.toLowerCase())
        if (found) { models.value.institutionType = found; disabledData.value.institutionType = true }
      }
      if (d.credit_manager_type) {
        const normalize = s => s?.replace(/ /g,'_').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'') || ''
        const found = creditOrdererTypes.value.find(t =>
          t.name?.toLowerCase() === d.credit_manager_type?.toLowerCase() ||
          normalize(t.name) === normalize(d.credit_manager_type)
        )
        if (found) { models.value.creditOrdererType = found; disabledData.value.creditOrdererType = true }
      }
      if (d.credit_manager) { models.value.creditOrderer = d.credit_manager; disabledData.value.creditOrderer = true }

      syncSuccess.value = true
      syncMessage.value = 'Date sincronizate cu succes din ConectX!'
    } else {
      syncSuccess.value = false
      syncMessage.value = data?.response?.message || 'Sincronizarea a eșuat. Verificați cheia și ID-ul.'
    }
  } catch {
    syncSuccess.value = false
    syncMessage.value = 'Eroare de conexiune. Încercați din nou.'
  } finally {
    syncing.value = false
  }
}

async function onLogoCropSave(base64) {
  if (!props.institutionId) {
    // La creare - salvam in logoPreview, se va uploada la submit
    logoPreview.value = base64
    return
  }
  // La editare - uploadam direct
  try {
    const blob = await fetch(base64).then(r => r.blob())
    const formData = new FormData()
    formData.append('file', blob, 'logo.png')
    await INSTITUTION_UPLOAD(props.institutionId, formData)
    logoPreview.value = base64
  } catch { console.error('Upload logo failed') }
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function saveData() {
  errors.value = {}

  // Câmpuri obligatorii de bază
  if (!models.value.name) { errors.value.name = true; return }

  // Validare format email
  if (!models.value.email) {
    errors.value.email = true; return
  }
  if (!emailRegex.test(models.value.email)) {
    errors.value.email = true; return
  }

  // Validare telefon — trebuie să existe
  if (!models.value.phone || models.value.phone.trim().length < 6) {
    errors.value.phone = true; return
  }

  // Validare ordonator de credite superior — obligatoriu dacă tipul selectat nu are părinte
  if (
    models.value.creditOrdererType &&
    !models.value.creditOrdererType?.parent &&
    !models.value.creditOrderer
  ) {
    errors.value.creditOrderer = true; return
  }

  // La editare — verifică dacă s-a modificat ceva
  if (action.value === 'edit' && !logoEdited.value) {
    const original = props.options.data
    const hasChanges = original && Object.keys(models.value).some(k => {
      if (k === 'institutionType') return models.value[k]?.id !== original[k]?.id
      if (k === 'creditOrdererType') return models.value[k]?.id !== original[k]?.id
      return models.value[k] !== original[k]
    })
    if (!hasChanges) return // nimic de salvat
  }

  saving.value = true
  try {
    const sendData = { ...models.value }
    if (sendData.institutionType?.id) sendData.institutionType = sendData.institutionType.id
    if (sendData.creditOrdererType?.id) sendData.creditOrdererType = sendData.creditOrdererType.id

    if (action.value === 'create') {
      const res = await INSTITUTION_ADD(sendData)
      const data = await res.json()
      if (logoFile.value && data?.data?.result?.id) {
        const fd = new FormData()
        fd.append('file', logoFile.value)
        await INSTITUTION_UPLOAD(data.data.result.id, fd)
      }
    } else {
      await INSTITUTION_MODIFY(editId.value, sendData)
      if (logoFile.value && logoEdited.value) {
        const fd = new FormData()
        fd.append('file', logoFile.value)
        await INSTITUTION_UPLOAD(editId.value, fd)
      }
    }
    emit('saved')
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  if (isSuperadmin.value) {
    disabledData.value.conectxKey = false
    disabledData.value.conectxid = false
    disabledData.value.sync = false
    disabledData.value.approveMode = false
    disabledData.value.avizoMode = false
  }

  if (action.value === 'edit' && props.options.data) {
    const d = props.options.data
    editId.value = d.id
    Object.keys(models.value).forEach(k => { if (d[k] !== undefined) models.value[k] = d[k] })

    if (d.id) {
      try {
        const blob = await INSTITUTION_DOWNLOAD(d.id)
        if (blob?.type && blob.type !== 'application/json') {
          logoPreview.value = URL.createObjectURL(blob)
        }
      } catch {}
    }
  }

  try {
    const [typesRes, creditRes] = await Promise.all([
      INSTITUTION_TYPE.get(1, 500),
      CREDIT_ORDERER_TYPE.get(1, 500)
    ])
    const tData = await typesRes.json()
    const cData = await creditRes.json()
    if (Array.isArray(tData?.data?.result)) institutionTypes.value = tData.data.result
    if (Array.isArray(cData?.data?.result)) creditOrdererTypes.value = cData.data.result
  } catch {}
})
</script>

<style scoped>
.panel {
  background: white; border-radius: 12px; border: 0.5px solid #E0E0E0;
  padding: 24px; display: flex; flex-direction: column; gap: 20px;
  overflow-y: auto; flex: 1;
  font-family: 'Roboto', sans-serif;
}

.panel__role {
  display: inline-flex; align-items: center; gap: 6px;
  background: #E8F5E9; color: #2E7D32;
  padding: 6px 12px; border-radius: 8px;
  font-size: 12px; font-weight: 600; align-self: flex-start;
}

.panel__counter { font-size: 13px; color: #757575; }

/* Logo */
.panel__logo-section { display: flex; gap: 16px; align-items: flex-start; }
.logo-upload { display: flex; flex-direction: column; align-items: center; gap: 8px; }

.logo-preview {
  width: 120px; height: 120px; border-radius: 12px;
  border: 2px dashed #E0E0E0; background: #F9F9F9;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; position: relative; overflow: hidden;
  transition: border-color 0.2s;
}
.logo-preview:hover { border-color: #1565C0; }
.logo-preview__img { width: 100%; height: 100%; object-fit: contain; }
.logo-preview__placeholder { display: flex; align-items: center; justify-content: center; }
.logo-preview__overlay {
  position: absolute; inset: 0;
  background: rgba(21,101,192,0.8);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 6px; color: white; font-size: 11px; font-weight: 500;
  opacity: 0; transition: opacity 0.2s;
}
.logo-preview:hover .logo-preview__overlay { opacity: 1; }

.logo-upload__hint { font-size: 10px; color: #9e9e9e; text-align: center; }

/* Form sections */
.panel__form { display: flex; flex-direction: column; gap: 20px; }

.form-section {
  border: 0.5px solid #E0E0E0; border-radius: 10px; padding: 16px; display: flex; flex-direction: column; gap: 12px;
}
.form-section__title {
  font-size: 11px; font-weight: 700; color: #9e9e9e;
  text-transform: uppercase; letter-spacing: 0.5px;
  padding-bottom: 8px; border-bottom: 0.5px solid #F0F0F0;
}

.form-row { display: flex; gap: 14px; }
.form-row--3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }

.field-group { display: flex; flex-direction: column; gap: 5px; flex: 1; }
.field-group--wide { flex: 2; }
.field-group--sync { display: flex; flex-direction: column; gap: 5px; }
.field-group--error .field-input, .field-group--error .field-select {
  border-color: #E53935; box-shadow: 0 0 0 3px rgba(229,57,53,0.08);
}

.field-label {
  font-size: 11px; font-weight: 600; color: #616161;
  text-transform: uppercase; letter-spacing: 0.4px;
  display: flex; align-items: center; gap: 6px;
}
.required { color: #E53935; }

.field-synced {
  display: inline-flex; align-items: center; gap: 3px;
  font-size: 10px; font-weight: 600; color: #1565C0;
  background: #E3F2FD; padding: 1px 6px; border-radius: 4px;
  text-transform: none; letter-spacing: 0;
}

.field-input, .field-select {
  padding: 10px 12px; border: 1.5px solid #E0E0E0; border-radius: 8px;
  font-size: 13px; font-family: 'Roboto', sans-serif; color: #1a1a2e;
  background: #fafafa; transition: border-color 0.2s, box-shadow 0.2s;
  outline: none; width: 100%; box-sizing: border-box;
}
.field-input:focus, .field-select:focus {
  border-color: #1565C0; background: white; box-shadow: 0 0 0 3px rgba(21,101,192,0.1);
}
.field-input--disabled, .field-input--disabled:focus { background: #F5F5F5; color: #9e9e9e; cursor: not-allowed; border-color: #E0E0E0; box-shadow: none; }
.field-input--synced, .field-input--synced:focus { background: #F0F7FF; border-color: #90CAF9; color: #424242; cursor: not-allowed; box-shadow: none; }

/* Sync button */
.btn-sync {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  background: #1565C0; color: white; border: none; border-radius: 8px;
  padding: 10px 16px; font-size: 13px; font-weight: 500;
  font-family: 'Roboto', sans-serif; cursor: pointer; width: 100%;
  transition: background 0.2s; white-space: nowrap;
}
.btn-sync:hover:not(:disabled) { background: #1976D2; }
.btn-sync:disabled { opacity: 0.5; cursor: not-allowed; }

.rotating { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.sync-message {
  display: flex; align-items: center; gap: 7px;
  padding: 9px 14px; border-radius: 8px; font-size: 12px;
}
.sync-message--success { background: #E8F5E9; color: #2E7D32; border: 1px solid #C8E6C9; }
.sync-message--error { background: #FFEBEE; color: #C62828; border: 1px solid #FFCDD2; }

/* Flux warning */
.flux-warning {
  display: flex; align-items: flex-start; gap: 8px;
  background: #FFF8E1; border: 1px solid #FFE082; border-radius: 8px;
  padding: 10px 14px; font-size: 12px; color: #795548; line-height: 1.5;
}

/* Checkbox items cu descriere */
.form-checkboxes { display: flex; flex-direction: column; gap: 16px; }

.checkbox-item { display: flex; flex-direction: column; gap: 5px; }
.checkbox-item--disabled { opacity: 0.5; }

.checkbox-label {
  display: flex; align-items: center; gap: 10px;
  cursor: pointer; font-size: 13px; color: #424242;
}
.checkbox-label--disabled { opacity: 0.5; cursor: not-allowed; }
.checkbox-text { font-weight: 500; }
.checkbox-input { display: none; }
.checkbox-custom {
  width: 18px; height: 18px; border: 2px solid #E0E0E0; border-radius: 4px;
  background: white; flex-shrink: 0; position: relative; transition: all 0.2s;
}
.checkbox-input:checked + .checkbox-custom {
  background: #1565C0; border-color: #1565C0;
}
.checkbox-input:checked + .checkbox-custom::after {
  content: ''; position: absolute; left: 3px; top: 0px;
  width: 5px; height: 9px; border: 2px solid white;
  border-top: none; border-left: none; transform: rotate(45deg);
}
.checkbox-hint { font-size: 11px; color: #9e9e9e; font-style: italic; }

.checkbox-description {
  margin: 0 0 0 28px; font-size: 11.5px; color: #757575;
  line-height: 1.55; border-left: 2px solid #E3F2FD; padding-left: 10px;
}

/* Actions */
.panel__actions { display: flex; justify-content: flex-end; padding-top: 8px; }
.btn-save {
  background: #1565C0; color: white; border: none; border-radius: 8px;
  padding: 11px 28px; font-size: 14px; font-weight: 600;
  font-family: 'Roboto', sans-serif; cursor: pointer;
  min-width: 140px; display: flex; align-items: center; justify-content: center;
  transition: background 0.2s;
}
.btn-save:hover:not(:disabled) { background: #1976D2; }
.btn-save:disabled { opacity: 0.7; cursor: not-allowed; }
.btn-spinner {
  width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite;
}

/* ── Logo zoom ── */
.logo-zoom-btn {
  position: absolute; bottom: 4px; right: 4px;
  background: rgba(0,0,0,0.45); border-radius: 50%;
  width: 26px; height: 26px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; opacity: 0;
  transition: opacity 0.2s;
  z-index: 2;
}
.logo-preview:hover .logo-zoom-btn { opacity: 1; }

.logo-zoom-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex; align-items: center; justify-content: center;
  z-index: 99999;
}
.logo-zoom-modal {
  position: relative;
  background: white;
  border-radius: 12px;
  padding: 16px;
  max-width: 90vw; max-height: 90vh;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}
.logo-zoom-img {
  max-width: 80vw; max-height: 80vh;
  object-fit: contain;
}
.logo-zoom-close {
  position: absolute; top: 8px; right: 8px;
  background: #F5F5F5; border: none;
  width: 28px; height: 28px; border-radius: 50%;
  cursor: pointer; font-size: 14px;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.logo-zoom-close:hover { background: #FFEBEE; color: #E53935; }
</style>
