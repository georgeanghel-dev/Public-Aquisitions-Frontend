<template>
  <!-- Overlay panou -->
  <div class="panel-overlay" @click.self="$emit('close')">
    <div class="panel">

      <!-- Header panou -->
      <div class="panel__header">
        <div class="panel__header-left">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1565C0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="8 17 12 21 16 17"></polyline><line x1="12" y1="12" x2="12" y2="21"></line><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"></path></svg>
          <h2 class="panel__title">Import structuri organizatorice</h2>
        </div>
        <button class="panel__close" @click="$emit('close')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#757575" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div class="panel__body">

        <!-- Pasul 1: Selectare institutie -->
        <div class="step">
          <div class="step__label">
            <span class="step__number">1</span>
            Selectați instituția
          </div>

          <div v-if="isSuperadmin" class="step__content">
            <div class="field-group">
              <label class="field-label">Instituția</label>
              <select v-model="selectedInstitution" class="field-select" :disabled="loading">
                <option value="">Selectează instituția...</option>
                <option v-for="inst in institutions" :key="inst.id" :value="inst">{{ inst.name }}</option>
              </select>
            </div>
          </div>
          <div v-else class="step__content">
            <div class="institution-auto">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
              {{ userInstitutionName }}
            </div>
          </div>
        </div>

        <!-- Pasul 2: Import explicit -->
        <div class="step" :class="{ 'step--disabled': !canImport }">
          <div class="step__label">
            <span class="step__number">2</span>
            Preluați structurile din ConectX
          </div>
          <div class="step__content">
            <button
              class="btn-import"
              @click="fetchFromConectX"
              :disabled="!canImport || loading"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="{ 'rotating': loading }"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
              {{ loading ? 'Se preiau datele...' : 'Preia din ConectX' }}
            </button>
            <div v-if="fetchError" class="fetch-error">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {{ fetchError }}
            </div>
          </div>
        </div>

        <!-- Pasul 3: Selectie structuri -->
        <div v-if="fetched.length > 0" class="step">
          <div class="step__label">
            <span class="step__number">3</span>
            Selectați structurile de importat
            <span class="step__counter">{{ selectedCount }} din {{ fetched.length }} selectate</span>
          </div>

          <div class="step__content">

            <!-- Legenda -->
            <div class="legend">
              <div class="legend__item">
                <div class="legend__dot legend__dot--new"></div>
                <span>Structură nouă — va fi importată</span>
              </div>
              <div class="legend__item">
                <div class="legend__dot legend__dot--existing"></div>
                <span>Deja importată — va fi ignorată dacă selectată</span>
              </div>
            </div>

            <!-- Select all -->
            <div class="select-all">
              <label class="checkbox-label">
                <input type="checkbox" :checked="allNewSelected" @change="toggleSelectAll" class="checkbox-input" />
                <span class="checkbox-custom"></span>
                <span>Selectează toate structurile noi</span>
              </label>
            </div>

            <!-- Lista structuri -->
            <div class="dept-list">
              <div
                v-for="dept in fetched"
                :key="dept.conectxId || dept.name"
                class="dept-item"
                :class="{
                  'dept-item--existing': dept.alreadyExists,
                  'dept-item--selected': dept.selected && !dept.alreadyExists
                }"
              >
                <label class="dept-item__checkbox">
                  <input
                    type="checkbox"
                    v-model="dept.selected"
                    :disabled="dept.alreadyExists"
                    class="checkbox-input"
                  />
                  <span class="checkbox-custom" :class="{ 'checkbox-custom--disabled': dept.alreadyExists }"></span>
                </label>

                <div class="dept-item__info">
                  <div class="dept-item__name">{{ dept.name }}</div>
                  <div class="dept-item__meta">
                    <span v-if="dept.email" class="dept-item__email">{{ dept.email }}</span>
                    <span v-if="dept.organizationalStructureType?.name" class="dept-item__type">{{ dept.organizationalStructureType.name }}</span>
                  </div>
                </div>

                <div class="dept-item__badge">
                  <span v-if="dept.alreadyExists" class="badge badge--existing">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Deja importată
                  </span>
                  <span v-else class="badge badge--new">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Nouă
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Mesaj daca nu s-au gasit structuri -->
        <div v-else-if="fetchedOnce && fetched.length === 0" class="no-results">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#E0E0E0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <p>Nu au fost găsite structuri organizatorice în ConectX pentru instituția selectată.</p>
        </div>

      </div>

      <!-- Footer panou -->
      <div class="panel__footer">
        <button class="btn-cancel" @click="$emit('close')">Anulează</button>
        <button
          v-if="selectedCount > 0"
          class="btn-save"
          @click="saveSelected"
          :disabled="saving"
        >
          <span v-if="!saving">
            Importă {{ selectedCount }} {{ selectedCount === 1 ? 'structură' : 'structuri' }}
          </span>
          <span v-else class="btn-spinner"></span>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { INSTITUTIONS_PAGINATED, IMPORT_DEPARTMENTS, SAVE_DEPARTMENTS, DEPARTMENTS_PAGINATED } from '@/api.js'

const emit = defineEmits(['close', 'saved'])

const loading = ref(false)
const saving = ref(false)
const fetchError = ref('')
const fetchedOnce = ref(false)
const institutions = ref([])
const selectedInstitution = ref('')
const fetched = ref([])
const existingNames = ref(new Set())

const isSuperadmin = computed(() => window.$getRoleAll?.()?.role === 'superadmin')
const userInstitutionName = computed(() => window.$getRoleAll?.()?.institutionName || '')
const canImport = computed(() => isSuperadmin.value ? !!selectedInstitution.value : true)

const selectedCount = computed(() => fetched.value.filter(d => d.selected && !d.alreadyExists).length)
const allNewSelected = computed(() => {
  const newOnes = fetched.value.filter(d => !d.alreadyExists)
  return newOnes.length > 0 && newOnes.every(d => d.selected)
})

function toggleSelectAll() {
  const newOnes = fetched.value.filter(d => !d.alreadyExists)
  const shouldSelect = !allNewSelected.value
  newOnes.forEach(d => { d.selected = shouldSelect })
}

async function fetchFromConectX() {
  fetchError.value = ''
  loading.value = true
  fetched.value = []

  try {
    // Pasul 1: incarca structurile existente ca sa stim care sunt deja importate
    const existingRes = await DEPARTMENTS_PAGINATED(1, 1000,
      isSuperadmin.value && selectedInstitution.value
        ? `institution.id=${selectedInstitution.value.id}`
        : null
    )
    const existingData = await existingRes.json()
    existingNames.value = new Set(
      (existingData?.data?.result || []).map(d => d.name?.toLowerCase().trim())
    )

    // Pasul 2: importa din ConectX
    const query = isSuperadmin.value && selectedInstitution.value
      ? `?institutionId=${selectedInstitution.value.id}`
      : null

    const res = await IMPORT_DEPARTMENTS(query)
    const data = await res.json()

    if (Array.isArray(data?.data)) {
      fetched.value = data.data.map(dept => ({
        ...dept,
        selected: !existingNames.value.has(dept.name?.toLowerCase().trim()), // noi bifati automat, existente nu
        alreadyExists: existingNames.value.has(dept.name?.toLowerCase().trim())
      }))
      fetchedOnce.value = true
    } else if (data?.response) {
      fetchError.value = typeof data.response === 'string' ? data.response : 'Nu s-au putut prelua structurile.'
    }
  } catch {
    fetchError.value = 'Eroare de conexiune. Încercați din nou.'
  } finally {
    loading.value = false
  }
}

async function saveSelected() {
  saving.value = true
  try {
    const body = {}
    if (isSuperadmin.value && selectedInstitution.value) {
      body.institutionId = selectedInstitution.value.id
    }
    // Trimitem doar structurile selectate si care nu exista deja
    body.departments = fetched.value
      .filter(d => d.selected && !d.alreadyExists)
      .map(({ selected, alreadyExists, ...rest }) => rest)

    await SAVE_DEPARTMENTS(body)
    emit('saved')
  } catch {
    fetchError.value = 'Salvarea a eșuat. Încercați din nou.'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  if (isSuperadmin.value) {
    try {
      const res = await INSTITUTIONS_PAGINATED(1, 500)
      const data = await res.json()
      if (Array.isArray(data?.data?.result)) {
        institutions.value = data.data.result.map(e => ({ ...e, name: e.name || '—' }))
      }
    } catch {}
  }
})
</script>

<style scoped>
/* ── Overlay ── */
.panel-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: flex-start; justify-content: flex-end;
  z-index: 1000;
  padding: 0;
}

.panel {
  width: 560px; height: 100vh;
  background: white;
  display: flex; flex-direction: column;
  box-shadow: -8px 0 32px rgba(0,0,0,0.15);
  font-family: 'Roboto', sans-serif;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

/* ── Header ── */
.panel__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px; border-bottom: 0.5px solid #E0E0E0; flex-shrink: 0;
  background: white;
}
.panel__header-left { display: flex; align-items: center; gap: 10px; }
.panel__title { font-size: 16px; font-weight: 600; color: #1a1a2e; margin: 0; }
.panel__close {
  background: none; border: none; cursor: pointer;
  padding: 6px; border-radius: 6px; transition: background 0.15s;
  display: flex; align-items: center; justify-content: center;
}
.panel__close:hover { background: #F5F7FA; }

/* ── Body ── */
.panel__body {
  flex: 1; overflow-y: auto; padding: 24px;
  display: flex; flex-direction: column; gap: 24px;
}

/* ── Steps ── */
.step { display: flex; flex-direction: column; gap: 12px; }
.step--disabled { opacity: 0.4; pointer-events: none; }

.step__label {
  display: flex; align-items: center; gap: 10px;
  font-size: 13px; font-weight: 600; color: #1a1a2e;
}
.step__number {
  width: 24px; height: 24px; border-radius: 50%;
  background: #1565C0; color: white;
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.step__counter {
  margin-left: auto; font-size: 12px; font-weight: 400;
  color: #1565C0; background: #E3F2FD;
  padding: 2px 10px; border-radius: 20px;
}

.step__content { padding-left: 34px; display: flex; flex-direction: column; gap: 10px; }

/* ── Fields ── */
.field-group { display: flex; flex-direction: column; gap: 5px; }
.field-label { font-size: 11px; font-weight: 600; color: #616161; text-transform: uppercase; letter-spacing: 0.4px; }
.field-select {
  padding: 10px 12px; border: 1.5px solid #E0E0E0; border-radius: 8px;
  font-size: 13px; font-family: 'Roboto', sans-serif; color: #1a1a2e;
  background: #fafafa; outline: none; transition: border-color 0.2s;
}
.field-select:focus { border-color: #1565C0; background: white; }

.institution-auto {
  display: flex; align-items: center; gap: 8px;
  background: #E8F5E9; color: #2E7D32;
  padding: 10px 14px; border-radius: 8px;
  font-size: 13px; font-weight: 500;
}

/* ── Import button ── */
.btn-import {
  display: flex; align-items: center; gap: 8px;
  background: white; color: #1565C0;
  border: 1.5px solid #1565C0; border-radius: 8px;
  padding: 10px 18px; font-size: 13px; font-weight: 600;
  font-family: 'Roboto', sans-serif; cursor: pointer;
  transition: background 0.2s; align-self: flex-start;
}
.btn-import:hover:not(:disabled) { background: #E3F2FD; }
.btn-import:disabled { opacity: 0.5; cursor: not-allowed; }

.rotating { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.fetch-error {
  display: flex; align-items: center; gap: 7px;
  padding: 9px 14px; background: #FFEBEE; border: 1px solid #FFCDD2;
  border-radius: 8px; font-size: 12px; color: #C62828;
}

/* ── Legend ── */
.legend {
  display: flex; gap: 16px; flex-wrap: wrap;
  padding: 10px 14px; background: #F5F7FA;
  border-radius: 8px; border: 0.5px solid #E0E0E0;
}
.legend__item { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #616161; }
.legend__dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.legend__dot--new { background: #1565C0; }
.legend__dot--existing { background: #E0E0E0; border: 2px solid #BDBDBD; }

/* ── Select all ── */
.select-all {
  padding-bottom: 8px;
  border-bottom: 0.5px solid #F0F0F0;
}

/* ── Dept list ── */
.dept-list {
  display: flex; flex-direction: column; gap: 8px;
  max-height: 400px; overflow-y: auto;
  padding-right: 4px;
}

.dept-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px; border-radius: 10px;
  border: 1px solid #E0E0E0; background: white;
  transition: border-color 0.15s, background 0.15s;
}
.dept-item--selected { border-color: #1565C0; background: #F0F7FF; }
.dept-item--existing { background: #FAFAFA; border-color: #F0F0F0; opacity: 0.7; }

.dept-item__checkbox { display: flex; align-items: center; flex-shrink: 0; cursor: pointer; }

.dept-item__info { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.dept-item__name { font-size: 13px; font-weight: 500; color: #1a1a2e; }
.dept-item__meta { display: flex; gap: 10px; flex-wrap: wrap; }
.dept-item__email { font-size: 11px; color: #757575; }
.dept-item__type {
  font-size: 11px; color: #1565C0;
  background: #E3F2FD; padding: 1px 6px; border-radius: 4px;
}

/* ── Badges ── */
.badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 8px; border-radius: 5px;
  font-size: 11px; font-weight: 600; white-space: nowrap;
}
.badge--new { background: #E3F2FD; color: #1565C0; }
.badge--existing { background: #F5F5F5; color: #757575; }

/* ── Checkboxes ── */
.checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; color: #424242; }
.checkbox-input { display: none; }
.checkbox-custom {
  width: 18px; height: 18px; border: 2px solid #E0E0E0; border-radius: 4px;
  background: white; flex-shrink: 0; position: relative; transition: all 0.15s;
}
.checkbox-custom--disabled { background: #F5F5F5; cursor: not-allowed; }
.checkbox-input:checked + .checkbox-custom {
  background: #1565C0; border-color: #1565C0;
}
.checkbox-input:checked + .checkbox-custom::after {
  content: ''; position: absolute; left: 3px; top: 0px;
  width: 5px; height: 9px; border: 2px solid white;
  border-top: none; border-left: none; transform: rotate(45deg);
}

/* ── No results ── */
.no-results {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px; padding: 32px; text-align: center;
  color: #9e9e9e; font-size: 13px; line-height: 1.6;
}

/* ── Footer ── */
.panel__footer {
  display: flex; align-items: center; justify-content: flex-end; gap: 10px;
  padding: 16px 24px; border-top: 0.5px solid #E0E0E0; flex-shrink: 0;
  background: white;
}
.btn-cancel {
  background: white; color: #757575; border: 1.5px solid #E0E0E0; border-radius: 8px;
  padding: 9px 18px; font-size: 13px; font-weight: 500;
  font-family: 'Roboto', sans-serif; cursor: pointer; transition: background 0.15s;
}
.btn-cancel:hover { background: #F5F7FA; }
.btn-save {
  background: #1565C0; color: white; border: none; border-radius: 8px;
  padding: 10px 22px; font-size: 13px; font-weight: 600;
  font-family: 'Roboto', sans-serif; cursor: pointer;
  min-width: 160px; display: flex; align-items: center; justify-content: center;
  transition: background 0.2s;
}
.btn-save:hover:not(:disabled) { background: #1976D2; }
.btn-save:disabled { opacity: 0.7; cursor: not-allowed; }
.btn-spinner {
  width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite;
}
</style>
