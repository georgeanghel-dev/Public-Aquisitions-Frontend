<template>
  <div class="page">
    <div class="page-header">
      <div class="breadcrumb">
        <span class="breadcrumb-link" @click="$router.push('/')">Acasă</span>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">Atribuire</span>
      </div>
      <h1 class="page__title">{{ currentProcedureName || 'Atribuire' }}</h1>
    </div>

    <div v-if="loading" class="loading-state">
      <span class="spinner-lg"></span>
      <p>Se încarcă...</p>
    </div>

    <div v-else class="table-container">
      <div class="filters-row">
        <input v-model="filters.name" class="filter-input" placeholder="Caută denumire..." @input="pageFrom = 0" />
        <input v-model="filters.cpv" class="filter-input" placeholder="Cod CPV..." @input="pageFrom = 0" />
        <button class="btn btn-ghost btn-sm" @click="clearFilters" title="Șterge filtre">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="table-wrap">
        <div class="data-table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nr.</th>
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
              <td colspan="13" class="empty-cell">Nu există înregistrări pentru această procedură.</td>
            </tr>
            <tr v-for="(row, i) in paginatedRows" :key="row.id" class="tr-data">
              <td>{{ pageFrom + i + 1 }}</td>
              <td>{{ row.name || '-' }}</td>
              <td class="cpv-cell">{{ row.cpvCode ? `${row.cpvCode} — ${row.cpvCodeName}` : '-' }}</td>
              <td>{{ row.procedureType?.name || '-' }}</td>
              <td>{{ row.procedureResult || '-' }}</td>
              <td class="num-cell">{{ formatPrice(row.totalValueWithoutTva) }}</td>
              <td>{{ row.financingSource?.sourceName || '-' }}</td>
              <td>{{ formatMonth(row.estimateInitProcedureDate) }}</td>
              <td>{{ formatMonth(row.estimateDateForSignContract) }}</td>
              <td>{{ row.modalityToProcessProcedure || '-' }}</td>
              <td>{{ formatResponsable(row.responsablePersonRole) }}</td>
              <td>{{ formatDate(row.dateForLastProcedureAdded) }}</td>
              <td class="actions-cell">
                <button class="action-btn" title="Referate" @click="viewReferences(row)">
                  <i class="fas fa-file-alt" style="color:#1565C0;font-size:1.1rem;"></i>
                </button>
                <button v-if="row.acquisitions?.length" class="action-btn" title="Achiziții" @click="viewAcquisitions(row)">
                  <i class="fas fa-gears" style="color:green;font-size:1.1rem;"></i>
                </button>
                <button v-if="row.verbalProcess?.length" class="action-btn" title="Procese verbale" @click="viewVerbalProcess(row)">
                  <i class="fas fa-folder" style="color:green;font-size:1.1rem;"></i>
                </button>
                <button v-if="row.announcement?.length" class="action-btn" title="Anunțuri" @click="viewAnnouncement(row)">
                  <i class="fas fa-bullhorn" style="color:green;font-size:1.1rem;"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
        </div><!-- /data-table-scroll -->


      <div class="pagination-row">
        <span class="pagination-info">Total: {{ filteredRows.length }}</span>
        <div class="pagination-controls">
          <span class="page-size-label">Rânduri pe pagină: {{ pageSize }}</span>
          <span class="page-range">{{ filteredRows.length ? pageFrom + 1 : 0 }}–{{ Math.min(pageFrom + pageSize, filteredRows.length) }}</span>
          <button class="page-btn" :disabled="pageFrom === 0" @click="prevPage"><i class="fas fa-chevron-left"></i></button>
          <button class="page-btn" :disabled="pageFrom + pageSize >= filteredRows.length" @click="nextPage"><i class="fas fa-chevron-right"></i></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { PAAP_CENTRALIZATION_GET_PAGINATED } from '@/api.js'

export default {
  name: 'Assignments',
  data() {
    return {
      rows: [],
      loading: false,
      filters: { name: '', cpv: '' },
      pageFrom: 0,
      pageSize: 15,
    }
  },
  computed: {
    procedureType() { return this.$route?.params?.procedureType || '' },
    procedureId() { return this.$store?.getters?.procedureTypes?.[this.procedureType]?.id || '' },
    currentProcedureName() { return this.$store?.getters?.procedureTypes?.[this.procedureType]?.name || '' },
    filteredRows() {
      let r = [...this.rows]
      if (this.filters.name) r = r.filter(x => x.name?.toLowerCase().includes(this.filters.name.toLowerCase()))
      if (this.filters.cpv) r = r.filter(x => x.cpvCode?.includes(this.filters.cpv))
      return r
    },
    paginatedRows() { return this.filteredRows.slice(this.pageFrom, this.pageFrom + this.pageSize) }
  },
  methods: {
    async loadData() {
      if (!this.procedureId) return
      this.loading = true
      try {
        const res = await PAAP_CENTRALIZATION_GET_PAGINATED(1, 500, `procedureTypeId=${this.procedureId}`)
        const data = await res.json()
        this.rows = Array.isArray(data?.data?.result) ? data.data.result : []
      } catch(e) { console.error(e) }
      this.loading = false
    },
    viewReferences(row) { this.$router.push(`/atribuire/procedura/${this.procedureType}/${row.id}`) },
    viewAcquisitions(row) { this.$router.push(`/atribuire/procedura/${this.procedureType}/${row.id}/achizitii`) },
    viewVerbalProcess(row) { this.$router.push(`/atribuire/procedura/${this.procedureType}/${row.id}/proces-verbal`) },
    viewAnnouncement(row) { this.$router.push(`/atribuire/procedura/${this.procedureType}/${row.id}/anunt`) },
    clearFilters() { this.filters = { name: '', cpv: '' }; this.pageFrom = 0 },
    prevPage() { if (this.pageFrom > 0) this.pageFrom -= this.pageSize },
    nextPage() { if (this.pageFrom + this.pageSize < this.filteredRows.length) this.pageFrom += this.pageSize },
    formatPrice(val) {
      if (val === undefined || val === null || val === '') return '—'
      return Number(val).toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    formatDate(d) {
      if (!d) return '—'
      const dt = new Date(d)
      return `${String(dt.getDate()).padStart(2,'0')}.${String(dt.getMonth()+1).padStart(2,'0')}.${dt.getFullYear()}`
    },
    formatMonth(d) { if (!d) return '—'; return new Date(d).toLocaleString('ro-ro', { month: 'long', year: 'numeric' }) },
    formatResponsable(r) {
      if (!r) return '—'
      const u = r.user
      const name = u ? `${u.last_name || ''} ${u.first_name || ''}`.trim() : ''
      const dept = r.department?.name ? ` — ${r.department.name}` : ''
      return `${name}${dept}` || '—'
    },
  },
  watch: {
    '$route.params.procedureType'() { this.rows = []; this.loadData() },
    procedureId(val) { if (val) this.loadData() }
  },
  created() { this.loadData() }
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
.page__title { font-size: 1.4rem; font-weight: 700; color: #1a2f4e; margin: 0 0 0.5rem; }
.loading-state { display: flex; flex-direction: column; align-items: center; padding: 4rem; color: #888; gap: 1rem; }
.spinner-lg { width: 36px; height: 36px; border: 3px solid #e0e8f8; border-top-color: #1565C0; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; }
.table-container { flex: 1; padding: 1rem 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; }
.filters-row { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.filter-input { padding: 0.4rem 0.75rem; border: 1.5px solid #ddd; border-radius: 6px; font-size: 0.85rem; font-family: inherit; min-width: 160px; }
.filter-input:focus { outline: none; border-color: #1565C0; }
.table-wrap { overflow-x: auto; background: white; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.data-table-scroll { flex: 1; overflow-y: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; min-width: 1200px; }
.data-table th { background: #1565C0; color: white; padding: 0.55rem 0.65rem; text-align: left; font-size: 0.72rem; font-weight: 600; white-space: nowrap; }
.data-table td { padding: 0.45rem 0.65rem; border-bottom: 1px solid #f0f0f0; vertical-align: middle; }
.data-table tr:last-child td { border-bottom: none; }
.data-table tr.tr-data:hover td { background: #f5f8ff; }
.num-cell { text-align: right; font-variant-numeric: tabular-nums; }
.cpv-cell { font-family: monospace; font-size: 0.75rem; color: #1565C0; }
.empty-cell { text-align: center; color: #aaa; padding: 2rem; font-style: italic; }
.actions-cell { display: flex; gap: 4px; align-items: center; justify-content: flex-end; }
.action-btn { background: none; border: none; cursor: pointer; padding: 4px 5px; border-radius: 4px; transition: background 0.15s; }
.action-btn:hover { background: #f0f4ff; }
.pagination-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; color: #555; position: sticky; bottom: 0; z-index: 2; background: white; padding: 0.5rem 0.75rem; border-top: 1px solid #e8e8e8; }
.pagination-controls { display: flex; align-items: center; gap: 0.75rem; }
.page-btn { background: white; border: 1px solid #ddd; border-radius: 4px; padding: 4px 10px; cursor: pointer; }
.page-btn:disabled { opacity: 0.4; cursor: default; }
.page-btn:not(:disabled):hover { background: #f0f4ff; border-color: #1565C0; }
.btn { display: inline-flex; align-items: center; gap: 6px; padding: 0.45rem 1rem; border-radius: 6px; border: none; cursor: pointer; font-size: 0.875rem; font-weight: 500; font-family: inherit; }
.btn-sm { padding: 0.35rem 0.75rem; font-size: 0.82rem; }
.btn-ghost { background: transparent; color: #888; border: 1px solid #ddd; }
.btn-ghost:hover { background: #f5f5f5; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
