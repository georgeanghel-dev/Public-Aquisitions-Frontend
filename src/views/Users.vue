<template>
  <div class="page-container">
    <!-- Banner breadcrumb -->
    <div class="page-banner">
      <div class="breadcrumb">
        <span class="breadcrumb-link" @click="$router.push('/')">Acasă</span>
        <span class="breadcrumb-sep">/</span>
        <span>Utilizatori</span>
      </div>
    </div>

    <div class="page-content">
      <!-- Header -->
      <div class="content-header">
        <h1 class="page-title">Utilizatori</h1>
        <div class="header-actions" v-if="PERMISIONS.create">
          <button class="btn btn-primary" @click="openImportDrawer">
            <span class="btn-icon">⇩</span>
            Importă utilizatori
          </button>
        </div>
      </div>

      <!-- Tabel -->
      <div class="table-wrapper" v-if="PERMISIONS.list">
        <div class="data-table-scroll">
        <table class="data-table">
          <thead>
            <tr class="table-header-row">
              <th class="col-nr">NR.</th>
              <th class="col-date">DATA CREĂRII</th>
              <th v-if="isSuperadmin" class="col-institution">INSTITUȚIE</th>
              <th class="col-name">PRENUME</th>
              <th class="col-name">NUME</th>
              <th class="col-id">ID / CONECTX</th>
              <th class="col-user">USER</th>
              <th class="col-phone">TELEFON</th>
              <th class="col-status">STATUS</th>
              <th class="col-actions"></th>
            </tr>
            <tr class="table-filter-row">
              <th></th>
              <th>
                <div class="f-input f-input--date">
                  <DatePickerRo v-model="filters.dateFrom" placeholder="De la" />
                  <span>—</span>
                  <DatePickerRo v-model="filters.dateTo" placeholder="Până la" />
                </div>
              </th>
              <th v-if="isSuperadmin">
                <div class="f-input">
                  <svg class="f-ico" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input v-model="filters.institution" class="f-field" placeholder="Caută..."  />
                </div>
              </th>
              <th>
                <div class="f-input">
                  <svg class="f-ico" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input v-model="filters.firstName" class="f-field" placeholder="Caută..."  />
                </div>
              </th>
              <th>
                <div class="f-input">
                  <svg class="f-ico" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input v-model="filters.lastName" class="f-field" placeholder="Caută..."  />
                </div>
              </th>
              <th>
                <div class="f-input">
                  <svg class="f-ico" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input v-model="filters.conectxId" class="f-field" placeholder="Caută..." type="number"  />
                </div>
              </th>
              <th>
                <div class="f-input">
                  <svg class="f-ico" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input v-model="filters.username" class="f-field" placeholder="Caută..."  />
                </div>
              </th>
              <th>
                <div class="f-input">
                  <svg class="f-ico" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input v-model="filters.phone" class="f-field" placeholder="Caută..."  />
                </div>
              </th>
              <th>
                <select v-model="filters.status" class="f-select" >
                  <option value="">Toate</option>
                  <option value="active">Activ</option>
                  <option value="disabled">Dezactivat</option>
                  <option value="unconfirmed">Neconfirmat</option>
                </select>
              </th>
              <th>
                <button class="btn-clear-filters" @click="clearFilters" title="Șterge filtrele">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(user, index) in paginatedUsers"
              :key="user.id"
              :class="['table-row', index % 2 === 0 ? 'row-even' : 'row-odd']"
            >
              <td class="col-nr">{{ (currentPage - 1) * pageSize + index + 1 }}</td>
              <td class="col-date">{{ formatDate(user.createdAt) }}</td>
              <td v-if="isSuperadmin" class="col-institution">
                <span class="text-wrap">{{ user.institution?.name || '-' }}</span>
              </td>
              <td>{{ user.first_name || '-' }}</td>
              <td>{{ user.last_name || '-' }}</td>
              <td class="col-id">{{ user.id || '-' }}</td>
              <td class="col-user">
                <span class="text-truncate">{{ user.email || '-' }}</span>
              </td>
              <td>{{ user.phone || '-' }}</td>
              <td class="col-status">
                <span :class="['status-badge', `status-${user.userStatus}`]">
                  <span class="status-dot"></span>
                  {{ statusLabels[user.userStatus] || '-' }}
                </span>
              </td>
              <td class="col-actions">
                <div class="actions-menu">
                  <div class="kebab" @click.stop="toggleMenu(user.id)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#9e9e9e"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
                  </div>
                  <div v-if="activeMenu === user.id" class="actions-dropdown" @click.stop>
                    <button
                      v-if="PERMISIONS.edit"
                      class="action-item"
                      @click="editUser(user)"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F57F17" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      Editează
                    </button>
                    <button
                      v-if="user.userStatus === 'disabled' && PERMISIONS.enableUser"
                      class="action-item action-success"
                      @click="statusUser(user, true)"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      Activează
                    </button>
                    <button
                      v-if="['active','reset'].includes(user.userStatus) && PERMISIONS.disableUser"
                      class="action-item action-danger"
                      @click="statusUser(user, false)"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                      Dezactivează
                    </button>
                    <button
                      class="action-item"
                      @click="viewHistory(user)"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1565C0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      Istoric
                    </button>
                    <div class="kebab-divider"></div>
                    <button
                      v-if="PERMISIONS.delete && !hasActiveRoles(user)"
                      class="action-item action-danger"
                      @click="deleteUser(user)"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      Șterge
                    </button>
                  </div>
                </div>
              </td>
            </tr>
            <tr v-if="filteredUsers.length === 0" class="empty-tr">
              <td colspan="100" class="empty-row"></td>
            </tr>
          </tbody>
        </table>

        <!-- Empty state în afara tabelului pentru centrare corectă -->
        <div v-if="filteredUsers.length === 0" class="empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#E0E0E0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <span>Nu există înregistrări</span>
        </div>

        <!-- Footer tabel -->
        </div><!-- /data-table-scroll -->

        <div class="table-footer">
          <span class="total-records">TOTAL AFIȘAT: {{ currentPage * pageSize - pageSize + paginatedUsers.length }}/{{ filteredUsers.length }}</span>
          <div class="pagination">
            <span class="page-info">Rânduri pe pagină:
              <select v-model="pageSize" class="page-size-select">
                <option :value="15">15</option>
                <option :value="25">25</option>
                <option :value="50">50</option>
              </select>
            </span>
            <span class="page-range">{{ (currentPage-1)*pageSize+1 }}-{{ Math.min(currentPage*pageSize, filteredUsers.length) }}</span>
            <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">‹</button>
            <button class="page-btn" :disabled="currentPage >= totalPages" @click="currentPage++">›</button>
          </div>
        </div>
      </div>

      <!-- Access denied -->
      <div v-else class="access-denied">
        <span class="access-icon">⚠️</span>
        <p>Acces interzis</p>
      </div>
    </div>

    <!-- Import drawer -->
    <SyncUsersDrawer
      v-if="showImportDrawer"
      @close="showImportDrawer = false"
      @saved="onUsersSaved"
    />

    <!-- Edit modal -->
    <UsersEditModal
      v-if="editingUser"
      :user="editingUser"
      @close="editingUser = null"
      @saved="onUserSaved"
    />

    <!-- History modal -->
    <UsersHistoryModal
      v-if="historyUser"
      :user="historyUser"
      @close="historyUser = null"
    />

    <!-- Confirm modal -->
    <div v-if="confirmModal" class="modal-overlay" @click.self="confirmModal = null">
      <div class="confirm-modal">
        <h3>{{ confirmModal.title }}</h3>
        <p>{{ confirmModal.message }}</p>
        <div v-if="confirmModal.requireReason" class="form-group">
          <label>{{ confirmModal.reasonLabel }}</label>
          <textarea v-model="confirmModal.reason" class="form-textarea" rows="3"></textarea>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="confirmModal = null">Anulează</button>
          <button :class="['btn', confirmModal.type === 'danger' ? 'btn-danger' : 'btn-success']"
            @click="confirmModal.onConfirm(confirmModal.reason)">
            {{ confirmModal.confirmText }}
          </button>
        </div>
      </div>
    </div>

    <!-- Click outside handler -->
    <div v-if="activeMenu" class="overlay-transparent" @click="activeMenu = null"></div>
  </div>
</template>

<script>
import { USERS_PAGINATED, USER_MODIFY, USER_DELETE, USERS_CHECK_ROLE, USERS_ONCE } from '@/api.js'
import SyncUsersDrawer from '@/components/SyncUsersDrawer.vue'
import UsersEditModal from '@/components/UsersEditModal.vue'
import UsersHistoryModal from '@/components/UsersHistoryModal.vue'
import DatePickerRo from '@/components/DatePickerRo.vue'

export default {
  name: 'Users',
  components: { SyncUsersDrawer, UsersEditModal, UsersHistoryModal, DatePickerRo },

  data() {
    return {
      users: [],
      loading: false,
      showImportDrawer: false,
      editingUser: null,
      historyUser: null,
      activeMenu: null,
      confirmModal: null,
      currentPage: 1,
      pageSize: 15,
      filters: {
        dateFrom: '', dateTo: '',
        institution: '', firstName: '', lastName: '',
        conectxId: '', username: '', phone: '', status: ''
      },
      PERMISIONS: {
        list: true, create: true, edit: true,
        delete: true, enableUser: true, disableUser: true
      },
      statusLabels: {
        active: 'Activ', disabled: 'Dezactivat',
        reset: 'Activ', unconfirmed: 'Neconfirmat'
      }
    }
  },

  computed: {
    isSuperadmin() {
      return this.$store?.getters?.userRole?.role === 'superadmin'
    },
    filteredUsers() {
      return this.users.filter(u => {
        if (this.filters.dateFrom && new Date(u.createdAt) < new Date(this.filters.dateFrom)) return false
        if (this.filters.dateTo && new Date(u.createdAt) > new Date(this.filters.dateTo + 'T23:59:59')) return false
        if (this.filters.firstName && !u.first_name?.toLowerCase().includes(this.filters.firstName.toLowerCase())) return false
        if (this.filters.lastName && !u.last_name?.toLowerCase().includes(this.filters.lastName.toLowerCase())) return false
        if (this.filters.username && !u.email?.toLowerCase().includes(this.filters.username.toLowerCase())) return false
        if (this.filters.phone && !u.phone?.includes(this.filters.phone)) return false
        if (this.filters.conectxId && String(u.id) !== String(this.filters.conectxId)) return false
        if (this.filters.institution && !u.institution?.name?.toLowerCase().includes(this.filters.institution.toLowerCase())) return false
        if (this.filters.status && u.userStatus !== this.filters.status) return false
        return true
      })
    },
    paginatedUsers() {
      const start = (this.currentPage - 1) * this.pageSize
      return this.filteredUsers.slice(start, start + this.pageSize)
    },
    totalPages() {
      return Math.ceil(this.filteredUsers.length / this.pageSize)
    }
  },

  watch: {
    filters: { deep: true, handler() { this.currentPage = 1 } }
  },

  methods: {
    async loadUsers() {
      this.loading = true
      try {
        const res = await USERS_PAGINATED(1, 1000, '')
        const userData = await res.json()
        if (userData?.data?.result) {
          this.users = userData.data.result.map(r => ({ ...r.user, ...r }))
        }
      } catch (e) { console.error(e) }
      this.loading = false
    },

    formatDate(dateStr) {
      if (!dateStr) return '-'
      const d = new Date(dateStr)
      return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
    },

    hasActiveRoles(user) {
      return user.userRoles?.some(r => ['active','disabled'].includes(r.userRoleStatus))
    },

    toggleMenu(id) {
      this.activeMenu = this.activeMenu === id ? null : id
    },

    clearFilters() {
      this.filters = { dateFrom:'', dateTo:'', institution:'', firstName:'', lastName:'', conectxId:'', username:'', phone:'', status:'' }
    },

    editUser(user) {
      this.activeMenu = null
      this.editingUser = user
    },

    viewHistory(user) {
      this.activeMenu = null
      this.historyUser = user
    },

    deleteUser(user) {
      this.activeMenu = null
      this.confirmModal = {
        title: 'Șterge utilizator',
        message: `Confirmați ștergerea utilizatorului ${user.first_name} ${user.last_name}?`,
        type: 'danger',
        confirmText: 'Șterge',
        requireReason: false,
        reason: '',
        onConfirm: async () => {
          try {
            await USER_DELETE(user.uuid)
            this.confirmModal = null
            await this.loadUsers()
          } catch(e) { console.error(e) }
        }
      }
    },

    statusUser(user, activate) {
      this.activeMenu = null

      // Activare — fără verificare prealabilă, modal cu Observații opționale
      if (activate) {
        this.confirmModal = {
          title: 'Activare utilizator',
          message: `${user.first_name} ${user.last_name}`,
          type: 'success',
          confirmText: 'Activează',
          requireReason: false,
          reasonLabel: 'Observații',
          reason: '',
          onConfirm: async (reason) => {
            try {
              await USER_MODIFY(user.uuid, { userStatus: 'active', actionReason: reason || ' ' })
              this.confirmModal = null
              await this.loadUsers()
            } catch(e) { console.error(e) }
          }
        }
        return
      }

      // Dezactivare — verificare prealabilă pe toate rolurile
      USERS_ONCE(user.uuid)
        .then(res => res.json())
        .then(data => {
          const userRoles = data?.data?.result?.userRoles || []

          if (!userRoles.length) {
            // Fără roluri — dezactivare directă
            this._showDeactivateModal(user, false)
            return
          }

          const promises = userRoles.map(r => USERS_CHECK_ROLE(r.id).then(res => res.json()))

          Promise.all(promises).then(results => {
            // Verificăm dacă vreun rol participă în avizare activă
            const inAvizare = results.some(r =>
              Array.isArray(r?.data?.result) && r.data.result.some(e => e.status === 'avizo')
            )

            if (inAvizare) {
              // Blocat — nu se poate dezactiva
              this.confirmModal = {
                title: 'Dezactivare imposibilă',
                message: 'Utilizatorul nu poate fi dezactivat deoarece deține roluri care participă în procese de avizare active.',
                type: 'danger',
                confirmText: 'Înțeles',
                requireReason: false,
                reason: '',
                onConfirm: () => { this.confirmModal = null }
              }
              return
            }

            const hasDependencies = results.some(r =>
              Array.isArray(r?.data?.result) && r.data.result.length > 0
            )

            // Cu sau fără avertisment de dependențe
            this._showDeactivateModal(user, hasDependencies)
          }).catch(() => this._showDeactivateModal(user, false))
        })
        .catch(() => this._showDeactivateModal(user, false))
    },

    _showDeactivateModal(user, hasDependencies) {
      this.confirmModal = {
        title: 'Dezactivare utilizator',
        message: hasDependencies
          ? `${user.first_name} ${user.last_name} — Atenție: utilizatorul poate deține roluri de aprobator pentru unele necesități. Dezactivarea va afecta procesele în curs.`
          : `${user.first_name} ${user.last_name}`,
        type: 'danger',
        confirmText: 'Dezactivează',
        requireReason: true,
        reasonLabel: 'Motivul dezactivării',
        reason: '',
        onConfirm: async (reason) => {
          if (!reason?.trim()) return
          try {
            await USER_MODIFY(user.uuid, { userStatus: 'disabled', actionReason: reason })
            this.confirmModal = null
            await this.loadUsers()
          } catch(e) { console.error(e) }
        }
      }
    },

    openImportDrawer() {
      this.showImportDrawer = true
    },

    onUsersSaved() {
      this.showImportDrawer = false
      this.loadUsers()
    },

    onUserSaved() {
      this.editingUser = null
      this.loadUsers()
    }
  },

  created() {
    this.loadUsers()
  }
}
</script>

<style scoped>
.page-container { display: flex; flex-direction: column; height: 100%; }

.page-banner {
  background: #1565C0; color: white; padding: 0.6rem 1.5rem;
}
.breadcrumb { font-size: 0.85rem; }
.breadcrumb-link { cursor: pointer; opacity: 0.85; }
.breadcrumb-link:hover { opacity: 1; text-decoration: underline; }
.breadcrumb-sep { margin: 0 0.4rem; opacity: 0.6; }

.page-content { padding: 1.25rem 1.5rem; flex: 1; display: flex; flex-direction: column; }

.content-header {
  display: flex; justify-content: space-between;
  align-items: center; margin-bottom: 1rem;
}
.page-title { font-size: 1.4rem; font-weight: 600; color: #1a2f4e; margin: 0; }

.header-actions { display: flex; gap: 0.75rem; }
.btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; border-radius: 6px; border: none; cursor: pointer; font-size: 0.875rem; font-weight: 500; font-family: 'Roboto', sans-serif; }
.btn-primary { background: #1565C0; color: white; }
.btn-primary:hover { background: #1251a3; }
.btn-secondary { background: #f5f5f5; color: #333; border: 1px solid #ddd; }
.btn-danger { background: #e53935; color: white; }
.btn-success { background: #43a047; color: white; }
.btn-icon { font-size: 1rem; }

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
.f-select { border: 1px solid #E0E0E0; border-radius: 5px; padding: 4px 6px; font-size: 0.8rem; width: 100%; background: white; font-family: 'Roboto', sans-serif; outline: none; }
.btn-clear-filters {
  display: flex; align-items: center; justify-content: center;
  width: 26px; height: 26px; border: 1px solid #E0E0E0; border-radius: 5px;
  background: white; cursor: pointer; color: #9e9e9e; margin: 0 auto;
  transition: all 0.15s;
}
.btn-clear-filters:hover { background: #FFEBEE; color: #E53935; border-color: #E53935; }

.table-row td {
  padding: 0.6rem 0.75rem; font-size: 0.875rem;
  border-bottom: 1px solid #f0f0f0; color: #333;
  vertical-align: middle;
}
.row-even { background: white; }
.row-odd { background: #fafbfd; }
.table-row:hover td { background: #EEF5FF !important; }

.text-wrap { white-space: normal; word-break: break-word; }
.text-truncate { display: block; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.col-nr { width: 50px; text-align: center; }
.col-date { width: 130px; }
.col-institution { max-width: 160px; }
.col-name { min-width: 90px; }
.col-id { width: 90px; }
.col-user { max-width: 160px; }
.col-phone { width: 120px; }
.col-status { width: 120px; }
.col-actions { width: 50px; text-align: center; }

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

.actions-menu { position: relative; display: flex; justify-content: center; }
.kebab { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 6px; cursor: pointer; transition: background 0.15s; }
.kebab:hover { background: #F0F0F0; }
.actions-dropdown {
  position: absolute; right: 0; top: calc(100% + 2px); z-index: 500;
  background: white; border-radius: 8px; min-width: 170px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.14);
  border: 1px solid #E0E0E0; overflow: hidden; font-family: 'Roboto', sans-serif;
}
.action-item {
  display: flex; align-items: center; gap: 9px;
  width: 100%; text-align: left;
  padding: 10px 14px; background: none; border: none;
  cursor: pointer; font-size: 13px; color: #424242;
  font-family: 'Roboto', sans-serif; transition: background 0.12s;
}
.action-item:hover { background: #F5F7FA; }
.action-item.action-danger { color: #E53935; }
.action-item.action-danger:hover { background: #FFEBEE; }
.action-item.action-success { color: #2E7D32; }
.action-item.action-success:hover { background: #E8F5E9; }
.kebab-divider { border-top: 1px solid #F0F0F0; margin: 2px 0; }

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
  border: 1px solid #ddd; border-radius: 4px; padding: 2px 4px;
  font-size: 0.82rem; margin-left: 4px;
}
.page-btn {
  background: none; border: 1px solid #ddd; border-radius: 4px;
  padding: 2px 10px; cursor: pointer; font-size: 1rem; color: #555;
}
.page-btn:hover:not(:disabled) { background: #1565C0; color: white; border-color: #1565C0; }
.page-btn:disabled { opacity: 0.4; cursor: default; }

.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center; z-index: 200;
}
.confirm-modal {
  background: white; border-radius: 10px; padding: 1.75rem;
  width: 480px; max-width: 90vw; box-shadow: 0 8px 32px rgba(0,0,0,0.15);
}
.confirm-modal h3 { margin: 0 0 0.5rem; font-size: 1.1rem; color: #1a2f4e; }
.confirm-modal p { color: #555; margin: 0 0 1rem; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; font-size: 0.85rem; font-weight: 500; margin-bottom: 4px; color: #444; }
.form-textarea {
  width: 100%; border: 1px solid #ddd; border-radius: 6px;
  padding: 0.5rem; font-family: 'Roboto', sans-serif; font-size: 0.875rem;
  resize: vertical;
}
.modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.25rem; }

.access-denied { display: flex; flex-direction: column; align-items: center; padding: 4rem; color: #aaa; }
.access-icon { font-size: 4rem; margin-bottom: 1rem; }

.overlay-transparent { position: fixed; inset: 0; z-index: 99; }
</style>
