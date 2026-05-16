<template>
  <div class="page-container">

    <!-- Banner breadcrumb -->
    <div class="page-banner">
      <div class="breadcrumb">
        <span class="breadcrumb-link" @click="$router.push('/')">Acasă</span>
        <span class="breadcrumb-sep">/</span>
        <span>{{ title }}</span>
      </div>
    </div>

    <div class="page-content">
      <div class="content-header">
        <h1 class="page-title">{{ title }}</h1>
        <button v-if="canCreate" class="btn btn-primary" @click="openAdd">
          <span class="btn-icon">+</span> Adaugă
        </button>
      </div>

      <div class="table-wrapper" v-if="canList">
        <div class="data-table-scroll">
        <table class="data-table">
          <thead>
            <tr class="table-header-row">
              <th class="col-nr">NR.</th>
              <th v-for="col in columns" :key="col.key">{{ col.label }}</th>
              <th v-if="canEdit || canDelete" class="col-actions"></th>
            </tr>
            <tr class="table-filter-row">
              <th></th>
              <th v-for="col in columns" :key="col.key">
                <div v-if="col.filterable !== false" class="f-input">
                  <svg class="f-ico" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input
                    v-model="filters[col.key]"
                    class="f-field"
                    placeholder="Caută..."
                    @input="onFilter"
                  />
                </div>
              </th>
              <th v-if="canEdit || canDelete">
                <button class="btn-clear-filters" @click="clearFilters" title="Șterge filtrele">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, index) in paginatedRows"
              :key="row.id"
              :class="['table-row', index % 2 === 0 ? 'row-even' : 'row-odd']"
            >
              <td class="col-nr">{{ (currentPage - 1) * pageSize + index + 1 }}</td>
              <td v-for="col in columns" :key="col.key" class="col-data">
                <span v-if="col.type === 'boolean'">
                  <span :class="getCellValue(row, col.key) ? 'badge-yes' : 'badge-no'">
                    {{ getCellValue(row, col.key) ? 'DA' : 'NU' }}
                  </span>
                </span>
                <!-- render fn: permite transformarea valorii pentru afișare (ex: cod → label) -->
                <span v-else-if="col.render">{{ col.render(getCellValue(row, col.key)) }}</span>
                <span v-else>{{ getCellValue(row, col.key) || '-' }}</span>
              </td>
              <td v-if="canEdit || canDelete" class="col-actions">
                <div class="actions-menu">
                  <button class="btn-action-trigger" @click.stop="toggleMenu(row.id)">⋮</button>
                  <div v-if="activeMenu === row.id" class="actions-dropdown">
                    <button v-if="canEdit" class="action-item" @click="openEdit(row)">
                      ✏️ Modifică
                    </button>
                    <button v-if="canDelete" class="action-item action-danger" @click="confirmDelete(row)">
                      🗑 Șterge
                    </button>
                  </div>
                </div>
              </td>
            </tr>
            <tr v-if="filteredRows.length === 0">
              <td colspan="100" class="empty-row"></td>
            </tr>
          </tbody>
        </table>

        <div v-if="filteredRows.length === 0" class="empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#E0E0E0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
          <span v-if="loading">Se încarcă...</span>
          <span v-else>Nu există înregistrări</span>
        </div>

        </div><!-- /data-table-scroll -->
        <!-- Footer -->
        <div class="table-footer">
          <span class="total-records">
            TOTAL AFIȘAT: {{ Math.min(currentPage * pageSize, filteredRows.length) }}/{{ filteredRows.length }}
          </span>
          <div class="pagination">
            <span class="page-info">
              Rânduri pe pagină:
              <select v-model="pageSize" class="page-size-select" @change="currentPage = 1">
                <option :value="15">15</option>
                <option :value="25">25</option>
                <option :value="50">50</option>
              </select>
            </span>
            <span class="page-range">
              {{ (currentPage - 1) * pageSize + 1 }}-{{ Math.min(currentPage * pageSize, filteredRows.length) }}
            </span>
            <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">‹</button>
            <button class="page-btn" :disabled="currentPage >= totalPages" @click="currentPage++">›</button>
          </div>
        </div>
      </div>

      <div v-else class="access-denied">
        <span class="access-icon">⚠️</span>
        <p>Acces interzis</p>
      </div>
    </div>

    <!-- Modal Adaugă / Modifică -->
    <div v-if="modal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">{{ modal.mode === 'add' ? 'Adaugă' : 'Modifică' }} {{ title }}</h2>
          <button class="btn-close" @click="closeModal">✕</button>
        </div>
        <div class="modal-body">
          <div v-for="field in formFields" :key="field.key" class="form-group">
            <label class="form-label">
              {{ field.label }}
              <span v-if="field.required" class="required">*</span>
            </label>
            <!-- Dropdown cu opțiuni din date externe -->
            <select
              v-if="field.type === 'select'"
              v-model="modal.form[field.key]"
              class="form-select"
            >
              <option value="">— Selectează —</option>
              <option
                v-for="opt in (field.options || [])"
                :key="opt.id || opt.value"
                :value="opt.id || opt.value"
              >{{ opt.name || opt.label }}</option>
            </select>
            <!-- Textarea -->
            <textarea
              v-else-if="field.type === 'textarea'"
              v-model="modal.form[field.key]"
              class="form-input form-textarea"
              rows="3"
            ></textarea>
            <!-- Checkbox -->
            <label v-else-if="field.type === 'checkbox'" class="checkbox-inline">
              <input type="checkbox" v-model="modal.form[field.key]" class="checkbox-native" />
              <span class="checkbox-box"></span>
              <span class="checkbox-text-label">{{ field.label }}</span>
            </label>
            <!-- Text input default -->
            <input
              v-else
              v-model="modal.form[field.key]"
              type="text"
              class="form-input"
              :class="{ 'form-input--error': formErrors[field.key] }"
            />
            <span v-if="formErrors[field.key]" class="field-error">Câmp obligatoriu</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">Anulează</button>
          <button class="btn btn-primary" @click="saveModal" :disabled="saving">
            <span v-if="saving" class="spinner spinner-white"></span>
            {{ modal.mode === 'add' ? 'Adaugă' : 'Salvează' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal confirmare ștergere -->
    <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h2 class="modal-title">Șterge înregistrare</h2>
          <button class="btn-close" @click="deleteTarget = null">✕</button>
        </div>
        <div class="modal-body">
          <p class="delete-msg">
            Ești sigur că dorești să ștergi
            <strong>{{ getDisplayName(deleteTarget) }}</strong>?
          </p>
          <p class="delete-warning">Această acțiune nu poate fi anulată.</p>
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

    <!-- Click outside -->
    <div v-if="activeMenu" class="overlay-transparent" @click="activeMenu = null"></div>
  </div>
</template>

<script>
export default {
  name: 'NomenclatorView',

  props: {
    // Titlul paginii
    title: { type: String, required: true },

    // Coloanele tabelului: [{ key, label, type?, filterable? }]
    // key poate fi nested: 'parent.name'
    columns: { type: Array, required: true },

    // Câmpurile formularului add/edit: [{ key, label, type?, required?, options? }]
    formFields: { type: Array, required: true },

    // Funcții API — injectate din view-ul parinte
    apiFns: {
      type: Object,
      required: true
      // { list, add, edit, delete }
    },

    // Permisiuni
    permissions: {
      type: Object,
      default: () => ({ list: true, create: true, edit: true, delete: true })
    }
  },

  data() {
    return {
      rows: [],
      loading: false,
      saving: false,
      deleting: false,
      currentPage: 1,
      pageSize: 15,
      filters: {},
      activeMenu: null,
      modal: null,      // { mode: 'add'|'edit', form: {}, originalId }
      formErrors: {},
      deleteTarget: null
    }
  },

  computed: {
    canList()   { return this.permissions.list !== false },
    canCreate() { return this.permissions.create !== false },
    canEdit()   { return this.permissions.edit !== false },
    canDelete() { return this.permissions.delete !== false },

    filteredRows() {
      return this.rows.filter(row => {
        return this.columns.every(col => {
          const filterVal = (this.filters[col.key] || '').toLowerCase().trim()
          if (!filterVal) return true
          const cellVal = String(this.getCellValue(row, col.key) || '').toLowerCase()
          return cellVal.includes(filterVal)
        })
      })
    },

    paginatedRows() {
      const start = (this.currentPage - 1) * this.pageSize
      return this.filteredRows.slice(start, start + this.pageSize)
    },

    totalPages() {
      return Math.max(1, Math.ceil(this.filteredRows.length / this.pageSize))
    }
  },

  watch: {
    filteredRows() { this.currentPage = 1 }
  },

  methods: {
    // ── Data ─────────────────────────────────────────────────────
    async loadData() {
      if (!this.canList) return
      this.loading = true
      try {
        const res = await this.apiFns.list(1, 500, '')
        const data = await res.json()
        if (Array.isArray(data?.data?.result)) {
          this.rows = data.data.result
        } else if (Array.isArray(data?.data)) {
          this.rows = data.data
        }
      } catch (e) { console.error(e) }
      this.loading = false
    },

    // ── Helpers ──────────────────────────────────────────────────
    getCellValue(row, key) {
      // Suportă nested keys: 'parent.name'
      return key.split('.').reduce((obj, k) => obj?.[k], row)
    },

    getDisplayName(row) {
      // Primul câmp text din formFields sau 'name'
      const firstTextField = this.formFields.find(f => f.type !== 'select')
      return row[firstTextField?.key || 'name'] || row.name || row.id
    },

    // ── Filtre ───────────────────────────────────────────────────
    onFilter() { this.currentPage = 1 },

    clearFilters() {
      this.filters = {}
      this.currentPage = 1
    },

    // ── Meniu acțiuni ────────────────────────────────────────────
    toggleMenu(id) {
      this.activeMenu = this.activeMenu === id ? null : id
    },

    // ── Modal Adaugă / Modifică ──────────────────────────────────
    openAdd() {
      const form = {}
      this.formFields.forEach(f => { form[f.key] = '' })
      this.modal = { mode: 'add', form, originalId: null }
      this.formErrors = {}
    },

    openEdit(row) {
      this.activeMenu = null
      const form = {}
      this.formFields.forEach(f => {
        // Pentru câmpuri select cu obiect nested (ex. parent.id)
        if (f.type === 'select' && f.valueKey) {
          form[f.key] = this.getCellValue(row, f.valueKey) || ''
        } else {
          form[f.key] = row[f.key] ?? ''
        }
      })
      this.modal = { mode: 'edit', form, originalId: row.id }
      this.formErrors = {}
    },

    closeModal() {
      this.modal = null
      this.formErrors = {}
    },

    validateForm() {
      this.formErrors = {}
      let valid = true
      this.formFields.forEach(f => {
        if (f.required && !this.modal.form[f.key]) {
          this.formErrors[f.key] = true
          valid = false
        }
      })
      return valid
    },

    async saveModal() {
      if (!this.validateForm()) return
      this.saving = true
      try {
        const sendData = { ...this.modal.form }
        if (this.modal.mode === 'add') {
          await this.apiFns.add(sendData)
        } else {
          await this.apiFns.edit(this.modal.originalId, sendData)
        }
        this.closeModal()
        await this.loadData()
      } catch (e) { console.error(e) }
      this.saving = false
    },

    // ── Ștergere ─────────────────────────────────────────────────
    confirmDelete(row) {
      this.activeMenu = null
      this.deleteTarget = row
    },

    async executeDelete() {
      if (!this.deleteTarget) return
      this.deleting = true
      try {
        await this.apiFns.delete(this.deleteTarget.id)
        this.deleteTarget = null
        await this.loadData()
      } catch (e) { console.error(e) }
      this.deleting = false
    }
  },

  created() {
    // Inițializează filtrele
    this.columns.forEach(col => { this.filters[col.key] = '' })
    this.loadData()
  }
}
</script>

<style>
.page-container { display: flex; flex-direction: column; height: 100%; font-family: 'Roboto', sans-serif; }

.page-banner { background: #1565C0; color: white; padding: 0.6rem 1.5rem; }
.breadcrumb { font-size: 0.85rem; }
.breadcrumb-link { cursor: pointer; opacity: 0.85; }
.breadcrumb-link:hover { opacity: 1; text-decoration: underline; }
.breadcrumb-sep { margin: 0 0.4rem; opacity: 0.6; }

.page-content { padding: 1.25rem 1.5rem; flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.content-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;
}
.page-title { font-size: 1.4rem; font-weight: 600; color: #1a2f4e; margin: 0; }

.btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; border-radius: 6px; border: none; cursor: pointer; font-size: 0.875rem; font-weight: 500; font-family: 'Roboto', sans-serif; }
.btn-primary { background: #1565C0; color: white; }
.btn-primary:hover:not(:disabled) { background: #1251a3; }
.btn-primary:disabled { opacity: 0.5; cursor: default; }
.btn-secondary { background: #f5f5f5; color: #333; border: 1px solid #ddd; }
.btn-danger { background: #e53935; color: white; }
.btn-danger:hover:not(:disabled) { background: #c62828; }
.btn-danger:disabled { opacity: 0.5; cursor: default; }
.btn-icon { font-size: 1.1rem; font-weight: 400; }

.table-wrapper {
  background: white; border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  flex: 1; display: flex; flex-direction: column; overflow: hidden;
}

.data-table { width: 100%; border-collapse: collapse; }
.data-table-scroll { flex: 1; overflow-y: auto; }

.table-header-row th {
  background: #1565C0; color: white; padding: 0.65rem 0.75rem;
  font-size: 0.75rem; font-weight: 600; letter-spacing: 0.03em;
  white-space: nowrap; text-align: left;
  position: sticky; top: 0; z-index: 10;
}
.table-filter-row th {
  background: #F5F7FA; padding: 0.4rem 0.5rem;
  border-bottom: 2px solid #E0E0E0;
}
.f-input { display: flex; align-items: center; gap: 5px; background: white; border: 1px solid #E0E0E0; border-radius: 5px; padding: 4px 8px; }
.f-field { border: none; outline: none; font-size: 0.8rem; color: #424242; background: transparent; width: 100%; font-family: 'Roboto', sans-serif; }
.f-ico { color: #9e9e9e; flex-shrink: 0; }
.btn-clear-filters {
  display: flex; align-items: center; justify-content: center;
  width: 26px; height: 26px; border: 1px solid #E0E0E0; border-radius: 5px;
  background: white; cursor: pointer; color: #9e9e9e; margin: 0 auto;
  transition: all 0.15s;
}
.btn-clear-filters:hover { background: #FFEBEE; color: #E53935; border-color: #E53935; }

.table-row td {
  padding: 0.6rem 0.75rem; font-size: 0.875rem;
  border-bottom: 1px solid #f0f0f0; color: #333; vertical-align: middle;
}
.row-even { background: white; }
.row-odd  { background: #fafbfd; }
.table-row:hover td { background: #EEF5FF !important; }

.col-nr { width: 50px; text-align: center; }
.col-data { white-space: normal; word-break: break-word; }
.col-actions { width: 50px; text-align: center; }

.badge-yes { background: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 10px; font-size: 0.78rem; font-weight: 500; }
.badge-no  { background: #fafafa; color: #888; padding: 2px 8px; border-radius: 10px; font-size: 0.78rem; }

.actions-menu { position: relative; display: flex; justify-content: center; }
.btn-action-trigger {
  background: none; border: none; cursor: pointer; font-size: 1.2rem;
  color: #666; padding: 2px 8px; border-radius: 4px;
}
.btn-action-trigger:hover { background: #f0f0f0; }
.actions-dropdown {
  position: absolute; right: 0; top: 100%; z-index: 100;
  background: white; border-radius: 6px; min-width: 140px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12); border: 1px solid #e8e8e8; overflow: hidden;
}
.action-item {
  display: block; width: 100%; text-align: left; padding: 0.5rem 0.85rem;
  background: none; border: none; cursor: pointer; font-size: 0.85rem; color: #333;
  font-family: 'Roboto', sans-serif;
}
.action-item:hover { background: #f5f7ff; }
.action-item.action-danger { color: #e53935; }

.empty-row { height: 0; padding: 0 !important; border: none !important; }
.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px; padding: 3rem 1rem; color: #BDBDBD; font-size: 13px; font-style: italic;
}

.table-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.75rem 1rem; border-top: 1px solid #e8e8e8;
  background: white; font-size: 0.82rem; color: #555;
  position: sticky; bottom: 0; z-index: 2;
}
.pagination { display: flex; align-items: center; gap: 0.75rem; }
.page-size-select { border: 1px solid #ddd; border-radius: 4px; padding: 2px 4px; font-size: 0.82rem; margin-left: 4px; }
.page-btn { background: none; border: 1px solid #ddd; border-radius: 4px; padding: 2px 10px; cursor: pointer; font-size: 1rem; color: #555; }
.page-btn:hover:not(:disabled) { background: #1565C0; color: white; border-color: #1565C0; }
.page-btn:disabled { opacity: 0.4; cursor: default; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center; z-index: 300;
}
.modal {
  background: white; border-radius: 10px; width: 480px; max-width: 96vw;
  box-shadow: 0 8px 40px rgba(0,0,0,0.18); animation: fadeIn 0.18s ease;
}
.modal-sm { width: 420px; }
@keyframes fadeIn { from { opacity:0; transform:scale(0.97); } to { opacity:1; transform:scale(1); } }

.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.1rem 1.5rem; border-bottom: 1px solid #e8e8e8;
}
.modal-title { margin: 0; font-size: 1rem; font-weight: 600; color: #1a2f4e; }
.btn-close {
  background: #f5f5f5; border: none; width: 28px; height: 28px; border-radius: 50%;
  cursor: pointer; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; color: #555;
}
.btn-close:hover { background: #fee; color: #e53935; }

.modal-body { padding: 1.25rem 1.5rem; }

.form-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 1rem; }
.form-label { font-size: 0.82rem; font-weight: 500; color: #444; }
.required { color: #e53935; margin-left: 2px; }
.form-input, .form-select, .form-textarea {
  border: 1.5px solid #ddd; border-radius: 6px; padding: 0.5rem 0.75rem;
  font-size: 0.875rem; font-family: 'Roboto', sans-serif; color: #333;
  background: white; transition: border-color 0.15s;
}
.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none; border-color: #1565C0; box-shadow: 0 0 0 3px rgba(21,101,192,0.08);
}
.form-input--error { border-color: #e53935 !important; }
.form-textarea { resize: vertical; }
.field-error { font-size: 0.75rem; color: #e53935; }

.delete-msg { font-size: 0.9rem; color: #333; margin: 0 0 0.5rem; }
.delete-warning { font-size: 0.82rem; color: #e53935; margin: 0; }

.modal-footer {
  display: flex; justify-content: flex-end; gap: 0.75rem;
  padding: 1rem 1.5rem; border-top: 1px solid #e8e8e8;
}

.spinner {
  width: 14px; height: 14px; border: 2px solid rgba(0,0,0,0.15);
  border-top-color: #333; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block;
}
.spinner-white { border-color: rgba(255,255,255,0.3); border-top-color: white; }
@keyframes spin { to { transform: rotate(360deg); } }

.access-denied { display: flex; flex-direction: column; align-items: center; padding: 4rem; color: #aaa; }
.access-icon { font-size: 4rem; margin-bottom: 1rem; }
.overlay-transparent { position: fixed; inset: 0; z-index: 99; }
</style>

<style scoped>
/* Extra: checkbox inline pentru câmpuri boolean în formular */
.checkbox-inline {
  display: inline-flex; align-items: center; gap: 10px;
  cursor: pointer; user-select: none; margin-top: 2px;
}
.checkbox-native { display: none; }
.checkbox-box {
  width: 18px; height: 18px; border: 2px solid #ddd; border-radius: 4px;
  background: white; flex-shrink: 0; position: relative; transition: all 0.15s;
}
.checkbox-native:checked + .checkbox-box {
  background: #1565C0; border-color: #1565C0;
}
.checkbox-native:checked + .checkbox-box::after {
  content: ''; position: absolute; left: 3px; top: 0px;
  width: 5px; height: 9px; border: 2px solid white;
  border-top: none; border-left: none; transform: rotate(45deg);
}
.checkbox-text-label { font-size: 0.875rem; color: #333; }
</style>
