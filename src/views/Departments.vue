<template>
  <div class="page">

    <!-- Breadcrumb -->
    <div class="page__breadcrumb">
      <router-link to="/">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
      </router-link>
      <span class="breadcrumb-sep">›</span>
      <span>Acasă</span>
      <span class="breadcrumb-sep">›</span>
      <span class="breadcrumb-current">Structuri organizatorice</span>
    </div>

    <!-- Titlu + Importă -->
    <div class="page__titlebar">
      <div class="titlebar-left">
        <h1 class="page__title">Structuri organizatorice</h1>

      </div>
      <button v-if="canCreate" class="btn-primary" @click="openImportPanel">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="8 17 12 21 16 17"></polyline><line x1="12" y1="12" x2="12" y2="21"></line><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"></path></svg>
        Importă structuri
      </button>
    </div>

    <!-- Tabel -->
    <div class="page__content">
      <div class="table-card">

        <!-- Header -->
        <div class="table-head">
          <div class="table-row table-row--header">
            <div class="table-cell table-cell--nr">NR.</div>
            <div class="table-cell">DENUMIRE</div>
            <div class="table-cell">EMAIL</div>
            <div class="table-cell">TIP STRUCTURĂ</div>
            <div class="table-cell">INSTITUȚIA</div>
            <div class="table-cell table-cell--actions"></div>
          </div>

          <!-- Filtre -->
          <div class="table-row table-row--filters">
            <div class="table-cell table-cell--nr"></div>
            <div class="table-cell">
              <div class="filter-input">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input v-model="filters.name" placeholder="Caută..." @input="onFilter" />
              </div>
            </div>
            <div class="table-cell">
              <div class="filter-input">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input v-model="filters.email" placeholder="Caută..." @input="onFilter" />
              </div>
            </div>
            <div class="table-cell">
              <div class="filter-input">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input v-model="filters.type" placeholder="Caută..." @input="onFilter" />
              </div>
            </div>
            <div class="table-cell">
              <div class="filter-input">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input v-model="filters.institution" placeholder="Caută..." @input="onFilter" :class="{'filter-input--active': filters.institution && route.query.institution}" />
              </div>
            </div>
            <div class="table-cell table-cell--actions" style="justify-content:center;">
              <button class="btn-clear" @click="clearFilters" title="Șterge filtrele">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Body -->
        <div class="table-body">
          <template v-if="rows.length">
            <div
              v-for="(row, i) in rows"
              :key="row.id"
              class="table-row table-row--data"
              :class="{ 'table-row--alt': i % 2 !== 0 }"
            >
              <div class="table-cell table-cell--nr">{{ (currentPage-1)*perPage + i + 1 }}</div>
              <div class="table-cell table-cell--name">{{ row.name || '—' }}</div>
              <div class="table-cell">{{ row.email || '—' }}</div>
              <div class="table-cell">{{ row.organizationalStructureType?.name || '—' }}</div>
              <div class="table-cell table-cell--name">{{ row.institution?.name || '—' }}</div>
              <div class="table-cell table-cell--actions" style="justify-content:center;">
                <div class="kebab-wrap">
                  <div class="kebab" @click.stop="activeMenu = activeMenu === row.id ? null : row.id">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#9e9e9e"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
                  </div>
                  <div v-if="activeMenu === row.id" class="kebab-menu" @click.stop>
                    <button class="kebab-item" @click="viewUsers(row); activeMenu=null">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1565C0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                      Utilizatori
                    </button>
                    <div class="kebab-divider"></div>
                    <button class="kebab-item kebab-item--danger" @click="deleteRow(row); activeMenu=null">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E53935" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      Șterge
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <div v-else class="table-empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#E0E0E0" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
            <span>Nu există structuri organizatorice înregistrate</span>
          </div>
        </div>


        <!-- Footer -->
        <div class="table-footer">
          <span class="table-footer__total">TOTAL AFIȘAT: {{ totalRecords }}</span>
          <div class="table-footer__pagination">
            <span class="tbl-pp-label">Rânduri pe pagină:</span>
            <select class="tbl-pp-select" v-model="perPage" @change="currentPage=1; loadData()">
              <option :value="10">10</option>
              <option :value="15">15</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
            </select>
            <span class="table-footer__pages">{{ pageStart }}–{{ pageEnd }}</span>
            <div class="pagination-btns">
              <button class="pagination-btn" :disabled="currentPage <= 1" @click="prevPage">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <button class="pagination-btn" :disabled="pageEnd >= totalRecords" @click="nextPage">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel import -->
    <SyncDepartmentsPanel
      v-if="importPanelOpen"
      @close="importPanelOpen = false"
      @saved="onSaved"
    />

    <!-- Modal confirmare stergere -->
    <div v-if="deleteModal.open" class="modal-overlay" @click.self="deleteModal.open = false">
      <div class="confirm-modal">
        <div class="confirm-modal__icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#E53935" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <h3 class="confirm-modal__title">Ștergere structură organizatorică</h3>
        <p class="confirm-modal__message">
          Ești sigur că vrei să ștergi <strong>{{ deleteModal.name }}</strong>?
          <span v-if="deleteModal.hasUsers" class="confirm-modal__warning">
            Această structură are roluri de utilizatori atașate și nu poate fi ștearsă.
          </span>
        </p>
        <div class="confirm-modal__actions">
          <button class="btn-cancel" @click="deleteModal.open = false">Anulează</button>
          <button v-if="!deleteModal.hasUsers" class="btn-delete" @click="confirmDelete" :disabled="deleteModal.loading">
            <span v-if="!deleteModal.loading">Șterge</span>
            <span v-else class="btn-spinner"></span>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import SyncDepartmentsPanel from '@/components/SyncDepartmentsPanel.vue'
import { DEPARTMENTS_PAGINATED, DEPARTMENT_DELETE } from '@/api.js'

const router = useRouter()
const route = useRoute()

const rows = ref([])
const totalRecords = ref(0)
const currentPage = ref(1)
const activeMenu   = ref(null)
const perPage = ref(15)
const importPanelOpen = ref(false)
const deleteModal = ref({ open: false, id: null, name: '', hasUsers: false, loading: false })

const filters = ref({ name: '', email: '', type: '', institution: route.query.institution || '' })
const institutionFilter = ref(route.query.institution || '')

const canCreate = computed(() => {
  const role = window.$getRoleAll?.()?.role
  return ['superadmin', 'admin_institutie'].includes(role)
})

const isSuperadmin = computed(() => window.$getRoleAll?.()?.role === 'superadmin')
const pageStart = computed(() => totalRecords.value === 0 ? 0 : (currentPage.value - 1) * perPage.value + 1)
const pageEnd = computed(() => Math.min(currentPage.value * perPage.value, totalRecords.value))

async function loadData() {
  try {
    const params = []
    if (filters.value.name) params.push(`columnsOr=name||${filters.value.name}`)
    if (filters.value.email) params.push(`columnsOr=email||${filters.value.email}`)
    if (filters.value.institution) {
      params.push(`institution.name=${filters.value.institution}`)
    }

    const res = await DEPARTMENTS_PAGINATED(currentPage.value, perPage.value, params.join('&') || null)
    const data = await res.json()
    if (Array.isArray(data?.data?.result)) {
      rows.value = data.data.result
      totalRecords.value = data.data.recordsQuantity || 0
    }
  } catch (e) { console.error(e) }
}

function onFilter() { currentPage.value = 1; loadData() }

function clearFilters() {
  filters.value = { name: '', email: '', type: '', institution: '' }
  onFilter()
}

function clearInstitutionFilter() {
  institutionFilter.value = ''
  router.push(route.path)
  loadData()
}

function prevPage() { if (currentPage.value > 1) { currentPage.value--; loadData() } }
function nextPage() { if (pageEnd.value < totalRecords.value) { currentPage.value++; loadData() } }

function openImportPanel() { importPanelOpen.value = true }

function viewUsers(row) {
  router.push(`/${route.params.navigation}/utilizatori${row.id ? `?from_department=${row.id}` : ''}`)
}

function deleteRow(row) {
  deleteModal.value = { open: true, id: row.id, name: row.name, hasUsers: false, loading: false }
}

async function confirmDelete() {
  deleteModal.value.loading = true
  try {
    const res = await DEPARTMENT_DELETE(deleteModal.value.id)
    const data = await res.json()
    if (data?.statusCode === 402) {
      deleteModal.value.hasUsers = true
      deleteModal.value.loading = false
      return
    }
    deleteModal.value.open = false
    loadData()
  } catch {
    deleteModal.value.loading = false
  }
}

function onSaved() {
  importPanelOpen.value = false
  loadData()
}

watch(() => route.query.institution, val => {
  institutionFilter.value = val || ''
  filters.value.institution = val || ''
  loadData()
})

onMounted(loadData)
</script>

<style scoped>
.page { display: flex; flex-direction: column; height: 100%; overflow: hidden; font-family: 'Roboto', sans-serif; }

.page__breadcrumb {
  background: #1565C0; padding: 9px 24px;
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: rgba(255,255,255,0.8); flex-shrink: 0;
}
.breadcrumb-sep { color: rgba(255,255,255,0.5); }
.breadcrumb-current { color: white; font-weight: 500; }

.page__titlebar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 24px; background: white;
  border-bottom: 0.5px solid #E0E0E0; flex-shrink: 0;
}
.titlebar-left { display: flex; align-items: center; gap: 12px; }
.page__title { font-size: 18px; font-weight: 600; color: #1a1a2e; margin: 0; }

.institution-badge {
  display: flex; align-items: center; gap: 6px;
  background: #E3F2FD; color: #1565C0;
  padding: 4px 10px; border-radius: 20px;
  font-size: 12px; font-weight: 500;
}
.institution-badge__clear {
  background: none; border: none; cursor: pointer;
  color: #1565C0; font-size: 16px; line-height: 1;
  padding: 0; margin-left: 2px;
}

.btn-primary {
  display: flex; align-items: center; gap: 6px;
  background: #1565C0; color: white; border: none; border-radius: 8px;
  padding: 8px 16px; font-size: 13px; font-weight: 500;
  font-family: 'Roboto', sans-serif; cursor: pointer; transition: background 0.2s;
}
.btn-primary:hover { background: #1976D2; }

.page__content { flex: 1; padding: 16px 24px; overflow: hidden; display: flex; flex-direction: column; }

.table-card {
  background: white; border-radius: 12px; border: 0.5px solid #E0E0E0;
  display: flex; flex-direction: column; flex: 1; overflow: hidden;
}

.table-head { flex-shrink: 0; }
.table-row { display: grid; grid-template-columns: 52px 1.5fr 1fr 1fr 1.5fr 90px; }
.table-row--header { background: #1565C0; }
.table-row--filters { background: #F5F7FA; border-bottom: 0.5px solid #E0E0E0; }

.table-cell {
  padding: 0.65rem 0.75rem; font-size: 0.75rem; font-weight: 700;
  color: white; letter-spacing: 0.04em; display: flex; align-items: center;
}
.table-cell--nr { justify-content: center; }
.table-cell--actions { justify-content: center; }
.table-row--header .table-cell--actions { border-left: 1px solid #1565C0; }
.table-row--filters .table-cell--actions { border-left: 1px solid #E0E0E0; background: #F5F7FA; }
.table-row--data .table-cell--actions { border-left: 1px solid #F0F0F0; }
.table-row--filters .table-cell { color: #424242; padding: 6px 8px; font-weight: 400; }
.table-row--data .table-cell { font-size: 13px; color: #424242; font-weight: 400; align-items: flex-start; padding: 10px 12px; }
.table-row--data .table-cell--nr { justify-content: center; align-items: center; color: #9e9e9e; font-size: 12px; }
.table-row--data .table-cell--actions { align-items: center; justify-content: center; }
.table-cell--name { white-space: normal !important; word-break: break-word; line-height: 1.4; }

.filter-input {
  display: flex; align-items: center; gap: 6px;
  background: white; border: 0.5px solid #E0E0E0;
  border-radius: 6px; padding: 5px 8px; width: 100%;
}
.filter-input input { border: none; outline: none; font-size: 12px; color: #424242; width: 100%; font-family: 'Roboto', sans-serif; background: transparent; }
.filter-clear-btn { background: none; border: none; cursor: pointer; padding: 4px; border-radius: 4px; display: flex; align-items: center; }
.filter-clear-btn:hover { background: #F5F7FA; }

.table-body { flex: 1; overflow-y: auto; }
.table-row--data { border-bottom: 0.5px solid #F0F0F0; transition: background 0.15s; }
.table-row--data:hover { background: #F5F7FA; }
.table-row--alt { background: #FAFAFA; }
.table-row--alt:hover { background: #F5F7FA; }

.table-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 100%; gap: 12px; color: #BDBDBD; font-size: 13px; min-height: 200px;
}

.row-actions { display: flex; align-items: center; gap: 4px; }
.action-btn {
  width: 28px; height: 28px; border: none; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background 0.15s; background: transparent;
}
.action-btn--users { color: #7B1FA2; }
.action-btn--users:hover { background: #F3E5F5; }
.action-btn--delete { color: #E53935; }
.action-btn--delete:hover { background: #FFEBEE; }

.table-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px; background: #F5F7FA;
  border-top: 0.5px solid #E0E0E0; flex-shrink: 0; position: sticky; bottom: 0; z-index: 2;
}
.table-footer__total { font-size: 12px; color: #757575; }
.table-footer__pagination { display: flex; align-items: center; gap: 12px; }
.table-footer__info { font-size: 12px; color: #757575; }
.table-footer__info strong { color: #424242; }
.table-footer__pages { font-size: 12px; color: #757575; }
.pagination-btns { display: flex; gap: 4px; }
.pagination-btn {
  width: 28px; height: 28px; border: 0.5px solid #E0E0E0; border-radius: 6px;
  background: white; display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #424242; transition: background 0.15s;
}
.pagination-btn:hover:not(:disabled) { background: #F5F7FA; }
.pagination-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 2000; padding: 20px;
}
.confirm-modal {
  background: white; border-radius: 16px; padding: 28px;
  max-width: 440px; width: 100%; display: flex; flex-direction: column;
  gap: 14px; box-shadow: 0 8px 32px rgba(0,0,0,0.15);
}
.confirm-modal__icon { display: flex; justify-content: center; }
.confirm-modal__title { font-size: 16px; font-weight: 600; color: #1a1a2e; margin: 0; }
.confirm-modal__message { font-size: 13px; color: #424242; line-height: 1.6; margin: 0; }
.confirm-modal__warning { display: block; margin-top: 8px; color: #E53935; font-weight: 500; font-size: 12px; }
.confirm-modal__actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 4px; }
.btn-cancel {
  background: white; color: #757575; border: 1.5px solid #E0E0E0; border-radius: 8px;
  padding: 9px 18px; font-size: 13px; font-weight: 500; font-family: 'Roboto', sans-serif; cursor: pointer;
}
.btn-cancel:hover { background: #F5F7FA; }
.btn-delete {
  background: #E53935; color: white; border: none; border-radius: 8px;
  padding: 9px 18px; font-size: 13px; font-weight: 600; font-family: 'Roboto', sans-serif;
  cursor: pointer; min-width: 80px; display: flex; align-items: center; justify-content: center;
}
.btn-delete:hover:not(:disabled) { background: #C62828; }
.btn-delete:disabled { opacity: 0.7; cursor: not-allowed; }
.btn-spinner {
  width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.filter-input--active {
  border-color: #E53935 !important;
  box-shadow: 0 0 0 2px rgba(229,57,53,0.15) !important;
}

.btn-clear { display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; border: 1px solid #E0E0E0; border-radius: 5px; background: white; cursor: pointer; color: #9e9e9e; margin: 0 auto; transition: all 0.15s; }
.btn-clear:hover { background: #FFEBEE; color: #E53935; border-color: #E53935; }
.tbl-pp-label { color: #757575; font-size: 0.8rem; }
.tbl-pp-select { border: 1px solid #E0E0E0; border-radius: 5px; padding: 3px 6px; font-size: 0.8rem; font-family: 'Roboto', sans-serif; cursor: pointer; }
.kebab-wrap { position: relative; display: flex; align-items: center; justify-content: center; }
.kebab { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 6px; cursor: pointer; transition: background 0.15s; }
.kebab:hover { background: #F0F0F0; }
.kebab-menu { position: absolute; top: calc(100% + 2px); right: 0; background: white; border: 1px solid #E0E0E0; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.14); min-width: 160px; overflow: hidden; font-family: 'Roboto', sans-serif; z-index: 500; }
.kebab-item { display: flex; align-items: center; gap: 9px; width: 100%; padding: 10px 14px; background: none; border: none; cursor: pointer; font-size: 13px; font-family: 'Roboto', sans-serif; color: #424242; text-align: left; transition: background 0.12s; }
.kebab-item:hover { background: #F5F7FA; }
.kebab-item--danger { color: #E53935; }
.kebab-item--danger:hover { background: #FFEBEE; }
.kebab-divider { border-top: 1px solid #F0F0F0; margin: 2px 0; }
</style>
