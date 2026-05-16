<template>
  <div class="page">
    <div class="page-header">
      <div class="breadcrumb">
        <span class="breadcrumb-link" @click="goBack('procedura')">Atribuire</span>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-link" @click="goBack('referate')">Referate</span>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">Achiziții</span>
      </div>
      <h1 class="page__title">Achiziții</h1>
    </div>

    <div v-if="loading" class="loading-state"><span class="spinner-lg"></span></div>

    <div v-else class="table-container">
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nr.</th>
              <th>Număr achiziție</th>
              <th>Data achiziție</th>
              <th>Furnizor</th>
              <th class="num-cell">Val. fără TVA</th>
              <th class="num-cell">Cotă TVA</th>
              <th class="num-cell">Val. cu TVA</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!rows.length">
              <td colspan="9" class="empty-cell">Nu există achiziții.</td>
            </tr>
            <tr v-for="(row, i) in rows" :key="row.id" class="tr-data">
              <td>{{ i + 1 }}</td>
              <td>{{ row.acqNumber || '-' }}</td>
              <td>{{ formatDate(row.acquisitionDate) }}</td>
              <td>{{ row.institutionProvider?.name || '-' }}</td>
              <td class="num-cell">{{ formatPrice(row.totalValueWithoutTva) }}</td>
              <td class="num-cell">{{ formatPrice(row.tvaValue) }}</td>
              <td class="num-cell">{{ formatPrice(row.totalValueWithTva) }}</td>
              <td>
                <span :class="['status-badge', 'status-' + row.status]">
                  {{ statusLabels[row.status] || row.status }}
                </span>
              </td>
              <td class="actions-cell">
                <button v-if="row.status !== 'draft'" class="action-btn" title="PDF" @click="viewPdf(row)">
                  <i class="far fa-file-pdf" style="color:#e53935;font-size:1rem;"></i>
                </button>
                <button v-if="canEdit(row)" class="action-btn" title="Editează" @click="editRow(row)">
                  <i class="fas fa-pencil-alt" style="color:#F2994A;font-size:1rem;"></i>
                </button>
                <button v-if="row.status === 'generated' || row.status === 'rejected'" class="action-btn" title="Trimite spre semnare" @click="requestApprove(row)">
                  <i class="fas fa-paper-plane" style="color:#39f;font-size:1rem;"></i>
                </button>
                <button v-if="row.status === 'waiting_approve' && isSupervisor" class="action-btn" title="Verifică aprobare" @click="checkApproved(row)">
                  <i class="fas fa-sync" style="color:#F2994A;font-size:1rem;"></i>
                </button>
                <button v-if="row.status === 'approved'" class="action-btn" title="Documente" @click="addDocuments(row)">
                  <i class="fas fa-file-plus" style="color:#337ab7;font-size:1rem;"></i>
                </button>
                <button v-if="row.status === 'approved'" class="action-btn" title="Finalizează" @click="closeAcquisition(row)">
                  <i class="fas fa-badge-check" style="color:green;font-size:1rem;"></i>
                </button>
                <button v-if="canDelete(row)" class="action-btn" title="Șterge" @click="confirmDelete(row)">
                  <i class="fas fa-trash" style="color:#e53935;font-size:1rem;"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="deleteModal.open" class="modal-overlay" @click.self="deleteModal.open = false">
      <div class="modal-box">
        <h3 class="modal-title">Ștergere achiziție</h3>
        <p>Ești sigur că vrei să ștergi această achiziție?</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="deleteModal.open = false">Anulează</button>
          <button class="btn btn-danger" @click="doDelete" :disabled="saving">Șterge</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ACQUISITIONS_GET, ACQUISITIONS_DELETE, ACQUISITIONS_GET_PDF, ACQUISITIONS_REQUEST_APPROVE, ACQUISITIONS_CHECK_APPROVED, ACQUISITIONS_CLOSE } from '@/api.js'

export default {
  name: 'Acquisitions',
  data() {
    return {
      rows: [], loading: false, saving: false,
      deleteModal: { open: false, row: null },
      statusLabels: { draft: 'Draft', generated: 'Generat', waiting_approve: 'Așteptare aprobare', rejected: 'Respins', approved: 'Aprobat', closed: 'Finalizat' }
    }
  },
  computed: {
    procedureType() { return this.$route?.params?.procedureType || '' },
    centralizationId() { return this.$route?.params?.centralization || '' },
    role() { return window.$getRoleAll?.()?.role || '' },
    isSupervisor() { return this.role === 'supervizor_achizitii' }
  },
  methods: {
    goBack(to) {
      const base = `/atribuire/procedura/${this.procedureType}`
      if (to === 'procedura') this.$router.push(base)
      else this.$router.push(`${base}/${this.centralizationId}`)
    },
    async loadData() {
      this.loading = true
      try {
        const res = await ACQUISITIONS_GET(1, 500, `eq=paapCentralizationId,${this.centralizationId}`)
        const data = await res.json()
        this.rows = Array.isArray(data?.data?.result) ? data.data.result : []
      } catch(e) { console.error(e) }
      this.loading = false
    },
    canEdit(row) { return !['approved', 'waiting_approve', 'closed'].includes(row.status) },
    canDelete(row) { return !['approved', 'waiting_approve', 'closed'].includes(row.status) },
    editRow(row) { alert('Editare — în implementare.') },
    async viewPdf(row) {
      try { const res = await ACQUISITIONS_GET_PDF(row.id); const blob = await res.blob(); window.open(URL.createObjectURL(blob), '_blank') } catch(e) { alert('PDF eșuat.') }
    },
    async requestApprove(row) {
      try { const res = await ACQUISITIONS_REQUEST_APPROVE(row.id); const d = await res.json(); if (d?.data?.result?.url) window.open(d.data.result.url, '_blank'); await this.loadData() } catch(e) { console.error(e) }
    },
    async checkApproved(row) { try { await ACQUISITIONS_CHECK_APPROVED(row.id); await this.loadData() } catch(e) { console.error(e) } },
    addDocuments(row) { alert('Adăugare documente — în implementare.') },
    async closeAcquisition(row) { if (!confirm('Finalizezi achiziția?')) return; try { await ACQUISITIONS_CLOSE(row.id, {}); await this.loadData() } catch(e) { console.error(e) } },
    confirmDelete(row) { this.deleteModal = { open: true, row } },
    async doDelete() {
      this.saving = true
      try { await ACQUISITIONS_DELETE(this.deleteModal.row.id); this.deleteModal.open = false; await this.loadData() } catch(e) { console.error(e) }
      this.saving = false
    },
    formatPrice(val) { if (!val && val !== 0) return '—'; return Number(val).toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
    formatDate(d) { if (!d) return '—'; const dt = new Date(d); return `${String(dt.getDate()).padStart(2,'0')}.${String(dt.getMonth()+1).padStart(2,'0')}.${dt.getFullYear()}` },
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
.loading-state { display: flex; justify-content: center; padding: 4rem; }
.spinner-lg { width: 36px; height: 36px; border: 3px solid #e0e8f8; border-top-color: #1565C0; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; }
.table-container { flex: 1; padding: 1rem 1.5rem; }
.table-wrap { overflow-x: auto; background: white; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.data-table th { background: #1565C0; color: white; padding: 0.6rem 0.75rem; text-align: left; font-size: 0.78rem; font-weight: 600; white-space: nowrap; }
.data-table td { padding: 0.5rem 0.75rem; border-bottom: 1px solid #f0f0f0; vertical-align: middle; }
.data-table tr.tr-data:hover td { background: #f5f8ff; }
.num-cell { text-align: right; font-variant-numeric: tabular-nums; }
.empty-cell { text-align: center; color: #aaa; padding: 2rem; font-style: italic; }
.status-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 0.78rem; font-weight: 500; padding: 2px 8px; border-radius: 10px; background: #f5f5f5; }
.status-draft { background: #fff9c4; color: #f57f17; }
.status-generated { background: #e8f5e9; color: #2e7d32; }
.status-waiting_approve { background: #fff3e0; color: #e65100; }
.status-rejected { background: #ffebee; color: #c62828; }
.status-approved { background: #e8f5e9; color: #2e7d32; }
.status-closed { background: #e3f2fd; color: #1565C0; }
.actions-cell { display: flex; gap: 4px; align-items: center; justify-content: flex-end; }
.action-btn { background: none; border: none; cursor: pointer; padding: 4px 5px; border-radius: 4px; }
.action-btn:hover { background: #f0f4ff; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-box { background: white; border-radius: 10px; padding: 1.5rem; max-width: 480px; width: 90%; box-shadow: 0 8px 32px rgba(0,0,0,0.18); }
.modal-title { font-size: 1rem; font-weight: 700; color: #1a2f4e; margin-bottom: 0.75rem; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem; }
.btn { display: inline-flex; align-items: center; gap: 6px; padding: 0.45rem 1rem; border-radius: 6px; border: none; cursor: pointer; font-size: 0.875rem; font-weight: 500; font-family: inherit; }
.btn-secondary { background: #f5f5f5; color: #333; border: 1px solid #ddd; }
.btn-secondary:hover { background: #e8e8e8; }
.btn-danger { background: #e53935; color: white; }
.btn-danger:hover:not(:disabled) { background: #c62828; }
.btn-danger:disabled { opacity: 0.5; cursor: default; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
