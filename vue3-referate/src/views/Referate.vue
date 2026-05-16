<template>
  <div class="page-container">

    <!-- Banner breadcrumb -->
    <div class="page-banner">
      <div class="breadcrumb">
        <span class="breadcrumb-link" @click="$router.push('/')">Acasă</span>
        <span class="breadcrumb-sep">/</span>
        <span>Referate necesitate</span>
      </div>
    </div>

    <div class="page-content">
      <div class="content-header">
        <h1 class="page-title">Referate necesitate</h1>
      </div>

      <div class="table-wrapper" v-if="PERMISIONS.list">
        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr class="table-header-row">
                <th class="col-nr">NR.</th>
                <th class="col-name">DENUMIRE</th>
                <th class="col-year">ANUL DE ÎNCADRARE</th>
                <th v-if="showInstitutionCol" class="col-institution">INSTITUȚIE</th>
                <th>STRUCTURĂ ORGANIZATORICĂ</th>
                <th>INIȚIATOR (NUME)</th>
                <th>INIȚIATOR (ROL)</th>
                <th class="col-id">INIȚIATOR (ID)</th>
                <th>COD CPV (DOMINANT)</th>
                <th class="col-price">VALOAREA TOTALĂ ESTIMATĂ</th>
                <th class="col-icon" title="Status PAAP">PAAP</th>
                <th class="col-icon" title="Status referat">STATUS</th>
                <th class="col-actions"></th>
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
                  <div class="filter-input date-filter">
                    <input type="date" v-model="filters.dateFrom" class="filter-field" @input="onFilter" />
                    <input type="date" v-model="filters.dateTo" class="filter-field" @input="onFilter" />
                  </div>
                </th>
                <th v-if="showInstitutionCol">
                  <div class="filter-input">
                    <input v-model="filters.institution" class="filter-field" @input="onFilter" />
                    <span class="filter-icon">🔍</span>
                  </div>
                </th>
                <th>
                  <div class="filter-input">
                    <input v-model="filters.department" class="filter-field" @input="onFilter" />
                    <span class="filter-icon">🔍</span>
                  </div>
                </th>
                <th>
                  <div class="filter-input">
                    <input v-model="filters.initiatorName" class="filter-field" @input="onFilter" />
                    <span class="filter-icon">🔍</span>
                  </div>
                </th>
                <th>
                  <select v-model="filters.initiatorRole" class="filter-select" @change="onFilter">
                    <option value="">Toate</option>
                    <option value="admin_institutie">Admin instituție</option>
                    <option value="sef_institutie">Șef instituție</option>
                    <option value="supervisor">Supervizor</option>
                    <option value="angajat">Angajat</option>
                    <option value="responsabil_achizitii">Responsabil achiziții</option>
                    <option value="supervizor_achizitii">Supervizor achiziții</option>
                    <option value="responsabil_achizitii_extern">Responsabil achiziții externe</option>
                  </select>
                </th>
                <th>
                  <div class="filter-input">
                    <input v-model="filters.initiatorId" class="filter-field" type="number" @input="onFilter" />
                    <span class="filter-icon">🔍</span>
                  </div>
                </th>
                <th>
                  <div class="filter-input">
                    <input v-model="filters.cpv" class="filter-field" @input="onFilter" />
                    <span class="filter-icon">🔍</span>
                  </div>
                </th>
                <th></th>
                <!-- Filtre iconițe PAAP -->
                <th>
                  <div class="filter-icons-row">
                    <button
                      v-for="f in paapFilters"
                      :key="f.value"
                      :class="['filter-icon-btn', filters.paap === f.value ? 'filter-icon-btn--active' : '']"
                      :title="f.label"
                      @click="togglePaapFilter(f.value)"
                    >
                      <i :class="f.icon" :style="f.css"></i>
                    </button>
                  </div>
                </th>
                <!-- Filtre iconițe Status -->
                <th>
                  <div class="filter-icons-row">
                    <button
                      v-for="f in statusFilters"
                      :key="f.value"
                      :class="['filter-icon-btn', filters.status === f.value ? 'filter-icon-btn--active' : '']"
                      :title="f.tooltip"
                      @click="toggleStatusFilter(f.value)"
                    >
                      <i :class="f.icon" :style="f.css"></i>
                    </button>
                    <button class="filter-icon-btn filter-clear" @click="clearFilters" title="Șterge filtrele">✕</button>
                  </div>
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, index) in paginatedRows"
                :key="row.id"
                :class="['table-row', index % 2 === 0 ? 'row-even' : 'row-odd']"
              >
                <!-- NR — roșu dacă referatul trebuie completat de utilizatorul curent -->
                <td class="col-nr">
                  <span
                    v-if="showUrgentNr(row)"
                    class="nr-urgent"
                    :title="urgentNrTooltip(row)"
                  >{{ (currentPage-1)*pageSize + index + 1 }}</span>
                  <span v-else>{{ (currentPage-1)*pageSize + index + 1 }}</span>
                </td>
                <td class="col-name">{{ row.name || '-' }}</td>
                <td class="col-year">{{ row.nryear || '-' }}</td>
                <td v-if="showInstitutionCol">{{ row.institution?.name || '-' }}</td>
                <td>{{ row.department?.name || '-' }}</td>
                <td>{{ formatInitiatorName(row) }}</td>
                <td>{{ roleLabels[row.createdByUserRoleName] || row.createdByUserRoleName || '-' }}</td>
                <td class="col-id">{{ row.createdByUser?.id || '-' }}</td>
                <td>
                  <span class="cpv-code">{{ row.need?.product?.cpvCategory?.cpvCode || '-' }}</span>
                </td>
                <td class="col-price">{{ formatPrice(row.sumnr) }}</td>
                <!-- PAAP icon -->
                <td class="col-icon">
                  <i
                    :class="row.paap?.length ? 'fas fa-file' : 'far fa-file'"
                    :style="'color:#569a36; font-size:1.2rem;'"
                    :title="row.paap?.length ? 'Participă în PAAP' : 'Nu participă în PAAP'"
                  ></i>
                </td>
                <!-- Status icon -->
                <td class="col-icon">
                  <i
                    :class="statusIcon(row.needReferateStatus).icon"
                    :style="statusIcon(row.needReferateStatus).css"
                    :title="statusIcon(row.needReferateStatus).tooltip"
                  ></i>
                </td>
                <!-- Acțiuni -->
                <td class="col-actions">
                  <div class="actions-menu">
                    <!-- Butoane rapide vizibile direct -->
                    <template v-for="btn in quickButtons(row)" :key="btn.id">
                      <button
                        class="btn-quick"
                        :title="btn.label"
                        @click.stop="handleAction(btn.action, row)"
                      >
                        <i :class="btn.icon" :style="btn.css"></i>
                      </button>
                    </template>
                    <!-- Meniu ⋮ -->
                    <button class="btn-action-trigger" @click.stop="toggleMenu(row.id)">⋮</button>
                    <div v-if="activeMenu === row.id" class="actions-dropdown">
                      <button
                        v-for="btn in menuButtons(row)"
                        :key="btn.id"
                        :class="['action-item', btn.danger ? 'action-danger' : '']"
                        @click="handleAction(btn.action, row)"
                      >
                        <i :class="btn.icon" class="action-icon"></i>
                        {{ btn.label }}
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredRows.length === 0">
                <td :colspan="colCount" class="empty-row">
                  <span v-if="loading">Se încarcă...</span>
                  <span v-else>Nu există înregistrări</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer -->
        <div class="table-footer">
          <span class="total-records">
            TOTAL AFIȘAT: {{ Math.min(currentPage*pageSize, filteredRows.length) }}/{{ filteredRows.length }}
          </span>
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

    <!-- Modal Redenumește -->
    <div v-if="renameModal" class="modal-overlay" @click.self="renameModal = null">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">Redenumește Referat Necesitate</h2>
          <button class="btn-close" @click="renameModal = null">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Denumire referat <span class="required">*</span></label>
            <input
              v-model="renameModal.name"
              class="form-input"
              :class="{ 'form-input--error': renameModal.error }"
              @input="renameModal.name = renameModal.name.replace(/[^\p{L}0-9 _]/gu, '')"
            />
            <span v-if="renameModal.error" class="field-error">Introduceți o nouă denumire</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="renameModal = null">Anulează</button>
          <button class="btn btn-primary" @click="executeRename" :disabled="saving">
            <span v-if="saving" class="spinner spinner-white"></span>
            Redenumește
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Șterge -->
    <div v-if="deleteModal" class="modal-overlay" @click.self="deleteModal = null">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">Șterge Referat Necesitate</h2>
          <button class="btn-close" @click="deleteModal = null">✕</button>
        </div>
        <div class="modal-body">
          <div class="delete-info-box">
            <div class="delete-info-row">
              <span class="delete-info-label">Denumire:</span>
              <span>{{ deleteModal.name }}</span>
            </div>
            <div class="delete-info-row">
              <span class="delete-info-label">Status:</span>
              <span>{{ statusLabels[deleteModal.needReferateStatus] || deleteModal.needReferateStatus }}</span>
            </div>
            <div class="delete-info-row">
              <span class="delete-info-label">An:</span>
              <span>{{ deleteModal.nryear }}</span>
            </div>
          </div>
          <p class="delete-warning">Această acțiune nu poate fi anulată.</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="deleteModal = null">Anulează</button>
          <button class="btn btn-danger" @click="executeDelete" :disabled="saving">
            <span v-if="saving" class="spinner spinner-white"></span>
            Șterge
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Istoric versiuni -->
    <div v-if="historyModal" class="modal-overlay" @click.self="historyModal = null">
      <div class="modal modal-lg">
        <div class="modal-header">
          <h2 class="modal-title">Versiuni referat</h2>
          <button class="btn-close" @click="historyModal = null">✕</button>
        </div>
        <div class="modal-body">
          <table class="history-table">
            <thead>
              <tr>
                <th>NR.</th>
                <th>NUME PRENUME / ID</th>
                <th>DATA CREĂRII/MODIFICĂRII</th>
                <th>STATUS REFERAT</th>
                <th>ACȚIUNI</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="historyLoading">
                <td colspan="5" class="empty-row">Se încarcă...</td>
              </tr>
              <tr v-for="(v, i) in historyVersions" :key="v.id" class="history-row">
                <td>{{ historyVersions.length - i }}.</td>
                <td>{{ v.createdByUser?.last_name }} {{ v.createdByUser?.first_name }} / {{ v.createdByUser?.id }}</td>
                <td>{{ formatDateTime(v.createdAt) }}</td>
                <td>
                  <span :class="['status-badge-history', `status-history-${v.needReferateStatus}`]">
                    {{ statusLabels[v.needReferateStatus] || v.needReferateStatus }}
                  </span>
                </td>
                <td>
                  <button class="btn-open-version" @click="openVersion(v)">
                    Deschide <i class="fas fa-external-link-alt" style="font-size:0.75rem;"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="historyModal = null">Înapoi</button>
        </div>
      </div>
    </div>

    <div v-if="activeMenu" class="overlay-transparent" @click="activeMenu = null"></div>
  </div>
</template>

<script>
import {
  REFERENCE_PAGINATED,
  REFERENCE_MODIFY,
  REFERENCE_DELETE_PENDING,
  REFERENCE_CHECK_APPROVE,
  REFERENCE_CENTRALIZATION,
  REFERENCE_EXTERNAL_SIGNATURE,
  REFERENCE_VERSIONS,
} from '@/api.js'
import PermisionsMixin from '@/mixins/referencesPermMixin.js'

const ROLE_LABELS = {
  superadmin: 'Superadmin',
  admin_institutie: 'Admin instituție',
  responsabil_achizitii: 'Responsabil achiziții',
  supervizor_achizitii: 'Supervizor achiziții',
  responsabil_achizitii_extern: 'Responsabil achiziții extern',
  responsabil_buget: 'Responsabil buget',
  sef_institutie: 'Șef instituție',
  supervisor: 'Supervizor',
  angajat: 'Angajat'
}

const STATUS_LABELS = {
  draft: 'Draft',
  signature_waiting: 'Așteptare semnare',
  in_progress_signature: 'În curs de aprobare',
  rejected: 'Respins',
  approved: 'Aprobat',
  completion: 'Trimis spre completare',
  completed: 'Completat',
  cancelled: 'Anulat'
}

const STATUS_ICONS = {
  draft:                { icon: 'far fa-clock',         css: 'color:#f2da07;font-size:1.3rem;', tooltip: 'Draft' },
  signature_waiting:    { icon: 'fas fa-clock',         css: 'color:#f2da07;font-size:1.3rem;', tooltip: 'Așteptare semnare' },
  in_progress_signature:{ icon: 'fas fa-pen-nib',       css: 'color:#F2994A;font-size:1.3rem;', tooltip: 'În curs de aprobare' },
  rejected:             { icon: 'fas fa-times-circle',  css: 'color:#ec4a4a;font-size:1.3rem;', tooltip: 'Respins' },
  approved:             { icon: 'fas fa-clipboard-check',css: 'color:#569a36;font-size:1.3rem;', tooltip: 'Aprobat' },
  completion:           { icon: 'fas fa-pencil',        css: 'color:#F2994A;font-size:1.3rem;', tooltip: 'Trimis spre completare' },
  completed:            { icon: 'fas fa-pencil',        css: 'color:#569a36;font-size:1.3rem;', tooltip: 'Completat' },
  cancelled:            { icon: 'fas fa-ban',           css: 'color:#aaa;font-size:1.3rem;',    tooltip: 'Anulat' }
}

export default {
  name: 'Referate',
  mixins: [PermisionsMixin],

  data() {
    return {
      rows: [],
      loading: false,
      saving: false,
      currentPage: 1,
      pageSize: 15,
      activeMenu: null,
      renameModal: null,
      deleteModal: null,
      historyModal: false,
      historyReferenceId: null,
      historyVersions: [],
      historyLoading: false,
      signingInProgress: false,
      roleLabels: ROLE_LABELS,
      statusLabels: STATUS_LABELS,
      filters: {
        name: '', dateFrom: '', dateTo: '',
        institution: '', department: '',
        initiatorName: '', initiatorRole: '', initiatorId: '',
        cpv: '', paap: '', status: ''
      },
      paapFilters: [
        { value: 'yes', label: 'Participă în PAAP', icon: 'fas fa-file', css: 'color:#569a36' },
        { value: 'no',  label: 'Nu participă în PAAP', icon: 'far fa-file', css: 'color:#569a36' }
      ],
      statusFilters: Object.entries(STATUS_ICONS).map(([value, s]) => ({ value, ...s }))
    }
  },

  computed: {
    userRole() {
      return this.$store?.getters?.userRole?.role || ''
    },
    userRoleId() {
      return this.$store?.getters?.userRole?.id || null
    },
    isSuperadmin() { return this.userRole === 'superadmin' },
    isAdmin()      { return ['superadmin','admin_institutie','sef_institutie'].includes(this.userRole) },

    // Coloana Instituție — doar pentru Superadmin (currentRoleStatus === 1)
    showInstitutionCol() { return this.isSuperadmin },

    colCount() {
      return this.showInstitutionCol ? 13 : 12
    },

    filteredRows() {
      return this.rows.filter(r => {
        if (this.filters.name && !(r.name||'').toLowerCase().includes(this.filters.name.toLowerCase())) return false
        if (this.filters.institution && !(r.institution?.name||'').toLowerCase().includes(this.filters.institution.toLowerCase())) return false
        if (this.filters.department && !(r.department?.name||'').toLowerCase().includes(this.filters.department.toLowerCase())) return false
        const initiatorName = this.formatInitiatorName(r).toLowerCase()
        if (this.filters.initiatorName && !initiatorName.includes(this.filters.initiatorName.toLowerCase())) return false
        if (this.filters.initiatorRole && r.createdByUserRoleName !== this.filters.initiatorRole) return false
        if (this.filters.initiatorId && String(r.createdByUser?.id) !== String(this.filters.initiatorId)) return false
        if (this.filters.cpv && !(r.need?.product?.cpvCategory?.cpvCode||'').includes(this.filters.cpv)) return false
        if (this.filters.paap === 'yes' && !r.paap?.length) return false
        if (this.filters.paap === 'no' && r.paap?.length) return false
        if (this.filters.status && r.needReferateStatus !== this.filters.status) return false
        return true
      })
    },

    paginatedRows() {
      const s = (this.currentPage-1)*this.pageSize
      return this.filteredRows.slice(s, s+this.pageSize)
    },

    totalPages() {
      return Math.max(1, Math.ceil(this.filteredRows.length/this.pageSize))
    }
  },

  watch: {
    filteredRows() { this.currentPage = 1 }
  },

  methods: {
    // ── Data ──────────────────────────────────────────────────────
    async loadData() {
      this.loading = true
      try {
        const res = await REFERENCE_PAGINATED(1, 1000, '')
        const data = await res.json()
        if (Array.isArray(data?.data?.result)) this.rows = data.data.result
      } catch(e) { console.error(e) }
      this.loading = false
    },

    // ── Helpers ───────────────────────────────────────────────────
    formatInitiatorName(row) {
      if (!row.createdByUser) return '-'
      return `${row.createdByUser.last_name || ''} ${row.createdByUser.first_name || ''}`.trim() || '-'
    },

    formatPrice(val) {
      if (val === undefined || val === null || val === '') return '-'
      return Number(val).toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },

    formatDateTime(d) {
      if (!d) return '-'
      const dt = new Date(d)
      return `${String(dt.getDate()).padStart(2,'0')}.${String(dt.getMonth()+1).padStart(2,'0')}.${dt.getFullYear()} ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`
    },

    statusIcon(status) {
      return STATUS_ICONS[status] || { icon: 'fas fa-question-circle', css: 'color:#aaa', tooltip: status }
    },

    // NR roșu — Supervizor achiziții: completion fără modalitateDeCentralizare
    //          — Responsabil buget: completion fără budgetClassification completă
    showUrgentNr(row) {
      if (row.needReferateStatus !== 'completion') return false
      if (this.userRole === 'supervizor_achizitii' && !row.modalitateDeCentralizare) return true
      if (this.userRole === 'responsabil_buget' && (!row.budgetClassification || row.budgetClassification.length !== 2)) return true
      return false
    },

    urgentNrTooltip(row) {
      return 'Referatul trebuie completat'
    },

    // Verifică dacă utilizatorul curent este creatorul referatului
    isCreator(row) {
      return Number.isInteger(row.createdByUserRole) &&
        row.createdByUserRole === this.userRoleId
    },

    // Verifică dacă referatul poate fi editat (nryear >= currentYear)
    canEditYear(row) {
      return (row.nryear || 0) >= new Date().getFullYear()
    },

    // ── Logica butoanelor ─────────────────────────────────────────
    // Returnează butoanele vizibile pentru un rând
    // Structura: { id, label, icon, css, action, quick, danger }
    allButtons(row) {
      const s = row.needReferateStatus
      const isCreator = this.isCreator(row)
      const role = this.userRole
      const buttons = []

      // ── Set de bază per status ──
      const base = {
        draft:                ['rename', 'edit', 'history'],
        signature_waiting:    ['sign', 'previewPdf', 'history'],
        completion:           ['rename', 'edit', 'history'],
        completed:            ['rename', 'edit', 'history'],
        in_progress_signature:['previewPdf', 'history'],
        rejected:             ['edit', 'previewPdf', 'history'],
        approved:             ['edit', 'previewPdf', 'history'],
        cancelled:            ['previewPdf', 'history'],
      }[s] || ['history']

      let ids = [...base]

      // ── Modificare 1: dacă ești creatorul ──
      if (isCreator) {
        // Adaugă Șterge la început pentru aceste statusuri
        if (['draft','signature_waiting','completion','completed'].includes(s)) {
          ids.unshift('delete')
        }
        // Adaugă Editează pentru cancelled
        if (s === 'cancelled' && !ids.includes('edit')) {
          ids.unshift('edit')
        }
      }

      // ── Modificare 2: Trimite spre semnare (42) — doar pentru supervizor_achizitii, angajat, supervisor ──
      if (!['supervizor_achizitii','angajat','supervisor'].includes(role)) {
        ids = ids.filter(id => id !== 'sign')
      }

      // ── Modificare 3: Editează dispare când ──
      // Ești angajat și nu ești creatorul SAU status == approved
      if ((role === 'angajat' && !isCreator) || s === 'approved') {
        ids = ids.filter(id => id !== 'edit')
      }

      // ── Modificare 4: Redenumește și Trimite spre semnare dispar când ──
      // Nu ești creatorul SAU status == approved
      if (!isCreator || s === 'approved') {
        ids = ids.filter(id => id !== 'rename' && id !== 'sign')
      }

      // ── Modificare 5: Butoane contextuale adăugate ──
      if (s === 'in_progress_signature') {
        // Deschide lucrarea — pentru toți
        ids.splice(ids.indexOf('previewPdf'), 0, 'openAddress')
        // Verifică aprobare — pentru creator, responsabil_achizitii, supervizor_achizitii
        if (isCreator || role === 'responsabil_achizitii' || role === 'supervizor_achizitii') {
          ids.splice(ids.indexOf('previewPdf'), 0, 'checkApprove')
        }
      }

      // Deschide atribuire — approved + responsabil/supervizor achizitii
      if (s === 'approved' && (role === 'responsabil_achizitii' || role === 'supervizor_achizitii')) {
        ids.splice(ids.indexOf('previewPdf'), 0, 'openAssignment')
      }

      // ── Construiește obiectele butoane ──
      const btnMap = {
        delete:       { id:'delete',       label:'Șterge',                icon:'fas fa-trash',          css:'color:#e53935', action:'delete',       quick:false, danger:true },
        rename:       { id:'rename',       label:'Redenumește',           icon:'fas fa-file-signature', css:'color:#39f',    action:'rename',       quick:false },
        edit:         { id:'edit',         label:'Editează',              icon:'fas fa-pencil',         css:'color:#F2994A', action:'edit',         quick:false },
        sign:         { id:'sign',         label:'Trimite spre semnare',  icon:'fas fa-signal-stream',  css:'color:#39f',    action:'sign',         quick:true  },
        previewPdf:   { id:'previewPdf',   label:'Preview PDF',           icon:'fas fa-file-pdf',       css:'color:#e53935', action:'previewPdf',   quick:true  },
        history:      { id:'history',      label:'Istoric',               icon:'fas fa-history',        css:'color:#555',    action:'history',      quick:false },
        openAddress:  { id:'openAddress',  label:'Deschide lucrarea',     icon:'fas fa-book',           css:'color:#39f',    action:'openAddress',  quick:true  },
        checkApprove: { id:'checkApprove', label:'Verifică aprobare',     icon:'fas fa-sync',           css:'color:#F2994A', action:'checkApprove', quick:true  },
        openAssignment:{ id:'openAssignment',label:'Deschide atribuire',  icon:'fas fa-list',           css:'color:#39f',    action:'openAssignment',quick:true },
      }

      return ids.map(id => btnMap[id]).filter(Boolean)
    },

    // Butoane rapide (afișate direct în rând)
    quickButtons(row) {
      return this.allButtons(row).filter(b => b.quick)
    },

    // Butoane în meniu ⋮
    menuButtons(row) {
      return this.allButtons(row).filter(b => !b.quick)
    },

    // ── Handler acțiuni ───────────────────────────────────────────
    handleAction(action, row) {
      this.activeMenu = null
      const handlers = {
        edit:          () => this.editReference(row),
        delete:        () => this.openDeleteModal(row),
        rename:        () => this.openRenameModal(row),
        previewPdf:    () => this.previewPdf(row),
        history:       () => this.openHistory(row),
        sign:          () => this.signReference(row),
        openAddress:   () => this.openAddress(row),
        checkApprove:  () => this.checkApprove(row),
        openAssignment:() => this.openAssignment(row),
      }
      handlers[action]?.()
    },

    // ── Acțiuni individuale ───────────────────────────────────────

    // Btn 2 — Editează: navighează la pagina de detaliu
    editReference(row) {
      if (!row.id) return
      if (!this.canEditYear(row)) {
        this.$toastr?.w('Referatul nu mai poate fi modificat, nu se încadrează în anul curent.')
        return
      }
      this.$router.push(`${this.$route.path}/${row.id}`)
    },

    // Btn 3 — Șterge
    openDeleteModal(row) {
      this.deleteModal = { ...row }
    },

    async executeDelete() {
      if (!this.deleteModal) return
      this.saving = true
      try {
        const res = await REFERENCE_DELETE_PENDING(this.deleteModal.id)
        const data = await res.json()
        if (data?.meta?.HttpStatusCode && String(data.meta.HttpStatusCode)[0] === '2') {
          this.deleteModal = null
          await this.loadData()
        } else {
          console.error(data?.response || 'Ștergerea a eșuat')
        }
      } catch(e) { console.error(e) }
      this.saving = false
    },

    // Btn 5 — Deschide lucrarea (ConectX)
    openAddress(row) {
      if (row.conectxAddressUrl) window.open(row.conectxAddressUrl, '_blank')
    },

    // Btn 6 — Verifică aprobare (polling ConectX)
    async checkApprove(row) {
      try {
        const res = await REFERENCE_CHECK_APPROVE(row.id)
        const data = await res.json()
        if (data?.meta?.HttpStatusCode && String(data.meta.HttpStatusCode)[0] === '2') {
          this.$toastr?.s('Starea referatului a fost modificată')
          await this.loadData()
        } else {
          this.$toastr?.w(data?.response || data?.message || 'A apărut o eroare.')
          await this.loadData()
        }
      } catch(e) { console.error(e) }
    },

    // Btn 7 — Deschide atribuire (PAAP)
    async openAssignment(row) {
      try {
        const res = await REFERENCE_CENTRALIZATION(row.id)
        const data = await res.json()
        if (data?.meta?.HttpStatusCode && String(data.meta.HttpStatusCode)[0] === '2') {
          const d = data.data
          if (!d.procedureType) {
            this.$toastr?.w(`Tipul procedurii nu este stabilit pentru poziția "${d.cpvCode} - ${d.cpvCodeName}" din PAAP.`)
            return
          }
          const procedure = d.procedureType.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '-')
          this.$router.push(`/atribuire/procedura/${procedure}/${d.id}`)
        } else {
          this.$toastr?.e(data?.response || data?.message || 'A apărut o eroare.')
        }
      } catch(e) { console.error(e) }
    },

    // Btn 13 — Istoric versiuni
    async openHistory(row) {
      this.historyModal = true
      this.historyReferenceId = row.id
      this.historyVersions = []
      this.historyLoading = true
      try {
        const res = await REFERENCE_VERSIONS(row.id)
        const data = await res.json()
        if (Array.isArray(data?.data?.result)) {
          this.historyVersions = [...data.data.result].reverse()
        }
      } catch(e) { console.error(e) }
      this.historyLoading = false
    },

    openVersion(version) {
      this.$router.push(`${this.$route.path}/${this.historyReferenceId}?version=${version.id}`)
    },

    // Btn 14 — Preview PDF
    previewPdf(row) {
      // Setăm ID-ul în store pentru viewer PDF global
      if (this.$store) {
        this.$store.commit('setReferenceIdForPreview', { data: { id: row.id } })
      }
    },

    // Btn 40 — Redenumește
    openRenameModal(row) {
      this.renameModal = { id: row.id, name: row.name || '', error: false }
    },

    async executeRename() {
      if (!this.renameModal?.name?.trim()) {
        this.renameModal.error = true
        return
      }
      this.saving = true
      try {
        const res = await REFERENCE_MODIFY(this.renameModal.id, { name: this.renameModal.name.trim() })
        const data = await res.json()
        if (data?.meta?.HttpStatusCode && String(data.meta.HttpStatusCode)[0] === '2') {
          this.renameModal = null
          await this.loadData()
        }
      } catch(e) { console.error(e) }
      this.saving = false
    },

    // Btn 42 — Trimite spre semnare externă ConectX
    async signReference(row) {
      if (this.signingInProgress) return
      if (!this.canEditYear(row)) {
        this.$toastr?.w('Referatul nu mai poate fi modificat, nu se încadrează în anul curent.')
        return
      }
      this.signingInProgress = true
      try {
        const res = await REFERENCE_EXTERNAL_SIGNATURE(row.id)
        const data = await res.json()
        if (data?.meta?.HttpStatusCode && String(data.meta.HttpStatusCode)[0] === '2') {
          await this.loadData()
          window.open(data.data.result.url, '_blank')
        } else {
          this.$toastr?.e(data?.response || 'A apărut o eroare.')
        }
      } catch(e) { console.error(e) }
      this.signingInProgress = false
    },

    // ── Filtre ────────────────────────────────────────────────────
    onFilter() { this.currentPage = 1 },

    togglePaapFilter(value) {
      this.filters.paap = this.filters.paap === value ? '' : value
      this.currentPage = 1
    },

    toggleStatusFilter(value) {
      this.filters.status = this.filters.status === value ? '' : value
      this.currentPage = 1
    },

    clearFilters() {
      this.filters = {
        name:'', dateFrom:'', dateTo:'',
        institution:'', department:'',
        initiatorName:'', initiatorRole:'', initiatorId:'',
        cpv:'', paap:'', status:''
      }
    },

    toggleMenu(id) {
      this.activeMenu = this.activeMenu === id ? null : id
    }
  },

  created() {
    this.loadData()
  }
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
.content-header { margin-bottom: 1rem; }
.page-title { font-size: 1.4rem; font-weight: 600; color: #1a2f4e; margin: 0; }

.table-wrapper { background: white; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.table-scroll { overflow-x: auto; flex: 1; }
.data-table { width: 100%; border-collapse: collapse; min-width: 1100px; }

.table-header-row th { background: #1565C0; color: white; padding: 0.65rem 0.75rem; font-size: 0.72rem; font-weight: 600; letter-spacing: 0.03em; white-space: nowrap; text-align: left; }
.table-filter-row th { background: #f8f9fc; padding: 0.35rem 0.4rem; border-bottom: 2px solid #e0e0e0; }

.filter-input { display: flex; align-items: center; gap: 4px; background: white; border: 1px solid #ddd; border-radius: 4px; padding: 0 5px; }
.filter-field { border: none; outline: none; padding: 3px 2px; font-size: 0.78rem; width: 100%; min-width: 60px; background: transparent; font-family: 'Roboto', sans-serif; }
.date-filter { flex-direction: column; padding: 3px; gap: 2px; }
.date-filter .filter-field { width: 100%; }
.filter-icon { color: #999; font-size: 0.72rem; }
.filter-select { border: 1px solid #ddd; border-radius: 4px; padding: 3px 4px; font-size: 0.78rem; width: 100%; background: white; font-family: 'Roboto', sans-serif; }

/* Filtre iconițe status/paap */
.filter-icons-row { display: flex; align-items: center; gap: 2px; flex-wrap: wrap; }
.filter-icon-btn { background: none; border: 1px solid transparent; border-radius: 4px; padding: 2px 4px; cursor: pointer; font-size: 0.8rem; transition: all 0.15s; }
.filter-icon-btn:hover { background: #f0f4ff; }
.filter-icon-btn--active { background: #e3f2fd; border-color: #90caf9; }
.filter-clear { color: #999; font-size: 0.8rem; }
.filter-clear:hover { color: #e53935; }

.table-row td { padding: 0.55rem 0.65rem; font-size: 0.82rem; border-bottom: 1px solid #f0f0f0; color: #333; vertical-align: middle; }
.row-even { background: white; }
.row-odd { background: #fafbfd; }
.table-row:hover td { background: #EEF5FF !important; }

.col-nr { width: 40px; text-align: center; }
.col-name { max-width: 180px; white-space: normal; word-break: break-word; }
.col-year { width: 100px; text-align: center; }
.col-institution { max-width: 150px; white-space: normal; }
.col-id { width: 70px; text-align: center; }
.col-price { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
.col-icon { width: 40px; text-align: center; }
.col-actions { width: 100px; text-align: right; white-space: nowrap; }

.nr-urgent { color: #e53935; font-weight: 700; font-size: 0.82rem; }
.cpv-code { font-family: monospace; background: #f0f4ff; padding: 1px 5px; border-radius: 3px; font-size: 0.78rem; color: #1565C0; }

/* Acțiuni */
.actions-menu { display: flex; align-items: center; justify-content: flex-end; gap: 2px; position: relative; }
.btn-quick { background: none; border: none; cursor: pointer; padding: 2px 4px; border-radius: 4px; font-size: 1rem; }
.btn-quick:hover { background: #f0f0f0; }
.btn-action-trigger { background: none; border: none; cursor: pointer; font-size: 1.2rem; color: #666; padding: 2px 6px; border-radius: 4px; }
.btn-action-trigger:hover { background: #f0f0f0; }
.actions-dropdown { position: absolute; right: 0; top: 100%; z-index: 100; background: white; border-radius: 6px; min-width: 180px; box-shadow: 0 4px 16px rgba(0,0,0,0.12); border: 1px solid #e8e8e8; overflow: hidden; }
.action-item { display: flex; align-items: center; gap: 8px; width: 100%; text-align: left; padding: 0.5rem 0.85rem; background: none; border: none; cursor: pointer; font-size: 0.85rem; color: #333; font-family: 'Roboto', sans-serif; }
.action-item:hover { background: #f5f7ff; }
.action-item.action-danger { color: #e53935; }
.action-icon { width: 16px; text-align: center; font-size: 0.85rem; }

.empty-row { text-align: center; padding: 3rem; color: #aaa; font-style: italic; }

.table-footer { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; border-top: 1px solid #e8e8e8; background: white; font-size: 0.82rem; color: #555; }
.pagination { display: flex; align-items: center; gap: 0.75rem; }
.page-size-select { border: 1px solid #ddd; border-radius: 4px; padding: 2px 4px; font-size: 0.82rem; margin-left: 4px; }
.page-btn { background: none; border: 1px solid #ddd; border-radius: 4px; padding: 2px 10px; cursor: pointer; font-size: 1rem; color: #555; }
.page-btn:hover:not(:disabled) { background: #1565C0; color: white; border-color: #1565C0; }
.page-btn:disabled { opacity: 0.4; cursor: default; }

.access-denied { display: flex; flex-direction: column; align-items: center; padding: 4rem; color: #aaa; }
.access-icon { font-size: 4rem; margin-bottom: 1rem; }

/* Modals */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 300; }
.modal { background: white; border-radius: 10px; width: 480px; max-width: 96vw; box-shadow: 0 8px 40px rgba(0,0,0,0.18); animation: fadeIn 0.18s ease; }
.modal-lg { width: 720px; max-height: 85vh; display: flex; flex-direction: column; }
.modal-lg .modal-body { overflow-y: auto; flex: 1; }
@keyframes fadeIn { from { opacity:0; transform:scale(0.97); } to { opacity:1; transform:scale(1); } }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.1rem 1.5rem; border-bottom: 1px solid #e8e8e8; }
.modal-title { margin: 0; font-size: 1rem; font-weight: 600; color: #1a2f4e; }
.btn-close { background: #f5f5f5; border: none; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; color: #555; }
.btn-close:hover { background: #fee; color: #e53935; }
.modal-body { padding: 1.25rem 1.5rem; }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-label { font-size: 0.82rem; font-weight: 500; color: #444; }
.required { color: #e53935; margin-left: 2px; }
.form-input { border: 1.5px solid #ddd; border-radius: 6px; padding: 0.5rem 0.75rem; font-size: 0.875rem; font-family: 'Roboto', sans-serif; color: #333; }
.form-input:focus { outline: none; border-color: #1565C0; }
.form-input--error { border-color: #e53935 !important; }
.field-error { font-size: 0.75rem; color: #e53935; }

.delete-info-box { background: #fff8e1; border: 1px solid #ffe082; border-radius: 8px; padding: 1rem; margin-bottom: 0.75rem; }
.delete-info-row { display: flex; gap: 0.5rem; font-size: 0.875rem; margin-bottom: 4px; }
.delete-info-label { font-weight: 500; color: #555; min-width: 80px; }
.delete-warning { font-size: 0.82rem; color: #e53935; margin: 0; }

/* History table */
.history-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.history-table thead th { background: #1565C0; color: white; padding: 0.55rem 0.75rem; font-size: 0.75rem; font-weight: 600; text-align: left; }
.history-row td { padding: 0.55rem 0.75rem; border-bottom: 1px solid #f0f0f0; vertical-align: middle; }
.history-row:nth-child(even) { background: #fafbfd; }

.status-badge-history { display: inline-block; padding: 3px 10px; border-radius: 4px; font-size: 0.78rem; font-weight: 600; }
.status-history-draft { background: #fff9c4; color: #f57f17; }
.status-history-signature_waiting { background: #fff9c4; color: #f57f17; }
.status-history-in_progress_signature { background: #fff3e0; color: #e65100; }
.status-history-rejected { background: #ffebee; color: #c62828; }
.status-history-approved { background: #e8f5e9; color: #2e7d32; }
.status-history-completion { background: #fff3e0; color: #e65100; }
.status-history-completed { background: #e8f5e9; color: #2e7d32; }
.status-history-cancelled { background: #f5f5f5; color: #888; }

.btn-open-version { background: none; border: 1px solid #1565C0; color: #1565C0; border-radius: 4px; padding: 3px 10px; cursor: pointer; font-size: 0.8rem; font-family: 'Roboto', sans-serif; display: inline-flex; align-items: center; gap: 4px; }
.btn-open-version:hover { background: #e3f2fd; }

.modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1rem 1.5rem; border-top: 1px solid #e8e8e8; }
.btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; border-radius: 6px; border: none; cursor: pointer; font-size: 0.875rem; font-weight: 500; font-family: 'Roboto', sans-serif; }
.btn-primary { background: #1565C0; color: white; }
.btn-primary:hover:not(:disabled) { background: #1251a3; }
.btn-primary:disabled { opacity: 0.5; cursor: default; }
.btn-secondary { background: #f5f5f5; color: #333; border: 1px solid #ddd; }
.btn-danger { background: #e53935; color: white; }
.btn-danger:hover:not(:disabled) { background: #c62828; }
.btn-danger:disabled { opacity: 0.5; cursor: default; }

.spinner { width: 14px; height: 14px; border: 2px solid rgba(0,0,0,0.15); border-top-color: #333; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; }
.spinner-white { border-color: rgba(255,255,255,0.3); border-top-color: white; }
@keyframes spin { to { transform: rotate(360deg); } }

.overlay-transparent { position: fixed; inset: 0; z-index: 99; }
</style>
