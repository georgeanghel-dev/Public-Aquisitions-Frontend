<template>
  <div class="page">

    <!-- Header -->
    <div class="page-header">
      <div class="breadcrumb">
        <span class="breadcrumb-link" @click="$router.push('/planificare/paap')">Acasă</span>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-link" @click="$router.push('/planificare/paap')">PAAP</span>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">{{ paap.name || 'Centralizare' }}</span>
      </div>
      <div class="page-title-row">
        <div class="paap-title-info">
          <h1 class="page__title">{{ paap.name || 'Centralizare PAAP' }}</h1>
          <div class="paap-meta">
            <span class="meta-badge">An: {{ paap.paapyear || '-' }}</span>
            <span :class="['meta-badge', `status-${paap.paapStatus}`]">
              {{ statusLabels[paap.paapStatus] || paap.paapStatus }}
            </span>
            <span class="meta-badge">{{ versionLabels[paap.approveVersion] || '-' }}</span>
          </div>
        </div>
        <div class="titlebar-actions">
          <button class="btn btn-secondary btn-sm" @click="$router.push('/planificare/paap')">
            <i class="fas fa-arrow-left"></i> Înapoi
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <span class="spinner-lg"></span>
      <p>Se încarcă centralizarea...</p>
    </div>

    <div v-else class="page-body">

      <!-- Sumar PAAP -->
      <div class="stats-row">
        <div class="stat-card">
          <i class="fas fa-money-bill-wave"></i>
          <div class="stat-body">
            <span class="stat-value">{{ formatPrice(paap.totalValueWithoutTva) }} LEI</span>
            <span class="stat-label">Valoare totală estimată (fără TVA)</span>
          </div>
        </div>
        <div class="stat-card">
          <i class="fas fa-layer-group"></i>
          <div class="stat-body">
            <span class="stat-value">{{ totalRecords }}</span>
            <span class="stat-label">Linii centralizare</span>
          </div>
        </div>
        <div class="stat-card">
          <i class="fas fa-file-alt"></i>
          <div class="stat-body">
            <span class="stat-value">{{ paap.approvedReferencesCount || '-' }}</span>
            <span class="stat-label">Referate aprobate incluse</span>
          </div>
        </div>
      </div>

      <!-- Filtre -->
      <div class="filters-row">
        <input v-model="filters.name" class="filter-input" placeholder="Caută denumire..." @input="pageFrom = 0" />
        <input v-model="filters.cpv" class="filter-input" placeholder="Cod CPV..." @input="pageFrom = 0" />
        <button class="btn btn-ghost btn-sm" @click="clearFilters" title="Șterge filtre">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Tabel centralizare -->
      <div class="table-wrap">
        <div class="data-table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th class="nr-col">Nr.</th>
              <th>Denumire</th>
              <th>CPV — Denumire</th>
              <th>Procedura stabilită</th>
              <th>Rezultatul procedurii</th>
              <th class="num-cell">Val. estimată (LEI fără TVA)</th>
              <th>Sursa de finanțare</th>
              <th>Data est. inițiere</th>
              <th>Data est. atribuire</th>
              <th>Modalitate derulare</th>
              <th>Persoana responsabilă</th>
              <th>Data introducerii în PAAP</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!filteredRows.length">
              <td colspan="13" class="empty-cell">Nu există linii de centralizare.</td>
            </tr>
            <tr v-for="(row, i) in paginatedRows" :key="row.id" class="tr-data">
              <td class="nr-col">{{ pageFrom + i + 1 }}</td>
              <td>{{ row.name || '-' }}</td>
              <td class="cpv-cell">{{ row.cpvCode ? `${row.cpvCode} — ${row.cpvCodeName}` : '-' }}</td>
              <td>{{ row.procedureType?.name || '-' }}</td>
              <td>{{ row.procedureResult || '-' }}</td>
              <td class="num-cell">{{ formatPrice(row.totalValueWithoutTva) }}</td>
              <td>{{ row.financingSource?.sourceName || '-' }}</td>
              <td :class="{ 'date-warning': isDateWarning(row) }">
                {{ formatMonth(row.estimateInitProcedureDate) }}
              </td>
              <td>{{ formatMonth(row.estimateDateForSignContract) }}</td>
              <td>{{ row.modalityToProcessProcedure || '-' }}</td>
              <td>{{ formatResponsable(row.responsablePersonRole) }}</td>
              <td>{{ formatDate(row.dateForLastProcedureAdded) }}</td>
              <td class="actions-cell">
                <!-- Vizualizare referate -->
                <button class="action-btn" title="Vizualizează referatele" @click="openReferences(row)">
                  <i class="fas fa-eye" style="color:#1565C0;font-size:1.1rem;"></i>
                </button>
                <!-- Editare (doar dacă PAAP e draft/rejected și în anul curent) -->
                <button
                  v-if="canEdit && ['draft','rejected'].includes(paap.paapStatus)"
                  class="action-btn"
                  title="Editează"
                  @click="openEditModal(row)"
                >
                  <i class="fas fa-pencil-alt" style="color:#F2994A;font-size:1.1rem;"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginare -->
        </div><!-- /data-table-scroll -->

      <div class="pagination-row">
        <span class="pagination-info">Total: {{ filteredRows.length }} linii</span>
        <div class="pagination-controls">
          <span class="page-size-label">Rânduri pe pagină: {{ pageSize }}</span>
          <span class="page-range">
            {{ filteredRows.length ? pageFrom + 1 : 0 }}–{{ Math.min(pageFrom + pageSize, filteredRows.length) }}
          </span>
          <button class="page-btn" :disabled="pageFrom === 0" @click="prevPage">
            <i class="fas fa-chevron-left"></i>
          </button>
          <button class="page-btn" :disabled="pageFrom + pageSize >= filteredRows.length" @click="nextPage">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal referате asociate liniei -->
    <div v-if="refsModal.open" class="modal-overlay" @click.self="refsModal.open = false">
      <div class="modal-box modal-wide">
        <div class="modal-header">
          <h3 class="modal-title">Referate incluse — {{ refsModal.row?.name }}</h3>
          <button class="modal-close" @click="refsModal.open = false">✕</button>
        </div>
        <div v-if="refsModal.loading" class="modal-loading">
          <span class="spinner-sm"></span> Se încarcă...
        </div>
        <div v-else class="table-wrap" style="max-height:400px; overflow-y:auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Nr.</th>
                <th>Denumire referat</th>
                <th>Departament</th>
                <th>Utilizator</th>
                <th class="num-cell">Val. fără TVA</th>
                <th class="num-cell">Val. cu TVA</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!refsModal.refs.length">
                <td colspan="7" class="empty-cell">Nu există referate asociate.</td>
              </tr>
              <tr v-for="(ref, i) in refsModal.refs" :key="ref.id">
                <td>{{ i + 1 }}</td>
                <td>{{ ref.name || '-' }}</td>
                <td>{{ ref.department?.name || '-' }}</td>
                <td>{{ formatUser(ref.createdByUser) }}</td>
                <td class="num-cell">{{ formatPrice(ref.sumnr) }}</td>
                <td class="num-cell">{{ formatPrice(ref.sumnrWithTva) }}</td>
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
    </div>

    <!-- Modal editare linie centralizare -->
    <div v-if="editModal.open" class="modal-overlay" @click.self="editModal.open = false">
      <div class="modal-box modal-wide">
        <div class="modal-header">
          <h3 class="modal-title">Editează centralizarea</h3>
          <button class="modal-close" @click="editModal.open = false">✕</button>
        </div>

        <div class="edit-form">
          <!-- Read-only -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Denumire procedură</label>
              <input type="text" class="form-input form-input--readonly" :value="editModal.data.name" readonly />
            </div>
            <div class="form-group">
              <label class="form-label">CPV — Denumire</label>
              <input type="text" class="form-input form-input--readonly" :value="editModal.data.cpvCode ? `${editModal.data.cpvCode} — ${editModal.data.cpvCodeName}` : '-'" readonly />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Suma totală (fără TVA)</label>
              <input type="text" class="form-input form-input--readonly" :value="formatPrice(editModal.data.totalValueWithoutTva)" readonly />
            </div>
            <div class="form-group">
              <label class="form-label">Procedura recomandată</label>
              <input type="text" class="form-input form-input--readonly" :value="editModal.data.recomendedProcedureType?.name || '-'" readonly />
            </div>
          </div>

          <!-- Editabile -->
          <div class="form-group">
            <label class="form-label">Procedura stabilită <span class="required">*</span></label>
            <select v-model="editModal.form.procedureType" class="form-select">
              <option value="">— Selectează —</option>
              <option v-for="p in editModal.procedures" :key="p.id" :value="p">{{ p.name }}</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Rezultatul procedurii <span class="required">*</span></label>
            <select v-model="editModal.form.procedureResult" class="form-select">
              <option value="">— Selectează —</option>
              <option>Acord-cadru</option>
              <option>Acord-cadru/Contract subsecvent</option>
              <option>Angajament legal</option>
              <option>Contract subsecvent</option>
              <option>Contract</option>
              <option>Comandă fermă</option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Data estimată inițiere procedură <span class="required">*</span></label>
              <input type="date" v-model="editModal.form.estimateInitProcedureDate" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Data estimată atribuire contract <span class="required">*</span></label>
              <input type="date" v-model="editModal.form.estimateDateForSignContract" class="form-input" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Sursa de finanțare <span class="required">*</span></label>
            <select v-model="editModal.form.financingSource" class="form-select">
              <option value="">— Selectează —</option>
              <option v-for="f in editModal.financing" :key="f.id" :value="f">{{ f.sourceName }}</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Modalitatea de derulare <span class="required">*</span></label>
            <select v-model="editModal.form.modalityToProcessProcedure" class="form-select">
              <option value="">— Selectează —</option>
              <option>online</option>
              <option>offline</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Persoana responsabilă <span class="required">*</span></label>
            <select v-model="editModal.form.responsablePersonRole" class="form-select">
              <option value="">— Selectează —</option>
              <option v-for="u in editModal.users" :key="u.id" :value="u">{{ u.label }}</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Data introducerii în PAAP</label>
            <input type="date" v-model="editModal.form.dateForLastProcedureAdded" class="form-input" disabled />
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn btn-secondary" @click="editModal.open = false">Anulează</button>
          <button class="btn btn-primary" @click="saveEdit" :disabled="saving">
            <span v-if="saving" class="spinner spinner-white"></span>
            Salvează
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import {
  PAAP_GET_ONE,
  PAAP_CENTRALIZATION_GET_PAGINATED,
  PAAP_CENTRALIZATION_GET_REFS,
  PAAP_CENTRALIZATION_EDIT,
  FINANCING,
  PROCEDURE_TYPES
} from '@/api.js'

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

const VERSION_LABELS = { 1: 'Inițială', 2: 'Actualizată', 3: 'În execuție' }

export default {
  name: 'PaapCentralization',

  data() {
    return {
      paap: {},
      rows: [],
      loading: false,
      saving: false,
      totalRecords: 0,
      filters: { name: '', cpv: '' },
      pageFrom: 0,
      pageSize: 15,
      statusLabels: STATUS_LABELS,
      versionLabels: VERSION_LABELS,
      refsModal: { open: false, row: null, refs: [], loading: false },
      editModal: {
        open: false,
        data: {},
        form: {},
        procedures: [],
        financing: [],
        users: [],
      },
    }
  },

  computed: {
    paapId() {
      return +this.$route?.params?.id
    },

    role() {
      return window.$getRoleAll?.()?.role || ''
    },

    canEdit() {
      return ['responsabil_achizitii', 'supervizor_achizitii'].includes(this.role)
    },

    filteredRows() {
      let r = [...this.rows]
      if (this.filters.name) r = r.filter(x => x.name?.toLowerCase().includes(this.filters.name.toLowerCase()))
      if (this.filters.cpv) r = r.filter(x => x.cpvCode?.includes(this.filters.cpv))
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
        // Încarcă datele PAAP
        const paapRes = await PAAP_GET_ONE(this.paapId)
        const paapData = await paapRes.json()
        this.paap = paapData?.data?.result || {}

        // Încarcă liniile de centralizare
        const res = await PAAP_CENTRALIZATION_GET_PAGINATED(1, 500, `paapId=${this.paapId}`)
        const data = await res.json()
        if (Array.isArray(data?.data?.result)) {
          this.rows = data.data.result
          this.totalRecords = data.data.recordsQuantity || this.rows.length
        }
      } catch(e) { console.error(e) }
      this.loading = false
    },

    async openReferences(row) {
      this.refsModal = { open: true, row, refs: [], loading: true }
      try {
        const res = await PAAP_CENTRALIZATION_GET_REFS(1, 100, row.id)
        const data = await res.json()
        this.refsModal.refs = Array.isArray(data?.data?.result) ? data.data.result : []
      } catch(e) { console.error(e) }
      this.refsModal.loading = false
    },

    async openEditModal(row) {
      this.editModal = {
        open: true,
        data: { ...row },
        form: {
          procedureType: row.procedureType || '',
          procedureResult: row.procedureResult || '',
          estimateInitProcedureDate: row.estimateInitProcedureDate ? row.estimateInitProcedureDate.slice(0, 10) : '',
          estimateDateForSignContract: row.estimateDateForSignContract ? row.estimateDateForSignContract.slice(0, 10) : '',
          financingSource: row.financingSource || '',
          modalityToProcessProcedure: row.modalityToProcessProcedure || '',
          responsablePersonRole: row.responsablePersonRole || '',
          dateForLastProcedureAdded: row.dateForLastProcedureAdded ? row.dateForLastProcedureAdded.slice(0, 10) : '',
        },
        procedures: [],
        financing: [],
        users: [],
      }
      // Încarcă opțiunile pentru select-uri
      try {
        const [procRes, finRes] = await Promise.all([
          PROCEDURE_TYPES.get(1, 500),
          FINANCING.get(1, 500)
        ])
        const procData = await procRes.json()
        const finData = await finRes.json()
        this.editModal.procedures = procData?.data?.result || []
        this.editModal.financing = finData?.data?.result || []
      } catch(e) { console.error(e) }
    },

    async saveEdit() {
      const f = this.editModal.form
      const required = ['procedureType', 'procedureResult', 'estimateInitProcedureDate',
        'estimateDateForSignContract', 'financingSource', 'modalityToProcessProcedure']
      for (const key of required) {
        if (!f[key]) { alert('Completați toate câmpurile obligatorii.'); return }
      }

      this.saving = true
      try {
        const sendData = {
          procedureResult: f.procedureResult,
          estimateInitProcedureDate: new Date(f.estimateInitProcedureDate).toISOString(),
          estimateDateForSignContract: new Date(f.estimateDateForSignContract).toISOString(),
          modalityToProcessProcedure: f.modalityToProcessProcedure,
          financingSource: f.financingSource?.id ? { id: f.financingSource.id } : f.financingSource,
          procedureType: f.procedureType?.id ? { id: f.procedureType.id } : f.procedureType,
          ...(f.responsablePersonRole?.id ? { responsablePersonRole: { id: f.responsablePersonRole.id } } : {}),
        }
        const res = await PAAP_CENTRALIZATION_EDIT(this.editModal.data.id, sendData)
        const data = await res.json()
        if (String(data?.meta?.HttpStatusCode)?.[0] === '2') {
          this.editModal.open = false
          await this.loadData()
        } else {
          alert(data?.response || 'Salvarea a eșuat.')
        }
      } catch(e) { console.error(e) }
      this.saving = false
    },

    clearFilters() {
      this.filters = { name: '', cpv: '' }
      this.pageFrom = 0
    },

    prevPage() { if (this.pageFrom > 0) this.pageFrom -= this.pageSize },
    nextPage() { if (this.pageFrom + this.pageSize < this.filteredRows.length) this.pageFrom += this.pageSize },

    isDateWarning(row) {
      if (!row.estimateInitProcedureDate) return false
      const init = new Date(row.estimateInitProcedureDate)
      const sign = row.estimateDateForSignContract ? new Date(row.estimateDateForSignContract) : null
      return init < new Date() || (sign && init > sign)
    },

    formatPrice(val) {
      if (val === undefined || val === null || val === '') return '—'
      return Number(val).toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },

    formatDate(d) {
      if (!d) return '—'
      const dt = new Date(d)
      return `${String(dt.getDate()).padStart(2,'0')}.${String(dt.getMonth()+1).padStart(2,'0')}.${dt.getFullYear()}`
    },

    formatMonth(d) {
      if (!d) return '—'
      return new Date(d).toLocaleString('ro-ro', { month: 'long', year: 'numeric' })
    },

    formatUser(user) {
      if (!user) return '—'
      return `${user.last_name || ''} ${user.first_name || ''}`.trim() || '—'
    },

    formatResponsable(r) {
      if (!r) return '—'
      const name = this.formatUser(r.user)
      const dept = r.department?.name ? ` — ${r.department.name}` : ''
      return `${name}${dept}`
    },
  },

  created() {
    if (this.paapId) this.loadData()
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
.page-title-row { display: flex; align-items: flex-start; justify-content: space-between; padding-bottom: 0.75rem; gap: 1rem; }
.paap-title-info { display: flex; flex-direction: column; gap: 0.4rem; }
.page__title { font-size: 1.4rem; font-weight: 700; color: #1a2f4e; margin: 0; }
.paap-meta { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.meta-badge { font-size: 0.75rem; font-weight: 600; padding: 2px 8px; border-radius: 10px; background: #e3f2fd; color: #1565C0; }
.status-approved { background: #e8f5e9 !important; color: #2e7d32 !important; }
.status-rejected { background: #ffebee !important; color: #c62828 !important; }
.status-asteptare_aprobare { background: #fff3e0 !important; color: #e65100 !important; }
.status-draft { background: #fff9c4 !important; color: #f57f17 !important; }

.loading-state { display: flex; flex-direction: column; align-items: center; padding: 4rem; color: #888; gap: 1rem; }
.spinner-lg { width: 36px; height: 36px; border: 3px solid #e0e8f8; border-top-color: #1565C0; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; }

.page-body { flex: 1; padding: 1rem 1.5rem; display: flex; flex-direction: column; gap: 1rem; }

.stats-row { display: flex; gap: 1rem; flex-wrap: wrap; }
.stat-card { background: white; border: 1px solid #e0e8f0; border-radius: 8px; padding: 0.875rem 1.25rem; display: flex; align-items: center; gap: 1rem; flex: 1; min-width: 200px; }
.stat-card i { font-size: 1.4rem; color: #1565C0; }
.stat-body { display: flex; flex-direction: column; }
.stat-value { font-size: 1rem; font-weight: 700; color: #1a2f4e; }
.stat-label { font-size: 0.75rem; color: #888; }

.filters-row { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.filter-input { padding: 0.4rem 0.75rem; border: 1.5px solid #ddd; border-radius: 6px; font-size: 0.85rem; font-family: inherit; min-width: 160px; }
.filter-input:focus { outline: none; border-color: #1565C0; }

.table-wrap { overflow-x: auto; background: white; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.data-table-scroll { flex: 1; overflow-y: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; min-width: 1200px; }
.data-table th { background: #1565C0; color: white; padding: 0.55rem 0.65rem; text-align: left; font-size: 0.72rem; font-weight: 600; white-space: nowrap; line-height: 1.3; }
.data-table td { padding: 0.45rem 0.65rem; border-bottom: 1px solid #f0f0f0; vertical-align: middle; font-size: 0.8rem; }
.data-table tr:last-child td { border-bottom: none; }
.data-table tr.tr-data:hover td { background: #f5f8ff; }
.nr-col { width: 40px; text-align: center; }
.num-cell { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
.cpv-cell { font-family: monospace; font-size: 0.75rem; color: #1565C0; }
.empty-cell { text-align: center; color: #aaa; padding: 2rem; font-style: italic; }
.date-warning { background: rgba(255, 0, 0, 0.08) !important; color: #c62828; }

.status-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 0.72rem; font-weight: 500; padding: 2px 7px; border-radius: 10px; white-space: nowrap; }

.actions-cell { display: flex; gap: 4px; align-items: center; justify-content: flex-end; white-space: nowrap; }
.action-btn { background: none; border: none; cursor: pointer; padding: 4px 5px; border-radius: 4px; transition: background 0.15s; }
.action-btn:hover { background: #f0f4ff; }

.pagination-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; color: #555; position: sticky; bottom: 0; z-index: 2; background: white; padding: 0.5rem 0.75rem; border-top: 1px solid #e8e8e8; }
.pagination-controls { display: flex; align-items: center; gap: 0.75rem; }
.page-btn { background: white; border: 1px solid #ddd; border-radius: 4px; padding: 4px 10px; cursor: pointer; }
.page-btn:disabled { opacity: 0.4; cursor: default; }
.page-btn:not(:disabled):hover { background: #f0f4ff; border-color: #1565C0; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
.modal-box { background: white; border-radius: 10px; padding: 1.5rem; max-width: 520px; width: 100%; box-shadow: 0 8px 32px rgba(0,0,0,0.18); max-height: 90vh; overflow-y: auto; }
.modal-wide { max-width: 900px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.modal-title { font-size: 1rem; font-weight: 700; color: #1a2f4e; margin: 0; }
.modal-close { background: none; border: none; cursor: pointer; font-size: 1rem; color: #888; padding: 2px 6px; }
.modal-close:hover { color: #333; }
.modal-loading { display: flex; align-items: center; gap: 0.5rem; color: #888; font-size: 0.875rem; padding: 1rem 0; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem; }

/* Edit form */
.edit-form { display: flex; flex-direction: column; gap: 0.75rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.form-group { display: flex; flex-direction: column; gap: 4px; }
.form-label { font-size: 0.78rem; font-weight: 500; color: #444; }
.required { color: #e53935; }
.form-input, .form-select { border: 1.5px solid #ddd; border-radius: 6px; padding: 0.45rem 0.75rem; font-size: 0.875rem; font-family: inherit; }
.form-input:focus, .form-select:focus { outline: none; border-color: #1565C0; }
.form-input--readonly { background: #f8f9fc; color: #666; }
.form-select:disabled { background: #f8f9fc; color: #aaa; }

/* Butoane */
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 0.45rem 1rem; border-radius: 6px; border: none; cursor: pointer; font-size: 0.875rem; font-weight: 500; font-family: inherit; transition: background 0.15s; }
.btn-sm { padding: 0.35rem 0.75rem; font-size: 0.82rem; }
.btn-primary { background: #1565C0; color: white; }
.btn-primary:hover:not(:disabled) { background: #1251a3; }
.btn-primary:disabled { opacity: 0.5; cursor: default; }
.btn-secondary { background: #f5f5f5; color: #333; border: 1px solid #ddd; }
.btn-secondary:hover { background: #e8e8e8; }
.btn-ghost { background: transparent; color: #888; border: 1px solid #ddd; }
.btn-ghost:hover { background: #f5f5f5; }
.titlebar-actions { display: flex; gap: 0.5rem; }

.spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; }
.spinner-sm { width: 14px; height: 14px; border: 2px solid #e0e8f8; border-top-color: #1565C0; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; }
.spinner-white { border-color: rgba(255,255,255,0.3); border-top-color: white; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
