<template>
  <div class="page">

    <!-- Header -->
    <div class="page-header">
      <div class="breadcrumb">
        <span class="breadcrumb-link" @click="$router.push('/planificare/nevoi')">Acasă</span>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">PAAP</span>
      </div>
      <div class="page-title-row">
        <h1 class="page__title">Programul Anual al Achizițiilor Publice</h1>
        <div class="titlebar-actions">
          <button v-if="canImport" class="btn btn-secondary" @click="importPaap">
            <i class="fas fa-file-import"></i> Importă PAAP
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <span class="spinner-lg"></span>
      <p>Se încarcă...</p>
    </div>

    <!-- Panel detaliu PAAP -->
    <div v-else-if="showPanel" class="panel-view">
      <div class="panel-topbar">
        <button class="btn btn-secondary btn-sm" @click="closePanel">
          <i class="fas fa-arrow-left"></i> Înapoi la listă
        </button>
        <button class="btn btn-danger btn-sm" @click="viewPdf(panelData)">
          <i class="far fa-file-pdf"></i> Previzualizare PDF
        </button>
        <span v-if="panelData.versionLabel" class="version-badge">
          {{ panelData.versionLabel }}
        </span>
      </div>

      <!-- Alert versiune -->
      <div v-if="panelData.alertMsg" class="alert-warning" v-html="panelData.alertMsg"></div>

      <!-- Sumar valori -->
      <div class="stats-row">
        <div class="stat-card">
          <i class="fas fa-sack-dollar"></i>
          <div class="stat-body">
            <span class="stat-value">{{ formatPrice(panelData.totalValueWithoutTva) }} LEI</span>
            <span class="stat-label">Total estimat</span>
          </div>
        </div>
        <div class="stat-card">
          <i class="fas fa-file-alt"></i>
          <div class="stat-body">
            <span class="stat-value">{{ panelReferences.length }}</span>
            <span class="stat-label">Nr. referate</span>
          </div>
        </div>
      </div>

      <!-- Tabel referate în PAAP -->
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nr.</th>
              <th>Denumire referat</th>
              <th>Departament</th>
              <th>Cod CPV</th>
              <th>U.M.</th>
              <th>Cantitate</th>
              <th class="num-cell">Val. fără TVA</th>
              <th class="num-cell">Val. cu TVA</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!panelReferences.length">
              <td colspan="9" class="empty-cell">Nu există referate asociate acestui PAAP.</td>
            </tr>
            <tr v-for="(ref, i) in panelReferences" :key="ref.id">
              <td>{{ i + 1 }}</td>
              <td>{{ ref.name || '-' }}</td>
              <td>{{ ref.department?.name || '-' }}</td>
              <td class="cpv-cell">{{ ref.cpvCode || '-' }}</td>
              <td>{{ ref.mu || '-' }}</td>
              <td>{{ ref.qty || '-' }}</td>
              <td class="num-cell">{{ formatPrice(ref.priceWoTva) }}</td>
              <td class="num-cell">{{ formatPrice(ref.priceWithTva) }}</td>
              <td>
                <span :class="['status-badge', `status-${ref.needReferateStatus}`]">
                  {{ statusLabels[ref.needReferateStatus] || ref.needReferateStatus || '-' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Lista PAAP -->
    <div v-else class="table-container">

      <!-- Filtre -->
      <div class="filters-row">
        <input v-model="filters.name" class="filter-input" placeholder="Caută denumire..." />
        <input v-model="filters.year" class="filter-input" placeholder="An PAAP..." type="number" />
        <select v-model="filters.status" class="filter-select">
          <option value="">Toate statusurile</option>
          <option value="draft">Draft</option>
          <option value="asteptare_aprobare">Așteptare aprobare</option>
          <option value="approved">Aprobat</option>
          <option value="rejected">Respins</option>
        </select>
        <select v-model="filters.version" class="filter-select">
          <option value="">Toate versiunile</option>
          <option value="1">Inițială</option>
          <option value="2">Actualizată</option>
          <option value="3">În execuție</option>
        </select>
        <button class="btn btn-ghost btn-sm" @click="clearFilters" title="Șterge filtre">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Tabel -->
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nr.</th>
              <th>Instituție</th>
              <th>Denumire</th>
              <th>Anul PAAP</th>
              <th class="num-cell">Suma totală</th>
              <th>Versiune</th>
              <th>Data creării</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!filteredRows.length">
              <td colspan="9" class="empty-cell">Nu există înregistrări.</td>
            </tr>
            <tr v-for="(row, i) in paginatedRows" :key="row.id" class="tr-data">
              <td>{{ pageFrom + i + 1 }}</td>
              <td>{{ row.institution?.name || '-' }}</td>
              <td>{{ row.name || '-' }}</td>
              <td>{{ row.paapyear || '-' }}</td>
              <td class="num-cell">{{ formatPrice(row.totalValueWithoutTva) }}</td>
              <td>{{ versionLabels[row.approveVersion] || '-' }}</td>
              <td>{{ formatDateTime(row.createdAt) }}</td>
              <td>
                <span :class="['status-badge', `status-${row.paapStatus}`]">
                  <i :class="statusIcons[row.paapStatus]?.icon" :style="statusIcons[row.paapStatus]?.css"></i>
                  {{ statusLabels[row.paapStatus] || row.paapStatus || '-' }}
                </span>
              </td>
              <td class="actions-cell">
                <!-- Vizualizare PDF -->
                <button class="action-btn" title="Previzualizare PDF" @click="viewPdf(row)">
                  <i class="far fa-file-pdf" style="color:#e53935;font-size:1.1rem;"></i>
                </button>
                <!-- Vizualizare detalii -->
                <button class="action-btn" title="Vizualizează centralizarea" @click="$router.push(`/planificare/paap/${row.id}/centralizare`)">
                  <i class="fas fa-eye" style="color:#1565C0;font-size:1.1rem;"></i>
                </button>
                <!-- Trimite spre aprobare -->
                <button
                  v-if="canEdit && ['draft','rejected'].includes(row.paapStatus)"
                  class="action-btn"
                  title="Trimite spre aprobare"
                  @click="requestApprove(row)"
                >
                  <i class="fas fa-paper-plane" style="color:#39f;font-size:1.1rem;"></i>
                </button>
                <!-- Verifică aprobare (supervizor_achizitii) -->
                <button
                  v-if="canCheckApproved && row.paapStatus === 'asteptare_aprobare'"
                  class="action-btn"
                  title="Verifică aprobare"
                  @click="checkApproved(row)"
                >
                  <i class="fas fa-sync" style="color:#F2994A;font-size:1.1rem;"></i>
                </button>
                <!-- Aprobare / Respingere -->
                <button
                  v-if="canApprove && row.paapStatus === 'asteptare_aprobare'"
                  class="action-btn"
                  title="Aprobă"
                  @click="changeStatus(row, 'approved')"
                >
                  <i class="fas fa-check-circle" style="color:#569a36;font-size:1.1rem;"></i>
                </button>
                <button
                  v-if="canApprove && row.paapStatus === 'asteptare_aprobare'"
                  class="action-btn"
                  title="Respinge"
                  @click="openRejectModal(row)"
                >
                  <i class="fas fa-times-circle" style="color:#e53935;font-size:1.1rem;"></i>
                </button>
                <!-- Ștergere -->
                <button
                  v-if="canEdit && row.paapStatus === 'draft'"
                  class="action-btn"
                  title="Șterge"
                  @click="confirmDelete(row)"
                >
                  <i class="fas fa-trash" style="color:#e53935;font-size:1.1rem;"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginare -->

      <div class="pagination-row">
        <span class="pagination-info">
          Total afișat: {{ filteredRows.length }} / {{ rows.length }}
        </span>
        <div class="pagination-controls">
          <span class="page-size-label">Rânduri pe pagină: {{ pageSize }}</span>
          <span class="page-range">{{ pageFrom + 1 }}-{{ Math.min(pageFrom + pageSize, filteredRows.length) }}</span>
          <button class="page-btn" :disabled="pageFrom === 0" @click="prevPage">
            <i class="fas fa-chevron-left"></i>
          </button>
          <button class="page-btn" :disabled="pageFrom + pageSize >= filteredRows.length" @click="nextPage">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal confirmare ștergere -->
    <div v-if="deleteModal.open" class="modal-overlay" @click.self="deleteModal.open = false">
      <div class="modal-box">
        <h3 class="modal-title">Ștergere PAAP</h3>
        <p>Ești sigur că vrei să ștergi PAAP-ul <strong>{{ deleteModal.row?.name }}</strong>?</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="deleteModal.open = false">Anulează</button>
          <button class="btn btn-danger" @click="doDelete" :disabled="saving">
            <span v-if="saving" class="spinner spinner-white"></span>
            Șterge
          </button>
        </div>
      </div>
    </div>

    <!-- Modal respingere -->
    <div v-if="rejectModal.open" class="modal-overlay" @click.self="rejectModal.open = false">
      <div class="modal-box">
        <h3 class="modal-title">Respinge PAAP</h3>
        <p style="margin-bottom:1rem;">Introduceți motivul respingerii:</p>
        <textarea v-model="rejectModal.reason" class="modal-textarea" rows="4" placeholder="Motivul respingerii..."></textarea>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="rejectModal.open = false">Anulează</button>
          <button class="btn btn-danger" @click="doReject" :disabled="saving || !rejectModal.reason.trim()">
            <span v-if="saving" class="spinner spinner-white"></span>
            Respinge
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import {
  PAAP_GET,
  PAAP_GET_ONE,
  PAAP_REQUEST_APPROVE,
  PAAP_APPROVE,
  PAAP_CHECK_APPROVED,
  PAAP_DELETE,
  PAAP_IMPORT,
  PAAP_GET_PDF
} from '@/api.js'

const STATUS_ICONS = {
  draft:               { icon: 'far fa-clock',           css: 'color:#f2da07;font-size:1rem;', tooltip: 'Draft' },
  asteptare_aprobare:  { icon: 'fas fa-clock',           css: 'color:#f2da07;font-size:1rem;', tooltip: 'Așteptare aprobare' },
  rejected:            { icon: 'fas fa-times-circle',    css: 'color:#ec4a4a;font-size:1rem;', tooltip: 'Respins' },
  approved:            { icon: 'fas fa-clipboard-check', css: 'color:#569a36;font-size:1rem;', tooltip: 'Aprobat' },
}

const STATUS_LABELS = {
  draft: 'Draft',
  asteptare_aprobare: 'Așteptare aprobare',
  rejected: 'Respins',
  approved: 'Aprobat',
  signature_waiting: 'Așteptare semnare',
  in_progress_signature: 'În curs de aprobare',
  completion: 'Trimis spre completare',
  completed: 'Completat',
  cancelled: 'Anulat'
}

const VERSION_LABELS = {
  1: 'Inițială',
  2: 'Actualizată',
  3: 'În execuție',
}

export default {
  name: 'Paap',

  data() {
    return {
      rows: [],
      loading: false,
      saving: false,
      panelData: null,
      panelReferences: [],
      filters: { name: '', year: '', status: '', version: '' },
      pageFrom: 0,
      pageSize: 15,
      deleteModal: { open: false, row: null },
      rejectModal: { open: false, row: null, reason: '' },
      statusIcons: STATUS_ICONS,
      statusLabels: STATUS_LABELS,
      versionLabels: VERSION_LABELS,
    }
  },

  computed: {
    role() {
      return window.$getRoleAll?.()?.role || ''
    },

    canEdit() {
      return ['responsabil_achizitii', 'supervizor_achizitii'].includes(this.role)
    },

    canImport() {
      return ['responsabil_achizitii'].includes(this.role)
    },

    canApprove() {
      return ['sef_institutie'].includes(this.role)
    },

    canCheckApproved() {
      return ['supervizor_achizitii'].includes(this.role)
    },

    showPanel() {
      return !!this.panelData
    },

    filteredRows() {
      let r = [...this.rows]
      if (this.filters.name) r = r.filter(x => x.name?.toLowerCase().includes(this.filters.name.toLowerCase()))
      if (this.filters.year) r = r.filter(x => String(x.paapyear) === String(this.filters.year))
      if (this.filters.status) r = r.filter(x => x.paapStatus === this.filters.status)
      if (this.filters.version) r = r.filter(x => String(x.approveVersion) === String(this.filters.version))
      return r
    },

    paginatedRows() {
      return this.filteredRows.slice(this.pageFrom, this.pageFrom + this.pageSize)
    }
  },

  methods: {
    async loadData() {
      this.loading = true
      try {
        const res = await PAAP_GET(1, 500)
        const data = await res.json()
        if (Array.isArray(data?.data?.result)) {
          this.rows = data.data.result
        }
      } catch(e) { console.error(e) }
      this.loading = false
    },

    async openPanel(row) {
      this.loading = true
      try {
        const res = await PAAP_GET_ONE(row.id)
        const data = await res.json()
        const result = data?.data?.result || row
        this.panelData = result
        this.panelReferences = result.needReferate || []
      } catch(e) {
        this.panelData = row
        this.panelReferences = row.needReferate || []
      }
      this.loading = false
    },

    closePanel() {
      this.panelData = null
      this.panelReferences = []
    },

    async viewPdf(row) {
      if (!row?.id) return
      try {
        const res = await PAAP_GET_PDF(row.id)
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        window.open(url, '_blank')
      } catch(e) {
        alert('Generarea PDF a eșuat.')
      }
    },

    async requestApprove(row) {
      if (!row?.id) return
      if (row.paapyear < new Date().getFullYear()) {
        alert('PAAP-ul nu mai poate fi modificat, nu se încadrează în anul curent.')
        return
      }
      this.saving = true
      try {
        const res = await PAAP_REQUEST_APPROVE(row.id)
        const data = await res.json()
        if (data?.data?.result?.url) {
          window.open(data.data.result.url, '_blank')
        }
        await this.loadData()
      } catch(e) { console.error(e) }
      this.saving = false
    },

    async changeStatus(row, status) {
      if (!row?.id) return
      this.saving = true
      try {
        await PAAP_APPROVE(row.id, { paapStatus: status })
        await this.loadData()
      } catch(e) { console.error(e) }
      this.saving = false
    },

    openRejectModal(row) {
      this.rejectModal = { open: true, row, reason: '' }
    },

    async doReject() {
      if (!this.rejectModal.reason.trim()) return
      this.saving = true
      try {
        await PAAP_APPROVE(this.rejectModal.row.id, { paapStatus: 'rejected', reason: this.rejectModal.reason })
        this.rejectModal.open = false
        await this.loadData()
      } catch(e) { console.error(e) }
      this.saving = false
    },

    async checkApproved(row) {
      if (!row?.id) return
      try {
        await PAAP_CHECK_APPROVED(row.id)
        await this.loadData()
      } catch(e) { console.error(e) }
    },

    confirmDelete(row) {
      this.deleteModal = { open: true, row }
    },

    async doDelete() {
      if (!this.deleteModal.row?.id) return
      this.saving = true
      try {
        await PAAP_DELETE(this.deleteModal.row.id)
        this.deleteModal.open = false
        await this.loadData()
      } catch(e) { console.error(e) }
      this.saving = false
    },

    importPaap() {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.csv'
      input.multiple = true
      input.style.display = 'none'
      document.body.appendChild(input)
      input.click()
      input.addEventListener('change', async () => {
        if (!input.files.length) return
        const formData = new FormData()
        for (const file of input.files) {
          if (file.type === 'text/csv') formData.append('files', file)
        }
        try {
          const res = await PAAP_IMPORT(formData)
          const data = await res.json()
          if (String(data?.meta?.HttpStatusCode)?.[0] === '2') {
            await this.loadData()
          } else {
            alert(data?.response || 'Importul a eșuat.')
          }
        } catch(e) { alert('A apărut o eroare la import.') }
        document.body.removeChild(input)
      })
    },

    clearFilters() {
      this.filters = { name: '', year: '', status: '', version: '' }
      this.pageFrom = 0
    },

    prevPage() { if (this.pageFrom > 0) this.pageFrom -= this.pageSize },
    nextPage() { if (this.pageFrom + this.pageSize < this.filteredRows.length) this.pageFrom += this.pageSize },

    formatPrice(val) {
      if (val === undefined || val === null || val === '') return '—'
      return Number(val).toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },

    formatDateTime(d) {
      if (!d) return '—'
      const dt = new Date(d)
      return `${String(dt.getDate()).padStart(2,'0')}.${String(dt.getMonth()+1).padStart(2,'0')}.${dt.getFullYear()} ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`
    },
  },

  created() {
    this.loadData()
  }
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; min-height: 100%; font-family: 'Roboto', sans-serif; }

.page-header { padding: 1rem 1.5rem 0.5rem; background: white; border-bottom: 1px solid #e0e8f0; }
.breadcrumb { font-size: 0.8rem; color: #888; margin-bottom: 0.5rem; }
.breadcrumb-link { cursor: pointer; color: #1565C0; }
.breadcrumb-link:hover { text-decoration: underline; }
.breadcrumb-sep { margin: 0 0.3rem; }
.breadcrumb-current { color: #555; }
.page-title-row { display: flex; align-items: center; justify-content: space-between; padding-bottom: 0.75rem; }
.page__title { font-size: 1.4rem; font-weight: 700; color: #1a2f4e; margin: 0; }

.titlebar-actions { display: flex; gap: 0.5rem; }

.loading-state { display: flex; flex-direction: column; align-items: center; padding: 4rem; color: #888; gap: 1rem; }
.spinner-lg { width: 36px; height: 36px; border: 3px solid #e0e8f8; border-top-color: #1565C0; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; }

/* Panel */
.panel-view { flex: 1; padding: 1.25rem 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
.panel-topbar { display: flex; align-items: center; gap: 0.75rem; }
.version-badge { background: #e3f2fd; color: #1565C0; font-size: 0.78rem; font-weight: 600; padding: 3px 10px; border-radius: 10px; }
.alert-warning { background: #fff8e1; border-left: 3px solid #f9a825; padding: 0.75rem 1rem; font-size: 0.875rem; color: #555; border-radius: 0 4px 4px 0; }

.stats-row { display: flex; gap: 1rem; }
.stat-card { background: white; border: 1px solid #e0e8f0; border-radius: 8px; padding: 1rem 1.25rem; display: flex; align-items: center; gap: 1rem; }
.stat-card i { font-size: 1.5rem; color: #1565C0; }
.stat-body { display: flex; flex-direction: column; }
.stat-value { font-size: 1.1rem; font-weight: 700; color: #1a2f4e; }
.stat-label { font-size: 0.78rem; color: #888; }

/* Table */
.table-container { flex: 1; padding: 1rem 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; }
.filters-row { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.filter-input, .filter-select { padding: 0.4rem 0.75rem; border: 1.5px solid #ddd; border-radius: 6px; font-size: 0.85rem; font-family: inherit; min-width: 140px; }
.filter-input:focus, .filter-select:focus { outline: none; border-color: #1565C0; }

.table-wrap { overflow-x: auto; background: white; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.data-table-scroll { flex: 1; overflow-y: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.data-table th { background: #1565C0; color: white; padding: 0.6rem 0.75rem; text-align: left; font-size: 0.78rem; font-weight: 600; white-space: nowrap; }
.data-table td { padding: 0.5rem 0.75rem; border-bottom: 1px solid #f0f0f0; vertical-align: middle; }
.data-table tr:last-child td { border-bottom: none; }
.data-table tr.tr-data:hover td { background: #f5f8ff; }
.num-cell { text-align: right; font-variant-numeric: tabular-nums; }
.cpv-cell { font-family: monospace; color: #1565C0; }
.empty-cell { text-align: center; color: #aaa; padding: 2rem; font-style: italic; }

.status-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 0.78rem; font-weight: 500; padding: 2px 8px; border-radius: 10px; white-space: nowrap; }
.status-draft { background: #fff9c4; color: #f57f17; }
.status-asteptare_aprobare { background: #fff3e0; color: #e65100; }
.status-approved { background: #e8f5e9; color: #2e7d32; }
.status-rejected { background: #ffebee; color: #c62828; }

.actions-cell { display: flex; gap: 4px; align-items: center; justify-content: flex-end; }
.action-btn { background: none; border: none; cursor: pointer; padding: 4px 6px; border-radius: 4px; transition: background 0.15s; }
.action-btn:hover { background: #f0f4ff; }

/* Paginare */
.pagination-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; color: #555; padding: 0.5rem 0.75rem; position: sticky; bottom: 0; z-index: 2; background: white; border-top: 1px solid #e8e8e8; }
.pagination-controls { display: flex; align-items: center; gap: 0.75rem; }
.page-btn { background: white; border: 1px solid #ddd; border-radius: 4px; padding: 4px 10px; cursor: pointer; font-size: 0.8rem; }
.page-btn:disabled { opacity: 0.4; cursor: default; }
.page-btn:not(:disabled):hover { background: #f0f4ff; border-color: #1565C0; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-box { background: white; border-radius: 10px; padding: 1.5rem; max-width: 480px; width: 90%; box-shadow: 0 8px 32px rgba(0,0,0,0.18); }
.modal-title { font-size: 1rem; font-weight: 700; color: #1a2f4e; margin-bottom: 0.75rem; }
.modal-textarea { width: 100%; border: 1.5px solid #ddd; border-radius: 6px; padding: 0.5rem 0.75rem; font-size: 0.875rem; font-family: inherit; resize: vertical; }
.modal-textarea:focus { outline: none; border-color: #1565C0; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem; }

/* Butoane */
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 0.45rem 1rem; border-radius: 6px; border: none; cursor: pointer; font-size: 0.875rem; font-weight: 500; font-family: inherit; transition: background 0.15s; }
.btn-sm { padding: 0.35rem 0.75rem; font-size: 0.82rem; }
.btn-secondary { background: #f5f5f5; color: #333; border: 1px solid #ddd; }
.btn-secondary:hover { background: #e8e8e8; }
.btn-danger { background: #e53935; color: white; }
.btn-danger:hover:not(:disabled) { background: #c62828; }
.btn-danger:disabled { opacity: 0.5; cursor: default; }
.btn-ghost { background: transparent; color: #888; border: 1px solid #ddd; }
.btn-ghost:hover { background: #f5f5f5; }

.spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
