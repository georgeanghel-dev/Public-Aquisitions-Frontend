<template>
  <!-- Overlay -->
  <div class="drawer-overlay" @click.self="$emit('close')">
    <div class="drawer">
      <!-- Header -->
      <div class="drawer-header">
        <div>
          <h2 class="drawer-title">Importă utilizatori</h2>
          <p class="drawer-subtitle">Preia utilizatori din ConectX și adaugă-i în platformă</p>
        </div>
        <button class="btn-close" @click="$emit('close')">✕</button>
      </div>

      <!-- Steps indicator -->
      <div class="steps-bar">
        <div :class="['step', step >= 1 ? 'step-active' : '']">
          <span class="step-num">1</span>
          <span class="step-label">Selectare instituție</span>
        </div>
        <div class="step-connector"></div>
        <div :class="['step', step >= 2 ? 'step-active' : '']">
          <span class="step-num">2</span>
          <span class="step-label">Preia utilizatori</span>
        </div>
        <div class="step-connector"></div>
        <div :class="['step', step >= 3 ? 'step-active' : '']">
          <span class="step-num">3</span>
          <span class="step-label">Selectează și salvează</span>
        </div>
      </div>

      <!-- Body -->
      <div class="drawer-body">

        <!-- Step 1: Institution (Superadmin only) -->
        <div class="step-section">
          <div class="step-header">
            <span class="step-badge">1</span>
            <span>Instituția</span>
            <span v-if="!isSuperadmin" class="badge-auto">Completat automat</span>
          </div>
          <div v-if="isSuperadmin" class="form-group">
            <select v-model="selectedInstitution" class="form-select" :disabled="loading">
              <option value="">— Selectează instituția —</option>
              <option v-for="inst in institutions" :key="inst.id" :value="inst">
                {{ inst.name }}
              </option>
            </select>
          </div>
          <div v-else class="institution-display">
            <span class="badge-conectx">ConectX</span>
            {{ currentInstitutionName }}
          </div>
        </div>

        <!-- Step 2: Fetch -->
        <div class="step-section" :class="{ 'step-disabled': !canFetch }">
          <div class="step-header">
            <span class="step-badge">2</span>
            <span>Preia utilizatori din ConectX</span>
          </div>
          <div class="fetch-row">
            <!-- Filters -->
            <div class="filters-row">
              <div class="filter-group">
                <label class="filter-label">Structură organizatorică</label>
                <select v-model="filterDepartment" class="form-select-sm" :disabled="!canFetch || loading">
                  <option value="">Toate structurile</option>
                  <option v-for="d in departments" :key="d.id" :value="d.name">{{ d.name }}</option>
                </select>
              </div>
              <div class="filter-group">
                <label class="filter-label">Nume utilizator</label>
                <div class="search-input">
                  <input v-model="filterName" class="form-input-sm" placeholder="Caută după nume..." :disabled="!canFetch || loading" @keydown.enter="fetchUsers" />
                </div>
              </div>
            </div>
            <button
              class="btn btn-fetch"
              :disabled="!canFetch || loading"
              @click="fetchUsers"
            >
              <span v-if="loading" class="spinner"></span>
              <span v-else>⇩</span>
              {{ loading ? 'Se preia...' : 'Preia din ConectX' }}
            </button>
          </div>

          <div v-if="fetchDone && users.length === 0" class="empty-fetch">
            <span>✓</span> Toți utilizatorii disponibili au fost deja importați.
          </div>
        </div>

        <!-- Step 3: Select & Save -->
        <div class="step-section" :class="{ 'step-disabled': users.length === 0 }">
          <div class="step-header">
            <span class="step-badge">3</span>
            <span>Selectează utilizatorii de importat</span>
            <div class="legend">
              <span class="legend-item new">● Nou</span>
              <span class="legend-item existing">● Deja importat</span>
              <span class="legend-item warning">⚠ Date incomplete</span>
            </div>
          </div>

          <div v-if="users.length > 0">
            <!-- Select all -->
            <div class="select-all-row">
              <label class="checkbox-label">
                <input type="checkbox" :checked="allNewSelected" @change="toggleSelectAllNew" />
                <span>Selectează toți utilizatorii noi ({{ newUsersCount }})</span>
              </label>
              <span class="selected-count">{{ selectedCount }} selectat(i)</span>
            </div>

            <!-- Table -->
            <div class="users-table-wrap">
              <table class="users-table">
                <thead>
                  <tr>
                    <th class="th-check"></th>
                    <th>CONECTX ID</th>
                    <th>NUME</th>
                    <th>PRENUME</th>
                    <th>USERNAME</th>
                    <th>EMAIL</th>
                    <th>TELEFON</th>
                    <th>STATUS</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="user in users"
                    :key="user.conectxid"
                    :class="[
                      'user-row',
                      user.alreadyImported ? 'row-existing' : 'row-new',
                      user.hasIssues ? 'row-warning' : ''
                    ]"
                  >
                    <td class="td-check">
                      <input
                        type="checkbox"
                        :checked="isSelected(user)"
                        :disabled="user.alreadyImported"
                        @change="toggleSelect(user)"
                      />
                    </td>
                    <td>{{ user.conectxid }}</td>
                    <td>{{ user.last_name }}</td>
                    <td>{{ user.first_name }}</td>
                    <td>
                      <span class="username-cell">
                        {{ user.username }}
                        <span v-if="user.usernameExists" class="issue-badge">duplicat</span>
                      </span>
                    </td>
                    <td>
                      <span :class="['email-cell', !user.emailValid ? 'invalid' : '']">
                        {{ user.email }}
                        <span v-if="!user.emailValid" class="issue-icon" title="Format invalid">⚠</span>
                      </span>
                    </td>
                    <td>
                      <span :class="['phone-cell', user.phoneInvalid ? 'invalid' : '']">
                        {{ user.phone || '-' }}
                        <span v-if="user.phoneInvalid" class="issue-icon" title="Format invalid">⚠</span>
                      </span>
                    </td>
                    <td>
                      <span v-if="user.alreadyImported" class="badge-existing">Deja importat</span>
                      <span v-else class="badge-new">Nou</span>
                    </td>
                    <td>
                      <button
                        v-if="!user.alreadyImported"
                        class="btn-sync"
                        :class="{ 'btn-sync--failed': user.syncFailed }"
                        @click="syncUser(user)"
                        :title="user.syncFailed ? 'Sincronizarea a eșuat. Apasă pentru a reîncerca.' : 'Sincronizează date din ConectX'"
                        :disabled="user.syncing"
                      >
                        <span :class="['sync-icon', user.syncing ? 'spinning' : '']">↻</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Warning dacă utilizatori cu probleme sunt selectați -->
            <div v-if="hasIssuesInSelection" class="issues-warning">
              ⚠ Există utilizatori selectați cu date incomplete (email invalid sau telefon incorect). Te rugăm să îi deselectezi sau să îi sincronizezi înainte de salvare.
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="drawer-footer">
        <button class="btn btn-secondary" @click="$emit('close')">Anulează</button>
        <button
          class="btn btn-primary"
          :disabled="selectedCount === 0 || hasIssuesInSelection || saving"
          @click="saveUsers"
        >
          <span v-if="saving" class="spinner spinner-white"></span>
          Importă {{ selectedCount > 0 ? selectedCount : '' }} utilizator(i)
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import {
  INSTITUTIONS_PAGINATED, DEPARTMENTS_PAGINATED,
  IMPORT_USERS, SAVE_USERS, USER_SYNC
} from '@/api.js'

export default {
  name: 'SyncUsersDrawer',
  emits: ['close', 'saved'],

  data() {
    return {
      step: 1,
      loading: false,
      saving: false,
      fetchDone: false,
      institutions: [],
      departments: [],
      selectedInstitution: '',
      filterDepartment: '',
      filterName: '',
      users: [],
      selectedIds: new Set(),
    }
  },

  computed: {
    isSuperadmin() {
      return this.$store?.getters?.userRole?.role === 'superadmin'
    },
    currentInstitutionName() {
      return this.$store?.getters?.userInstitution?.name || 'Instituția curentă'
    },
    canFetch() {
      return this.isSuperadmin ? !!this.selectedInstitution : true
    },
    newUsersCount() {
      return this.users.filter(u => !u.alreadyImported).length
    },
    allNewSelected() {
      const newUsers = this.users.filter(u => !u.alreadyImported)
      return newUsers.length > 0 && newUsers.every(u => this.selectedIds.has(u.conectxid))
    },
    selectedCount() {
      return this.selectedIds.size
    },
    hasIssuesInSelection() {
      return this.users.some(u => this.selectedIds.has(u.conectxid) && u.hasIssues)
    }
  },

  watch: {
    selectedInstitution(val) {
      if (val) {
        this.step = 2
        this.users = []
        this.fetchDone = false
        this.selectedIds = new Set()
        this.loadDepartments()
      }
    }
  },

  methods: {
    async loadInstitutions() {
      try {
        const res = await INSTITUTIONS_PAGINATED(1, 500)
        const instData = await res.json()
        if (Array.isArray(instData?.data?.result)) {
          this.institutions = instData.data.result
        }
      } catch(e) { console.error(e) }
    },

    async loadDepartments() {
      const instId = this.isSuperadmin
        ? this.selectedInstitution?.id
        : this.$store?.getters?.userInstitution?.id
      if (!instId) return
      try {
        const res = await DEPARTMENTS_PAGINATED(1, 500, `institution.id=${instId}`)
        const depData = await res.json()
        if (Array.isArray(depData?.data?.result)) {
          this.departments = depData.data.result
        }
      } catch(e) { console.error(e) }
    },

    async fetchUsers() {
      if (!this.canFetch) return
      this.loading = true
      this.users = []
      this.selectedIds = new Set()
      this.fetchDone = false
      try {
        const instId = this.isSuperadmin ? this.selectedInstitution?.id : null
        const query = instId ? `?institutionId=${instId}` : null
        const res = await IMPORT_USERS(query)
        const data = await res.json()
        if (data?.data) {
          let list = data.data

          // Apply local filters
          if (this.filterDepartment) {
            list = list.filter(u => u.department === this.filterDepartment)
          }
          if (this.filterName) {
            const q = this.filterName.toLowerCase()
            list = list.filter(u =>
              u.first_name?.toLowerCase().includes(q) ||
              u.last_name?.toLowerCase().includes(q)
            )
          }

          this.users = list.map(u => {
            const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u.email || '')
            const hasIssues = !emailValid
            return {
              conectxid: u.id,
              first_name: u.first_name,
              last_name: u.last_name,
              username: u.username,
              email: u.email,
              phone: u.phone,
              department: u.department,
              alreadyImported: false, // backend returns only non-imported; mark if needed
              emailValid,
              phoneInvalid: false,
              usernameExists: false,
              hasIssues,
              syncing: false
            }
          })

          // Auto-select all new users
          this.users.filter(u => !u.alreadyImported).forEach(u => {
            this.selectedIds.add(u.conectxid)
          })
          this.selectedIds = new Set(this.selectedIds) // trigger reactivity

          this.step = 3
          this.fetchDone = true
        }
      } catch(e) { console.error(e) }
      this.loading = false
    },

    isSelected(user) {
      return this.selectedIds.has(user.conectxid)
    },

    toggleSelect(user) {
      const newSet = new Set(this.selectedIds)
      if (newSet.has(user.conectxid)) {
        newSet.delete(user.conectxid)
      } else {
        newSet.add(user.conectxid)
      }
      this.selectedIds = newSet
    },

    toggleSelectAllNew() {
      const newUsers = this.users.filter(u => !u.alreadyImported)
      if (this.allNewSelected) {
        this.selectedIds = new Set()
      } else {
        this.selectedIds = new Set(newUsers.map(u => u.conectxid))
      }
    },

    async syncUser(user) {
      const idx = this.users.findIndex(u => u.conectxid === user.conectxid)
      if (idx === -1) return
      this.users[idx].syncing = true
      this.users[idx].syncFailed = false
      try {
        const instId = this.isSuperadmin
          ? this.selectedInstitution?.id
          : window.$getRoleAll?.()?.institutionId
        const body = { conectxId: user.conectxid }
        if (instId) body.institutionId = instId
        const res = await USER_SYNC(body)
        const syncData = await res.json()
        if (syncData?.data) {
          const d = syncData.data
          const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email || '')
          this.users[idx] = {
            ...this.users[idx],
            first_name: d.first_name,
            last_name: d.last_name,
            username: d.username,
            email: d.email,
            phone: d.phone,
            emailValid,
            hasIssues: !emailValid,
            syncing: false,
            syncFailed: false
          }
          this.users = [...this.users]
        } else {
          this.users[idx].syncing = false
          this.users[idx].syncFailed = true
          this.users = [...this.users]
        }
      } catch(e) {
        console.error(e)
        this.users[idx].syncing = false
        this.users[idx].syncFailed = true
        this.users = [...this.users]
      }
    },

    async saveUsers() {
      if (this.selectedCount === 0 || this.hasIssuesInSelection) return
      this.saving = true
      try {
        const body = { users: Array.from(this.selectedIds) }
        if (this.isSuperadmin) {
          body.institutionId = this.selectedInstitution.id
        }
        const res = await SAVE_USERS(body)
        const saveData = await res.json()
        if (saveData?.data !== undefined || res.ok) {
          this.$emit('saved')
        }
      } catch(e) { console.error(e) }
      this.saving = false
    }
  },

  created() {
    if (this.isSuperadmin) {
      this.loadInstitutions()
    } else {
      this.step = 2
      this.loadDepartments()
    }
  }
}
</script>

<style scoped>
.drawer-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.35); z-index: 300;
  display: flex; justify-content: flex-end;
}
.drawer {
  background: white; width: 900px; max-width: 96vw; height: 100%;
  display: flex; flex-direction: column;
  box-shadow: -4px 0 24px rgba(0,0,0,0.12);
  animation: slideIn 0.25s ease;
}
@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }

.drawer-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 1.25rem 1.5rem; border-bottom: 1px solid #e8e8e8;
  background: #1565C0; color: white;
}
.drawer-title { margin: 0; font-size: 1.15rem; font-weight: 600; }
.drawer-subtitle { margin: 0.2rem 0 0; font-size: 0.82rem; opacity: 0.85; }
.btn-close {
  background: rgba(255,255,255,0.15); border: none; color: white;
  width: 30px; height: 30px; border-radius: 50%; cursor: pointer;
  font-size: 0.9rem; display: flex; align-items: center; justify-content: center;
}
.btn-close:hover { background: rgba(255,255,255,0.25); }

.steps-bar {
  display: flex; align-items: center; padding: 0.85rem 1.5rem;
  background: #f0f4ff; border-bottom: 1px solid #e0e8f8;
}
.step { display: flex; align-items: center; gap: 0.4rem; }
.step-num {
  width: 22px; height: 22px; border-radius: 50%; background: #bbb; color: white;
  font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; justify-content: center;
}
.step-active .step-num { background: #1565C0; }
.step-label { font-size: 0.8rem; color: #666; }
.step-active .step-label { color: #1565C0; font-weight: 500; }
.step-connector { flex: 1; height: 2px; background: #ddd; margin: 0 0.75rem; min-width: 24px; }

.drawer-body { flex: 1; overflow-y: auto; padding: 1.25rem 1.5rem; }

.step-section {
  background: #f8f9fc; border: 1px solid #e8eaf0;
  border-radius: 8px; padding: 1rem 1.25rem; margin-bottom: 1rem;
}
.step-disabled { opacity: 0.45; pointer-events: none; }

.step-header {
  display: flex; align-items: center; gap: 0.6rem;
  font-weight: 600; color: #1a2f4e; margin-bottom: 0.85rem;
  font-size: 0.9rem;
}
.step-badge {
  width: 22px; height: 22px; border-radius: 50%; background: #1565C0; color: white;
  font-size: 0.72rem; font-weight: 700; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.badge-auto { background: #e3f2fd; color: #1565C0; font-size: 0.72rem; padding: 2px 8px; border-radius: 10px; font-weight: 400; }
.badge-conectx { background: #1565C0; color: white; font-size: 0.7rem; padding: 2px 7px; border-radius: 10px; }

.form-select, .form-select-sm {
  width: 100%; border: 1px solid #ddd; border-radius: 6px;
  padding: 0.5rem 0.75rem; font-size: 0.875rem; background: white;
  font-family: 'Roboto', sans-serif; color: #333;
}
.form-select-sm { padding: 0.35rem 0.6rem; font-size: 0.82rem; }
.form-input-sm {
  width: 100%; border: 1px solid #ddd; border-radius: 6px;
  padding: 0.35rem 0.6rem; font-size: 0.82rem; font-family: 'Roboto', sans-serif;
}
.form-input-sm:focus, .form-select:focus, .form-select-sm:focus {
  outline: none; border-color: #1565C0;
}

.institution-display {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.4rem 0; font-size: 0.875rem; color: #333;
}
.form-group { margin-bottom: 0; }

.fetch-row { display: flex; flex-direction: column; gap: 0.75rem; }
.filters-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.filter-group { display: flex; flex-direction: column; gap: 4px; }
.filter-label { font-size: 0.78rem; font-weight: 500; color: #555; }
.search-input { position: relative; }

.btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; border-radius: 6px; border: none; cursor: pointer; font-size: 0.875rem; font-weight: 500; font-family: 'Roboto', sans-serif; }
.btn-primary { background: #1565C0; color: white; }
.btn-primary:hover:not(:disabled) { background: #1251a3; }
.btn-primary:disabled { opacity: 0.5; cursor: default; }
.btn-secondary { background: #f5f5f5; color: #333; border: 1px solid #ddd; }
.btn-fetch {
  align-self: flex-end; background: #1565C0; color: white;
  padding: 0.5rem 1.25rem; border-radius: 6px; border: none;
  cursor: pointer; font-size: 0.875rem; font-weight: 500;
  display: inline-flex; align-items: center; gap: 0.4rem;
  font-family: 'Roboto', sans-serif;
}
.btn-fetch:disabled { opacity: 0.5; cursor: default; }

.empty-fetch {
  margin-top: 0.75rem; padding: 0.75rem 1rem; background: #e8f5e9;
  border-radius: 6px; color: #2e7d32; font-size: 0.875rem;
}

.legend { display: flex; gap: 0.75rem; margin-left: auto; }
.legend-item { font-size: 0.75rem; font-weight: 400; }
.legend-item.new { color: #1565C0; }
.legend-item.existing { color: #888; }
.legend-item.warning { color: #f57c00; }

.select-all-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.5rem 0.75rem; background: #f0f4ff; border-radius: 6px;
  margin-bottom: 0.5rem;
}
.checkbox-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.85rem; }
.selected-count { font-size: 0.82rem; color: #1565C0; font-weight: 500; }

.users-table-wrap {
  max-height: 340px; overflow-y: auto;
  border: 1px solid #e8e8e8; border-radius: 6px;
}
.users-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
.users-table thead th {
  background: #1565C0; color: white; padding: 0.5rem 0.6rem;
  font-size: 0.72rem; font-weight: 600; letter-spacing: 0.03em;
  position: sticky; top: 0; text-align: left;
}
.th-check { width: 36px; }
.user-row td { padding: 0.45rem 0.6rem; border-bottom: 1px solid #f0f0f0; vertical-align: middle; }
.row-new { background: white; }
.row-new:hover td { background: #f0f4ff; }
.row-existing { background: #fafafa; color: #999; }
.row-warning { background: #fff8e1; }

.td-check { text-align: center; }

.badge-new { background: #e3f2fd; color: #1565C0; font-size: 0.7rem; padding: 2px 7px; border-radius: 10px; font-weight: 500; }
.badge-existing { background: #f5f5f5; color: #999; font-size: 0.7rem; padding: 2px 7px; border-radius: 10px; }

.email-cell.invalid, .phone-cell.invalid { color: #e53935; }
.issue-icon { color: #f57c00; margin-left: 4px; }
.issue-badge { background: #ffebee; color: #c62828; font-size: 0.68rem; padding: 1px 5px; border-radius: 8px; margin-left: 4px; }
.username-cell { display: flex; align-items: center; }

.btn-sync {
  background: none; border: 1px solid #ddd; border-radius: 4px;
  padding: 3px 7px; cursor: pointer; color: #1565C0; font-size: 0.9rem;
}
.btn-sync:hover { background: #e3f2fd; }
.btn-sync--failed {
  border-color: #e53935; color: #e53935;
}
.btn-sync--failed:hover { background: #ffebee; }
.sync-icon { display: inline-block; }
.spinning { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.issues-warning {
  margin-top: 0.75rem; padding: 0.75rem 1rem;
  background: #fff3e0; border: 1px solid #ffcc80;
  border-radius: 6px; color: #e65100; font-size: 0.82rem;
}

.drawer-footer {
  padding: 1rem 1.5rem; border-top: 1px solid #e8e8e8;
  display: flex; justify-content: flex-end; gap: 0.75rem;
  background: white;
}

.spinner {
  width: 14px; height: 14px; border: 2px solid rgba(0,0,0,0.15);
  border-top-color: #333; border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.spinner-white { border-color: rgba(255,255,255,0.3); border-top-color: white; }
</style>
