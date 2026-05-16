<template>
  <div class="page-container">

    <!-- Banner breadcrumb -->
    <div class="page-banner">
      <div class="breadcrumb">
        <span class="breadcrumb-link" @click="$router.push('/')">Acasă</span>
        <span class="breadcrumb-sep">/</span>
        <span>Roluri utilizatori</span>
      </div>
    </div>

    <div class="page-content">
      <div class="content-header">
        <h1 class="page-title">Roluri utilizatori</h1>
      </div>

      <!-- Tabel -->
      <div class="table-wrapper" v-if="PERMISIONS.list">
        <div class="data-table-scroll">
        <table class="data-table">
          <thead>
            <tr class="table-header-row">
              <th class="col-nr">NR.</th>
              <th>ROL UTILIZATOR</th>
              <th>DATA CREĂRII</th>
              <th v-if="isSuperadmin">INSTITUȚIE</th>
              <th>PRENUME</th>
              <th>NUME</th>
              <th>USERNAME</th>
              <th>DEPARTAMENT</th>
              <th class="col-status">STATUS</th>
            </tr>
            <tr class="table-filter-row">
              <th></th>
              <th>
                <div class="f-input">
                  <svg class="f-ico" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input v-model="filters.role" class="f-field" placeholder="Caută..." @input="onFilter" />
                </div>
              </th>
              <th>
                <div class="f-input f-input--date">
                  <DatePickerRo v-model="filters.dateFrom" placeholder="De la" @change="onFilter" />
                  <span>—</span>
                  <DatePickerRo v-model="filters.dateTo" placeholder="Până la" @change="onFilter" />
                </div>
              </th>
              <th v-if="isSuperadmin">
                <div class="f-input">
                  <svg class="f-ico" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input v-model="filters.institution" class="f-field" placeholder="Caută..." @input="onFilter" />
                </div>
              </th>
              <th>
                <div class="f-input">
                  <svg class="f-ico" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input v-model="filters.firstName" class="f-field" placeholder="Caută..." @input="onFilter" />
                </div>
              </th>
              <th>
                <div class="f-input">
                  <svg class="f-ico" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input v-model="filters.lastName" class="f-field" placeholder="Caută..." @input="onFilter" />
                </div>
              </th>
              <th>
                <div class="f-input">
                  <svg class="f-ico" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input v-model="filters.username" class="f-field" placeholder="Caută..." @input="onFilter" />
                </div>
              </th>
              <th>
                <div class="f-input">
                  <svg class="f-ico" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input v-model="filters.department" class="f-field" placeholder="Caută..." @input="onFilter" />
                </div>
              </th>
              <th>
                <div style="display:flex; gap:4px; align-items:center;">
                  <select v-model="filters.status" class="f-select" @change="onFilter">
                    <option value="">Toate</option>
                    <option value="active">Activ</option>
                    <option value="disabled">Dezactivat</option>
                    <option value="unconfirmed">Neconfirmat</option>
                  </select>
                  <button class="btn-clear-filters" @click="clearFilters" title="Șterge filtrele">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
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
              <td>
                <span class="role-chip">{{ roleLabels[row.role] || row.role || '-' }}</span>
              </td>
              <td class="col-date">{{ formatDate(row.createdAt) }}</td>
              <td v-if="isSuperadmin" class="col-wrap">{{ row.institution?.name || '-' }}</td>
              <td>{{ row.user?.first_name || '-' }}</td>
              <td>{{ row.user?.last_name || '-' }}</td>
              <td class="col-username">
                <span class="text-truncate">{{ row.user?.email || '-' }}</span>
              </td>
              <td class="col-wrap">{{ row.department?.name || '-' }}</td>
              <td class="col-status">
                <span :class="['status-badge', `status-${row.userRoleStatus}`]">
                  <span class="status-dot"></span>
                  {{ statusLabels[row.userRoleStatus] || '-' }}
                </span>
              </td>
            </tr>
            <tr v-if="filteredRows.length === 0" class="empty-tr">
              <td colspan="100" class="empty-row"></td>
            </tr>
          </tbody>
        </table>
        </div><!-- /data-table-scroll -->

        <div v-if="filteredRows.length === 0" class="empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#E0E0E0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <span>Nu există înregistrări</span>
        </div>


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

      <!-- Acces interzis -->
      <div v-else class="access-denied">
        <span class="access-icon">⚠️</span>
        <p>Acces interzis</p>
      </div>
    </div>
  </div>
</template>

<script>
import { USERS_ROLES_PAGINATED } from '@/api.js'
import DatePickerRo from '@/components/DatePickerRo.vue'

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

export default {
  name: 'UsersRolesView',
  components: { DatePickerRo },

  data() {
    return {
      rows: [],
      loading: false,
      currentPage: 1,
      pageSize: 15,
      filters: {
        role: '', dateFrom: '', dateTo: '',
        institution: '', firstName: '', lastName: '',
        username: '', department: '', status: ''
      },
      PERMISIONS: { list: true },
      roleLabels: ROLE_LABELS,
      statusLabels: {
        active: 'Activ', reset: 'Activ',
        disabled: 'Dezactivat', unconfirmed: 'Neconfirmat'
      }
    }
  },

  computed: {
    isSuperadmin() {
      return this.$store?.getters?.userRole?.role === 'superadmin'
    },

    filteredRows() {
      return this.rows.filter(r => {
        const u = r.user || {}
        if (this.filters.role &&
          !(ROLE_LABELS[r.role] || r.role || '').toLowerCase()
            .includes(this.filters.role.toLowerCase())) return false
        if (this.filters.institution &&
          !(r.institution?.name || '').toLowerCase()
            .includes(this.filters.institution.toLowerCase())) return false
        if (this.filters.firstName &&
          !(u.first_name || '').toLowerCase()
            .includes(this.filters.firstName.toLowerCase())) return false
        if (this.filters.lastName &&
          !(u.last_name || '').toLowerCase()
            .includes(this.filters.lastName.toLowerCase())) return false
        if (this.filters.username &&
          !(u.email || '').toLowerCase()
            .includes(this.filters.username.toLowerCase())) return false
        if (this.filters.department &&
          !(r.department?.name || '').toLowerCase()
            .includes(this.filters.department.toLowerCase())) return false
        if (this.filters.status && r.userRoleStatus !== this.filters.status) return false
        if (this.filters.dateFrom) {
          if (new Date(r.createdAt) < new Date(this.filters.dateFrom)) return false
        }
        if (this.filters.dateTo) {
          if (new Date(r.createdAt) > new Date(this.filters.dateTo + 'T23:59:59')) return false
        }
        return true
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
    async loadData() {
      this.loading = true
      try {
        // Încarcă toate înregistrările paginate
        const res = await USERS_ROLES_PAGINATED(1, 1000, '')
        const rolesData = await res.json()
        if (Array.isArray(rolesData?.data?.result)) {
          this.rows = rolesData.data.result
        }
      } catch (e) { console.error(e) }
      this.loading = false
    },

    formatDate(dateStr) {
      if (!dateStr) return '-'
      const d = new Date(dateStr)
      return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    },

    onFilter() { this.currentPage = 1 },

    clearFilters() {
      this.filters = {
        role: '', dateFrom: '', dateTo: '',
        institution: '', firstName: '', lastName: '',
        username: '', department: '', status: ''
      }
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

.table-wrapper {
  background: white; border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  flex: 1; display: flex; flex-direction: column; overflow: hidden;
}

.data-table-scroll { flex: 1; overflow-y: auto; }
.data-table { width: 100%; border-collapse: collapse; }

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
.f-input--date { gap: 3px; font-size: 0.75rem; flex-direction: column; padding: 4px 6px; }
.f-input--date span { color: #9e9e9e; flex-shrink: 0; text-align: center; }
.f-date-field { border: none; outline: none; font-size: 0.75rem; color: #424242; background: transparent; width: 100%; font-family: 'Roboto', sans-serif; }
.f-select { border: 1px solid #E0E0E0; border-radius: 5px; padding: 4px 6px; font-size: 0.8rem; background: white; font-family: 'Roboto', sans-serif; outline: none; flex: 1; }
.btn-clear-filters {
  display: flex; align-items: center; justify-content: center;
  width: 26px; height: 26px; border: 1px solid #E0E0E0; border-radius: 5px;
  background: white; cursor: pointer; color: #9e9e9e; flex-shrink: 0;
  transition: all 0.15s;
}
.btn-clear-filters:hover { background: #FFEBEE; color: #E53935; border-color: #E53935; }

.table-row td {
  padding: 0.6rem 0.75rem; font-size: 0.875rem;
  border-bottom: 1px solid #f0f0f0; color: #333; vertical-align: middle;
}
.row-even { background: white; }
.row-odd { background: #fafbfd; }
.table-row:hover td { background: #EEF5FF !important; }

.col-nr { width: 50px; text-align: center; }
.col-date { width: 130px; white-space: nowrap; }
.col-status { width: 130px; }
.col-username { max-width: 180px; }
.col-wrap { white-space: normal; word-break: break-word; }

.role-chip {
  display: inline-block; background: #E3F2FD; color: #1565C0;
  padding: 2px 10px; border-radius: 10px; font-size: 0.78rem; font-weight: 500;
  white-space: nowrap;
}

.text-truncate {
  display: block; max-width: 160px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.status-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 8px; border-radius: 12px; font-size: 0.78rem; font-weight: 500;
}
.status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.status-active, .status-reset { background: #e8f5e9; color: #2e7d32; }
.status-active .status-dot, .status-reset .status-dot { background: #43a047; }
.status-disabled { background: #ffebee; color: #c62828; }
.status-disabled .status-dot { background: #e53935; }
.status-unconfirmed { background: #fffde7; color: #f57f17; }
.status-unconfirmed .status-dot { background: #fbc02d; }

.empty-tr td { height: 0; padding: 0 !important; border: none !important; }
.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px; padding: 3rem 1rem; color: #BDBDBD; font-size: 13px; font-style: italic;
}

.table-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.75rem 1rem; border-top: 1px solid #e8e8e8;
  background: white; font-size: 0.82rem; color: #555; position: sticky; bottom: 0; z-index: 2;
}
.pagination { display: flex; align-items: center; gap: 0.75rem; }
.page-size-select {
  border: 1px solid #ddd; border-radius: 4px;
  padding: 2px 4px; font-size: 0.82rem; margin-left: 4px;
}
.page-btn {
  background: none; border: 1px solid #ddd; border-radius: 4px;
  padding: 2px 10px; cursor: pointer; font-size: 1rem; color: #555;
}
.page-btn:hover:not(:disabled) { background: #1565C0; color: white; border-color: #1565C0; }
.page-btn:disabled { opacity: 0.4; cursor: default; }

.access-denied {
  display: flex; flex-direction: column; align-items: center; padding: 4rem; color: #aaa;
}
.access-icon { font-size: 4rem; margin-bottom: 1rem; }
</style>
