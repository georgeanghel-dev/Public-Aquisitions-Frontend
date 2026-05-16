<template>
  <div class="page-container">
    <div class="page-banner">
      <div class="breadcrumb">
        <span class="breadcrumb-link" @click="$router.push('/')">Acasă</span>
        <span class="breadcrumb-sep">/</span>
        <span>Obiective anuale</span>
      </div>
    </div>

    <div class="page-content">
      <div class="content-header">
        <h1 class="page-title">Obiective anuale</h1>
        <button v-if="PERMISIONS.create" class="btn btn-primary" @click="openAdd">
          <span class="btn-icon">+</span> Adaugă obiectiv anual
        </button>
      </div>

      <div class="table-wrapper" v-if="PERMISIONS.list">
        <div class="data-table-scroll">
        <table class="data-table">
          <thead>
            <tr class="table-header-row">
              <th class="col-nr">NR.</th>
              <th>OBIECTIVUL</th>
              <th class="col-year">ANUL</th>
              <th>DATA ÎNCEPUT</th>
              <th>DATA SFÂRȘIT</th>
              <th>DATA CREĂRII</th>
              <th class="col-status">STATUS</th>
              <th v-if="PERMISIONS.edit || PERMISIONS.delete" class="col-actions"></th>
            </tr>
            <tr class="table-filter-row">
              <th></th>
              <th>
                <div class="filter-input">
                  <input v-model="filters.name" class="filter-field" @input="onFilter" />
                  <span class="filter-icon">🔍</span>
                </div>
              </th>
              <th>
                <div class="filter-input">
                  <input v-model="filters.year" class="filter-field" type="number" @input="onFilter" placeholder="2025" />
                </div>
              </th>
              <th></th><th></th><th></th>
              <th>
                <select v-model="filters.isActive" class="filter-select" @change="onFilter">
                  <option value="">Toate</option>
                  <option value="true">Activ</option>
                  <option value="false">Dezactivat</option>
                </select>
              </th>
              <th v-if="PERMISIONS.edit || PERMISIONS.delete">
                <button class="btn-clear-filters" @click="clearFilters" title="Șterge filtrele">✕</button>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, i) in paginatedRows"
              :key="row.id"
              :class="['table-row', i % 2 === 0 ? 'row-even' : 'row-odd', !row.isActive ? 'row-inactive' : '']"
            >
              <td class="col-nr">{{ (currentPage-1)*pageSize + i + 1 }}</td>
              <td class="col-name">{{ row.institutionObjective?.name || row.name || '-' }}</td>
              <td class="col-year">{{ row.year || '-' }}</td>
              <td>{{ formatDate(row.startDate) }}</td>
              <td>{{ formatDate(row.endDate) }}</td>
              <td>{{ formatDate(row.createdAt) }}</td>
              <td class="col-status">
                <span :class="['status-badge', row.isActive ? 'status-active' : 'status-disabled']">
                  <span class="status-dot"></span>
                  {{ row.isActive ? 'Activ' : 'Dezactivat' }}
                </span>
              </td>
              <td v-if="PERMISIONS.edit || PERMISIONS.delete" class="col-actions">
                <div class="actions-menu">
                  <button class="btn-action-trigger" @click.stop="toggleMenu(row.id)">⋮</button>
                  <div v-if="activeMenu === row.id" class="actions-dropdown">
                    <button v-if="PERMISIONS.edit && !row.isActive" class="action-item action-success" @click="confirmStatus(row, true)">
                      ✓ Activează
                    </button>
                    <button v-if="PERMISIONS.edit && row.isActive" class="action-item action-warning" @click="confirmStatus(row, false)">
                      ⊘ Dezactivează
                    </button>
                    <button v-if="PERMISIONS.edit" class="action-item" @click="openEdit(row)">
                      ✏️ Modifică
                    </button>
                    <button v-if="PERMISIONS.delete" class="action-item action-danger" @click="confirmDelete(row)">
                      🗑 Șterge
                    </button>
                  </div>
                </div>
              </td>
            </tr>
            <tr v-if="filteredRows.length === 0">
              <td :colspan="PERMISIONS.edit || PERMISIONS.delete ? 8 : 7" class="empty-row">
                {{ loading ? 'Se încarcă...' : 'Nu există înregistrări' }}
              </td>
            </tr>
          </tbody>
        </table>
        </div><!-- /data-table-scroll -->


        <div class="table-footer">
          <span class="total-records">TOTAL AFIȘAT: {{ Math.min(currentPage*pageSize, filteredRows.length) }}/{{ filteredRows.length }}</span>
          <div class="pagination">
            <span class="page-info">Rânduri pe pagină:
              <select v-model="pageSize" class="page-size-select" @change="currentPage=1">
                <option :value="15">15</option>
                <option :value="25">25</option>
                <option :value="50">50</option>
              </select>
            </span>
            <span class="page-range">{{ (currentPage-1)*pageSize+1 }}-{{ Math.min(currentPage*pageSize, filteredRows.length) }}</span>
            <button class="page-btn" :disabled="currentPage===1" @click="currentPage--">‹</button>
            <button class="page-btn" :disabled="currentPage>=totalPages" @click="currentPage++">›</button>
          </div>
        </div>
      </div>

      <div v-else class="access-denied">
        <span class="access-icon">⚠️</span>
        <p>Acces interzis</p>
      </div>
    </div>

    <!-- Modal Adaugă / Modifică -->
    <!-- Formular cascadat: Obiectiv → An → Interval date -->
    <div v-if="modal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">{{ modal.mode === 'add' ? 'Adaugă' : 'Modifică' }} obiectiv anual</h2>
          <button class="btn-close" @click="closeModal">✕</button>
        </div>
        <div class="modal-body">

          <!-- Pas 1: Obiectivul instituției — blocat la editare -->
          <div class="form-group">
            <label class="form-label">
              Obiectivul <span class="required">*</span>
              <span v-if="modal.mode === 'edit'" class="locked-badge">🔒 Blocat la editare</span>
            </label>
            <select
              v-model="modal.form.institutionObjectiveId"
              class="form-select"
              :disabled="modal.mode === 'edit' || objectivesLoading"
              :class="{ 'form-input--error': formErrors.institutionObjectiveId, 'field-disabled': modal.mode === 'edit' }"
              @change="onObjectiveChange"
            >
              <option value="">— Selectează obiectivul —</option>
              <option v-for="obj in institutionObjectives" :key="obj.id" :value="obj.id">
                {{ obj.name }}
              </option>
            </select>
            <span v-if="objectivesLoading" class="field-hint">Se încarcă obiectivele...</span>
            <span v-if="formErrors.institutionObjectiveId" class="field-error">Câmp obligatoriu</span>
          </div>

          <!-- Pas 2: Anul — blocat la editare, blocat până nu e obiectiv selectat -->
          <div class="form-group">
            <label class="form-label">
              Anul obiectivului <span class="required">*</span>
              <span v-if="modal.mode === 'edit'" class="locked-badge">🔒 Blocat la editare</span>
            </label>
            <input
              v-model="modal.form.year"
              type="number"
              min="2000" max="2100"
              class="form-input"
              :disabled="!modal.form.institutionObjectiveId || modal.mode === 'edit'"
              :class="{
                'form-input--error': formErrors.year,
                'field-disabled': !modal.form.institutionObjectiveId || modal.mode === 'edit'
              }"
              placeholder="Ex: 2025"
              @input="onYearChange"
            />
            <span v-if="formErrors.year" class="field-error">Câmp obligatoriu</span>
          </div>

          <!-- Pas 3: Interval date — blocat până nu e an completat -->
          <div class="form-group">
            <label class="form-label">
              Interval obiectiv <span class="required">*</span>
            </label>
            <div class="date-range-row">
              <div class="date-field">
                <label class="date-label">Data de început</label>
                <input
                  v-model="modal.form.startDate"
                  type="date"
                  class="form-input"
                  :disabled="!modal.form.year"
                  :class="{ 'form-input--error': formErrors.startDate, 'field-disabled': !modal.form.year }"
                />
              </div>
              <div class="date-separator">—</div>
              <div class="date-field">
                <label class="date-label">Data de sfârșit</label>
                <input
                  v-model="modal.form.endDate"
                  type="date"
                  class="form-input"
                  :disabled="!modal.form.year"
                  :class="{ 'form-input--error': formErrors.endDate, 'field-disabled': !modal.form.year }"
                  :min="modal.form.startDate"
                />
              </div>
            </div>
            <span v-if="formErrors.startDate || formErrors.endDate" class="field-error">
              Ambele date sunt obligatorii
            </span>
          </div>

        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">Anulează</button>
          <button class="btn btn-primary" @click="saveModal" :disabled="saving">
            <span v-if="saving" class="spinner spinner-white"></span>
            {{ modal.mode === 'add' ? 'Salvează' : 'Modifică' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal confirmare activare/dezactivare -->
    <div v-if="statusTarget" class="modal-overlay" @click.self="statusTarget = null">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h2 class="modal-title">{{ statusTarget.activate ? 'Activează' : 'Dezactivează' }} obiectiv anual</h2>
          <button class="btn-close" @click="statusTarget = null">✕</button>
        </div>
        <div class="modal-body">
          <p class="delete-msg">
            Ești sigur că vrei să {{ statusTarget.activate ? 'activezi' : 'dezactivezi' }} obiectivul anual selectat?
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="statusTarget = null">Anulează</button>
          <button
            :class="['btn', statusTarget.activate ? 'btn-success' : 'btn-warning']"
            @click="executeStatus" :disabled="saving"
          >
            <span v-if="saving" class="spinner spinner-white"></span>
            {{ statusTarget.activate ? 'Activează' : 'Dezactivează' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal confirmare ștergere -->
    <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h2 class="modal-title">Șterge obiectiv anual</h2>
          <button class="btn-close" @click="deleteTarget = null">✕</button>
        </div>
        <div class="modal-body">
          <p class="delete-msg">Ești sigur că dorești să ștergi obiectivul anual selectat?</p>
          <p class="delete-warning">Dacă există referate ce conțin acest obiectiv, ștergerea va fi blocată.</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="deleteTarget = null">Anulează</button>
          <button class="btn btn-danger" @click="executeDelete" :disabled="deleting">
            <span v-if="deleting" class="spinner spinner-white"></span>
            Șterge
          </button>
        </div>
      </div>
    </div>

    <div v-if="activeMenu" class="overlay-transparent" @click="activeMenu = null"></div>
  </div>
</template>

<script>
import { ANNUAL_INSTITUTION_OBJECTIVES, INSTITUTION_OBJECTIVES } from '@/api.js'
import PermisionsMixin from '@/mixins/annualInstitutionObiectivePermMixin.js'

export default {
  name: 'AnnualInstitutionObjectives',
  mixins: [PermisionsMixin],

  data() {
    return {
      rows: [], institutionObjectives: [],
      loading: false, objectivesLoading: false,
      saving: false, deleting: false,
      currentPage: 1, pageSize: 15,
      filters: { name: '', year: '', isActive: '' },
      activeMenu: null, modal: null, formErrors: {},
      statusTarget: null, deleteTarget: null
    }
  },

  computed: {
    filteredRows() {
      return this.rows.filter(r => {
        const name = r.institutionObjective?.name || r.name || ''
        if (this.filters.name && !name.toLowerCase().includes(this.filters.name.toLowerCase())) return false
        if (this.filters.year && String(r.year) !== String(this.filters.year)) return false
        if (this.filters.isActive !== '' && String(r.isActive) !== this.filters.isActive) return false
        return true
      })
    },
    paginatedRows() {
      const s = (this.currentPage-1)*this.pageSize
      return this.filteredRows.slice(s, s+this.pageSize)
    },
    totalPages() { return Math.max(1, Math.ceil(this.filteredRows.length/this.pageSize)) }
  },

  watch: { filteredRows() { this.currentPage = 1 } },

  methods: {
    async loadData() {
      this.loading = true
      try {
        const res = await ANNUAL_INSTITUTION_OBJECTIVES.get(1, 1000, '')
        const data = await res.json()
        if (Array.isArray(data?.data?.result)) this.rows = data.data.result
      } catch(e) { console.error(e) }
      this.loading = false
    },

    async loadInstitutionObjectives() {
      if (this.institutionObjectives.length) return
      this.objectivesLoading = true
      try {
        const res = await INSTITUTION_OBJECTIVES.get(1, 500, '')
        const data = await res.json()
        if (Array.isArray(data?.data?.result)) {
          // Doar obiectivele active
          this.institutionObjectives = data.data.result.filter(o => o.isActive !== false)
        }
      } catch(e) { console.error(e) }
      this.objectivesLoading = false
    },

    formatDate(d) {
      if (!d) return '-'
      const dt = new Date(d)
      return `${String(dt.getDate()).padStart(2,'0')}.${String(dt.getMonth()+1).padStart(2,'0')}.${dt.getFullYear()}`
    },

    onFilter() { this.currentPage = 1 },
    clearFilters() { this.filters = { name: '', year: '', isActive: '' } },
    toggleMenu(id) { this.activeMenu = this.activeMenu === id ? null : id },

    openAdd() {
      this.modal = {
        mode: 'add',
        form: { institutionObjectiveId: '', year: '', startDate: '', endDate: '' },
        originalId: null
      }
      this.formErrors = {}
      this.loadInstitutionObjectives()
    },

    openEdit(row) {
      this.activeMenu = null
      this.modal = {
        mode: 'edit',
        form: {
          // La editare obiectivul și anul sunt blocate
          institutionObjectiveId: row.institutionObjective?.id || '',
          year: row.year || '',
          startDate: row.startDate ? row.startDate.split('T')[0] : '',
          endDate:   row.endDate   ? row.endDate.split('T')[0]   : ''
        },
        originalId: row.id
      }
      this.formErrors = {}
      this.loadInstitutionObjectives()
    },

    closeModal() { this.modal = null; this.formErrors = {} },

    onObjectiveChange() {
      // La schimbarea obiectivului se resetează anul și datele
      if (this.modal?.mode === 'add') {
        this.modal.form.year = ''
        this.modal.form.startDate = ''
        this.modal.form.endDate = ''
      }
    },

    onYearChange() {
      // La schimbarea anului se resetează datele
      if (this.modal?.mode === 'add') {
        this.modal.form.startDate = ''
        this.modal.form.endDate = ''
      }
    },

    validateForm() {
      this.formErrors = {}
      let valid = true
      const f = this.modal.form
      if (!f.institutionObjectiveId) { this.formErrors.institutionObjectiveId = true; valid = false }
      if (!f.year) { this.formErrors.year = true; valid = false }
      if (!f.startDate) { this.formErrors.startDate = true; valid = false }
      if (!f.endDate)   { this.formErrors.endDate   = true; valid = false }
      return valid
    },

    async saveModal() {
      if (!this.validateForm()) return
      this.saving = true
      try {
        const sendData = {
          institutionObjective: this.modal.form.institutionObjectiveId,
          year:      this.modal.form.year,
          startDate: this.modal.form.startDate,
          endDate:   this.modal.form.endDate
        }
        if (this.modal.mode === 'add') {
          await ANNUAL_INSTITUTION_OBJECTIVES.add(sendData)
        } else {
          // La editare trimitem doar datele (obiectiv și an sunt blocate)
          await ANNUAL_INSTITUTION_OBJECTIVES.edit(this.modal.originalId, {
            startDate: sendData.startDate,
            endDate:   sendData.endDate
          })
        }
        this.closeModal()
        await this.loadData()
      } catch(e) { console.error(e) }
      this.saving = false
    },

    confirmStatus(row, activate) {
      this.activeMenu = null
      this.statusTarget = { row, activate }
    },
    async executeStatus() {
      if (!this.statusTarget) return
      this.saving = true
      try {
        await ANNUAL_INSTITUTION_OBJECTIVES.edit(this.statusTarget.row.id, {
          isActive: this.statusTarget.activate
        })
        this.statusTarget = null
        await this.loadData()
      } catch(e) { console.error(e) }
      this.saving = false
    },

    confirmDelete(row) { this.activeMenu = null; this.deleteTarget = row },
    async executeDelete() {
      if (!this.deleteTarget) return
      this.deleting = true
      try {
        await ANNUAL_INSTITUTION_OBJECTIVES.delete(this.deleteTarget.id)
        this.deleteTarget = null
        await this.loadData()
      } catch(e) { console.error(e) }
      this.deleting = false
    }
  },

  created() { this.loadData() }
}
</script>

<style scoped>
.page-container { display: flex; flex-direction: column; height: 100%; font-family: 'Roboto', sans-serif; }
.page-banner { background: #1565C0; color: white; padding: 0.6rem 1.5rem; }
.breadcrumb { font-size: 0.85rem; }
.breadcrumb-link { cursor: pointer; opacity: 0.85; }
.breadcrumb-link:hover { opacity: 1; text-decoration: underline; }
.breadcrumb-sep { margin: 0 0.4rem; opacity: 0.6; }
.page-content { padding: 1.25rem 1.5rem; flex: 1; display: flex; flex-direction: column; }
.content-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.page-title { font-size: 1.4rem; font-weight: 600; color: #1a2f4e; margin: 0; }
.btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; border-radius: 6px; border: none; cursor: pointer; font-size: 0.875rem; font-weight: 500; font-family: 'Roboto', sans-serif; }
.btn-primary { background: #1565C0; color: white; }
.btn-primary:hover:not(:disabled) { background: #1251a3; }
.btn-primary:disabled { opacity: 0.5; cursor: default; }
.btn-secondary { background: #f5f5f5; color: #333; border: 1px solid #ddd; }
.btn-danger { background: #e53935; color: white; }
.btn-danger:hover:not(:disabled) { background: #c62828; }
.btn-danger:disabled { opacity: 0.5; cursor: default; }
.btn-success { background: #43a047; color: white; }
.btn-success:hover:not(:disabled) { background: #388e3c; }
.btn-warning { background: #fb8c00; color: white; }
.btn-warning:hover:not(:disabled) { background: #e65100; }
.btn-warning:disabled, .btn-success:disabled { opacity: 0.5; cursor: default; }
.btn-icon { font-size: 1.1rem; }
.table-wrapper { background: white; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.data-table-scroll { flex: 1; overflow-y: auto; }
.data-table { width: 100%; border-collapse: collapse; }
.table-header-row th { background: #1565C0; color: white; padding: 0.65rem 0.75rem; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.03em; white-space: nowrap; text-align: left; position: sticky; top: 0; z-index: 10; }
.table-filter-row th { background: #f8f9fc; padding: 0.4rem 0.5rem; border-bottom: 2px solid #e0e0e0; }
.filter-input { display: flex; align-items: center; gap: 4px; background: white; border: 1px solid #ddd; border-radius: 4px; padding: 0 6px; }
.filter-field { border: none; outline: none; padding: 4px 2px; font-size: 0.8rem; width: 100%; background: transparent; font-family: 'Roboto', sans-serif; }
.filter-icon { color: #999; font-size: 0.75rem; }
.filter-select { border: 1px solid #ddd; border-radius: 4px; padding: 4px 6px; font-size: 0.8rem; width: 100%; background: white; font-family: 'Roboto', sans-serif; }
.btn-clear-filters { background: none; border: none; cursor: pointer; color: #999; font-size: 0.9rem; padding: 4px 8px; }
.btn-clear-filters:hover { color: #e53935; }
.table-row td { padding: 0.6rem 0.75rem; font-size: 0.875rem; border-bottom: 1px solid #f0f0f0; color: #333; vertical-align: middle; }
.row-even { background: white; }
.row-odd { background: #fafbfd; }
.row-inactive td { opacity: 0.6; }
.table-row:hover td { background: #EEF5FF !important; opacity: 1; }
.col-nr { width: 50px; text-align: center; }
.col-year { width: 70px; text-align: center; }
.col-name { white-space: normal; word-break: break-word; max-width: 300px; }
.col-status { width: 130px; }
.col-actions { width: 50px; text-align: center; }
.status-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 8px; border-radius: 12px; font-size: 0.78rem; font-weight: 500; }
.status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.status-active { background: #e8f5e9; color: #2e7d32; }
.status-active .status-dot { background: #43a047; }
.status-disabled { background: #ffebee; color: #c62828; }
.status-disabled .status-dot { background: #e53935; }
.actions-menu { position: relative; display: flex; justify-content: center; }
.btn-action-trigger { background: none; border: none; cursor: pointer; font-size: 1.2rem; color: #666; padding: 2px 8px; border-radius: 4px; }
.btn-action-trigger:hover { background: #f0f0f0; }
.actions-dropdown { position: absolute; right: 0; top: 100%; z-index: 100; background: white; border-radius: 6px; min-width: 160px; box-shadow: 0 4px 16px rgba(0,0,0,0.12); border: 1px solid #e8e8e8; overflow: hidden; }
.action-item { display: block; width: 100%; text-align: left; padding: 0.5rem 0.85rem; background: none; border: none; cursor: pointer; font-size: 0.85rem; color: #333; font-family: 'Roboto', sans-serif; }
.action-item:hover { background: #f5f7ff; }
.action-item.action-danger { color: #e53935; }
.action-item.action-success { color: #2e7d32; }
.action-item.action-warning { color: #e65100; }
.empty-row { text-align: center; padding: 3rem; color: #aaa; font-style: italic; }
.table-footer { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; border-top: 1px solid #e8e8e8; background: white; font-size: 0.82rem; color: #555; position: sticky; bottom: 0; z-index: 2; }
.pagination { display: flex; align-items: center; gap: 0.75rem; }
.page-size-select { border: 1px solid #ddd; border-radius: 4px; padding: 2px 4px; font-size: 0.82rem; margin-left: 4px; }
.page-btn { background: none; border: 1px solid #ddd; border-radius: 4px; padding: 2px 10px; cursor: pointer; font-size: 1rem; color: #555; }
.page-btn:hover:not(:disabled) { background: #1565C0; color: white; border-color: #1565C0; }
.page-btn:disabled { opacity: 0.4; cursor: default; }
.access-denied { display: flex; flex-direction: column; align-items: center; padding: 4rem; color: #aaa; }
.access-icon { font-size: 4rem; margin-bottom: 1rem; }
.overlay-transparent { position: fixed; inset: 0; z-index: 99; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 300; }
.modal { background: white; border-radius: 10px; width: 540px; max-width: 96vw; box-shadow: 0 8px 40px rgba(0,0,0,0.18); animation: fadeIn 0.18s ease; }
.modal-sm { width: 420px; }
@keyframes fadeIn { from { opacity:0; transform:scale(0.97); } to { opacity:1; transform:scale(1); } }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.1rem 1.5rem; border-bottom: 1px solid #e8e8e8; }
.modal-title { margin: 0; font-size: 1rem; font-weight: 600; color: #1a2f4e; }
.btn-close { background: #f5f5f5; border: none; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; color: #555; }
.btn-close:hover { background: #fee; color: #e53935; }
.modal-body { padding: 1.25rem 1.5rem; }
.form-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 1.1rem; }
.form-label { font-size: 0.82rem; font-weight: 500; color: #444; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.required { color: #e53935; }
.locked-badge { font-size: 0.72rem; background: #f5f5f5; color: #888; padding: 2px 7px; border-radius: 8px; font-weight: 400; }
.form-input, .form-select { border: 1.5px solid #ddd; border-radius: 6px; padding: 0.5rem 0.75rem; font-size: 0.875rem; font-family: 'Roboto', sans-serif; color: #333; background: white; }
.form-input:focus, .form-select:focus { outline: none; border-color: #1565C0; box-shadow: 0 0 0 3px rgba(21,101,192,0.08); }
.form-input--error { border-color: #e53935 !important; }
.field-disabled { background: #f8f9fc; color: #aaa; cursor: not-allowed; }
.field-hint { font-size: 0.75rem; color: #888; font-style: italic; }
.field-error { font-size: 0.75rem; color: #e53935; }
.date-range-row { display: flex; align-items: flex-end; gap: 0.75rem; }
.date-field { display: flex; flex-direction: column; gap: 4px; flex: 1; }
.date-label { font-size: 0.75rem; color: #777; }
.date-separator { font-size: 1.2rem; color: #aaa; padding-bottom: 8px; }
.delete-msg { font-size: 0.9rem; color: #333; margin: 0 0 0.5rem; }
.delete-warning { font-size: 0.82rem; color: #f57c00; margin: 0; }
.modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1rem 1.5rem; border-top: 1px solid #e8e8e8; }
.spinner { width: 14px; height: 14px; border: 2px solid rgba(0,0,0,0.15); border-top-color: #333; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; }
.spinner-white { border-color: rgba(255,255,255,0.3); border-top-color: white; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
