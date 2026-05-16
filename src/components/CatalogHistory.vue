<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">

      <!-- Header -->
      <div class="modal-header">
        <h2 class="modal-title">Versiuni produs</h2>
        <button class="modal-close" @click="$emit('close')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#757575" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="modal-loading">
        <div class="loading-dots"><span></span><span></span><span></span></div>
      </div>

      <!-- Tabel versiuni -->
      <div v-else class="modal-body">
        <div class="versions-table-wrapper">
          <table class="versions-table">
            <thead>
              <tr>
                <th class="col-nr">Nr.</th>
                <th>Denumire</th>
                <th>Data creării/modificării</th>
                <th>Status versiune produs</th>
                <th>Stare produs sistem</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!versions.length">
                <td colspan="6" class="table-empty">Nu există versiuni disponibile</td>
              </tr>
              <tr
                v-for="(version, i) in versions"
                :key="version.id"
                :class="{ 'row--current': i === 0 }"
              >
                <td class="col-nr">{{ versions.length - i }}.</td>
                <td class="col-name">{{ version.name }}</td>
                <td class="col-date">{{ formatDate(version.createdAt || version.updatedAt) }}</td>
                <td>
                  <span class="status-badge" :class="statusClass(version.status)">
                    {{ statusLabel(version.status) }}
                  </span>
                </td>
                <td>
                  <span class="active-badge" :class="version.isActive ? 'active-badge--on' : 'active-badge--off'">
                    {{ version.isActive ? 'ACTIVAT' : 'DEZACTIVAT' }}
                  </span>
                </td>
                <td>
                  <button class="btn-open" @click="openVersion(version)">
                    Deschide
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button class="btn-back" @click="$emit('close')">Inapoi</button>
      </div>
    </div>

    <!-- Modal detalii versiune -->
    <div v-if="selectedVersion" class="modal modal--version" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">Versiune V{{ selectedVersionNumber }}</h2>
        <button class="modal-close" @click="selectedVersion = null">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#757575" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div class="modal-body">
        <!-- Institutia -->
        <div class="field-group">
          <label class="field-label">Instituția</label>
          <div class="field-readonly">{{ selectedVersion.institution?.name || '—' }}</div>
        </div>

        <!-- Denumire + Unitate masura -->
        <div class="form-row">
          <div class="field-group">
            <label class="field-label">Denumire poziție de catalog</label>
            <div class="field-readonly">{{ selectedVersion.name }}</div>
          </div>
          <div class="field-group">
            <label class="field-label">Unitatea de măsură</label>
            <div class="field-readonly">{{ selectedVersion.measurementUnit?.name || '—' }}</div>
          </div>
        </div>

        <!-- Descriere CPV -->
        <div class="field-group">
          <label class="field-label">Descriere poziție de catalog</label>
          <div class="field-description" v-if="selectedVersion.cpvCategory">
            <div class="cpv-detail"><strong>Denumire:</strong> {{ selectedVersion.cpvCategory.cpvCode }} - {{ selectedVersion.cpvCategory.name }}</div>
            <div class="cpv-detail"><strong>Diviziunea:</strong> {{ selectedVersion.cpvCategory.division }}</div>
            <div class="cpv-detail"><strong>Grupul:</strong> {{ selectedVersion.cpvCategory.group }}</div>
            <div class="cpv-detail"><strong>Clasa:</strong> {{ selectedVersion.cpvCategory.class }}</div>
            <div class="cpv-detail"><strong>Categoria:</strong> {{ selectedVersion.cpvCategory.category }}</div>
          </div>
          <div class="field-readonly" v-else>—</div>
        </div>

        <!-- Meta -->
        <div class="version-meta">
          <div class="version-meta__item">
            <span class="version-meta__label">Data</span>
            <span class="version-meta__value">{{ formatDate(selectedVersion.createdAt || selectedVersion.updatedAt) }}</span>
          </div>
          <div class="version-meta__item">
            <span class="version-meta__label">Status</span>
            <span class="status-badge" :class="statusClass(selectedVersion.status)">{{ statusLabel(selectedVersion.status) }}</span>
          </div>
          <div class="version-meta__item">
            <span class="version-meta__label">Stare</span>
            <span class="active-badge" :class="selectedVersion.isActive ? 'active-badge--on' : 'active-badge--off'">
              {{ selectedVersion.isActive ? 'ACTIVAT' : 'DEZACTIVAT' }}
            </span>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { PRODUCT_VERSIONS } from '@/api.js'

const props = defineProps({
  product: { type: Object, required: true }
})

const emit = defineEmits(['close'])

const versions = ref([])
const loading = ref(true)
const selectedVersion = ref(null)

const selectedVersionNumber = computed(() => {
  if (!selectedVersion.value) return ''
  const idx = versions.value.findIndex(v => v.id === selectedVersion.value.id)
  return String(versions.value.length - idx).padStart(2, '0')
})

onMounted(async () => {
  try {
    const res = await PRODUCT_VERSIONS(props.product.id)
    const data = await res.json()
    if (Array.isArray(data?.data?.result)) {
      versions.value = data.data.result
    } else if (Array.isArray(data?.data)) {
      versions.value = data.data
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

function openVersion(version) {
  selectedVersion.value = version
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

function statusLabel(status) {
  return {
    completed: 'VALIDAT',
    in_progres: 'ÎN CURS DE VALIDARE',
    rejected: 'RESPINS',
  }[status] || status
}

function statusClass(status) {
  return {
    completed: 'status-badge--validated',
    in_progres: 'status-badge--progress',
    rejected: 'status-badge--rejected',
  }[status] || ''
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  gap: 16px;
}

.modal {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 780px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
}

.modal--version {
  max-width: 700px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  border-bottom: 0.5px solid #E0E0E0;
  flex-shrink: 0;
}
.modal-title { font-size: 17px; font-weight: 600; color: #1a1a2e; margin: 0; }
.modal-close {
  background: none; border: none; cursor: pointer;
  padding: 4px; border-radius: 6px; transition: background 0.15s;
}
.modal-close:hover { background: #F5F7FA; }

.modal-body { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 16px; }

/* Loading */
.modal-loading {
  display: flex; align-items: center; justify-content: center; padding: 48px;
}
.loading-dots { display: flex; gap: 6px; }
.loading-dots span {
  width: 8px; height: 8px; background: #1565C0; border-radius: 50%;
  animation: bounce 1.2s infinite;
}
.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes bounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }

/* Tabel versiuni */
.versions-table-wrapper { overflow-x: auto; border-radius: 10px; border: 0.5px solid #E0E0E0; }
.versions-table { width: 100%; border-collapse: collapse; font-size: 13px; }

.versions-table thead tr { background: #1565C0; }
.versions-table thead th {
  padding: 10px 14px; text-align: left;
  font-size: 11px; font-weight: 700; color: white; letter-spacing: 0.3px;
  white-space: nowrap;
}

.versions-table tbody tr {
  border-bottom: 0.5px solid #F0F0F0;
  transition: background 0.15s;
}
.versions-table tbody tr:hover { background: #F5F7FA; }
.versions-table tbody tr:last-child { border-bottom: none; }
.row--current { background: #F0F7FF; }

.versions-table td { padding: 11px 14px; color: #424242; vertical-align: middle; }

.col-nr { width: 48px; text-align: center; color: #9e9e9e; font-size: 12px; }
.col-name { font-weight: 500; color: #1a1a2e; }
.col-date { white-space: nowrap; font-size: 12px; color: #757575; }

.table-empty {
  text-align: center; color: #9e9e9e; padding: 32px !important;
  font-size: 13px; font-style: italic;
}

/* Status badges */
.status-badge {
  display: inline-block; padding: 3px 10px; border-radius: 5px;
  font-size: 11px; font-weight: 700; letter-spacing: 0.3px;
}
.status-badge--validated { background: #1565C0; color: white; }
.status-badge--progress { background: #E3F2FD; color: #1565C0; }
.status-badge--rejected { background: #FFEBEE; color: #C62828; }

.active-badge {
  display: inline-block; padding: 3px 10px; border-radius: 5px;
  font-size: 11px; font-weight: 700; letter-spacing: 0.3px;
}
.active-badge--on { background: #E8F5E9; color: #2E7D32; }
.active-badge--off { background: #FFEBEE; color: #C62828; }

/* Buton deschide */
.btn-open {
  display: inline-flex; align-items: center; gap: 5px;
  color: #1565C0; background: none; border: none;
  font-size: 13px; font-weight: 500; font-family: 'Roboto', sans-serif;
  cursor: pointer; padding: 4px 8px; border-radius: 6px;
  transition: background 0.15s;
}
.btn-open:hover { background: #E3F2FD; }

/* Detalii versiune */
.form-row { display: flex; gap: 16px; }
.field-group { display: flex; flex-direction: column; gap: 5px; flex: 1; }
.field-label {
  font-size: 11px; font-weight: 600; color: #616161;
  text-transform: uppercase; letter-spacing: 0.4px;
}
.field-readonly {
  padding: 10px 12px; border: 1.5px solid #E0E0E0; border-radius: 8px;
  font-size: 13px; color: #424242; background: #F9F9F9; min-height: 40px;
}
.field-description {
  padding: 12px 14px; border: 1.5px solid #90CAF9; border-radius: 8px;
  background: #F0F7FF; display: flex; flex-direction: column; gap: 4px;
}
.cpv-detail { font-size: 13px; color: #424242; line-height: 1.5; font-family: monospace; }
.cpv-detail strong { color: #1565C0; }

/* Meta */
.version-meta {
  display: flex; align-items: center; gap: 24px;
  padding: 12px 16px; background: #F5F7FA;
  border-radius: 8px; flex-wrap: wrap;
}
.version-meta__item { display: flex; align-items: center; gap: 8px; }
.version-meta__label { font-size: 11px; font-weight: 600; color: #9e9e9e; text-transform: uppercase; letter-spacing: 0.3px; }
.version-meta__value { font-size: 13px; color: #424242; }
.modal-footer {
  padding: 14px 24px;
  border-top: 1px solid #E0E0E0;
  flex-shrink: 0;
}
.btn-back {
  background: #e0e0e0; color: #424242; border: none; border-radius: 6px;
  padding: 8px 20px; font-size: 13px; font-weight: 500;
  font-family: "Roboto", sans-serif; cursor: pointer;
}
.btn-back:hover { background: #d0d0d0; }
</style>
