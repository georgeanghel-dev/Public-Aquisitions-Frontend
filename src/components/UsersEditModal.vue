<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <!-- Header -->
      <div class="modal-header">
        <div>
          <h2 class="modal-title">Editare utilizator</h2>
          <p class="modal-subtitle">
            {{ user.last_name }} {{ user.first_name }} / {{ user.id }} /
            {{ statusLabels[user.userStatus] || '-' }}
          </p>
        </div>
        <button class="btn-close" @click="$emit('close')">✕</button>
      </div>

      <!-- Tabs -->
      <div class="tabs-bar">
        <button :class="['tab', activeTab === 'details' ? 'tab-active' : '']" @click="activeTab = 'details'">
          Detalii utilizator
        </button>
        <button :class="['tab', activeTab === 'roles' ? 'tab-active' : '']" @click="activeTab = 'roles'">
          Roluri
        </button>
      </div>

      <!-- Tab: Detalii -->
      <div v-if="activeTab === 'details'" class="modal-body">
        <div class="form-group" v-if="isSuperadmin">
          <label class="form-label">Instituția</label>
          <div class="institution-readonly">{{ user.institution?.name || '—' }}</div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">ConectX ID</label>
            <div class="input-with-btn">
              <input type="number" v-model="form.conectxId" class="form-input" min="0" />
              <button class="btn-sync-field" :class="{ 'btn-sync-field--failed': syncFailed }" @click="syncUser" :disabled="syncing" :title="syncFailed ? 'Sincronizarea a eșuat. Apasă pentru a reîncerca.' : 'Sincronizare din ConectX'">
                <span :class="['sync-icon', syncing ? 'spinning' : '']">↻</span>
              </button>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Username</label>
            <input type="text" v-model="form.username" class="form-input form-readonly" disabled />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Nume</label>
            <input type="text" v-model="form.lastName" class="form-input form-readonly" disabled />
          </div>
          <div class="form-group">
            <label class="form-label">
              E-mail corespondență
              <span v-if="form.email" :class="['validate-icon', emailValid ? 'valid' : 'invalid']">
                {{ emailValid ? '✓' : '✕' }}
              </span>
            </label>
            <input type="text" v-model="form.email" class="form-input form-readonly" disabled />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Prenume</label>
            <input type="text" v-model="form.firstName" class="form-input form-readonly" disabled />
          </div>
          <div class="form-group">
            <label class="form-label">
              Telefon
              <span v-if="form.phone" class="validate-icon valid">✓</span>
            </label>
            <input type="text" v-model="form.phone" class="form-input form-readonly" disabled />
          </div>
        </div>
        <div class="reset-pwd-row">
          <div class="reset-pwd-col">
            <button class="btn btn-reset-pwd" @click="requestPasswordReset">
              Resetare parolă
            </button>
            <button
              v-if="user.userStatus === 'unconfirmed'"
              class="btn btn-resend-activation"
              :disabled="resendingActivation"
              @click="resendActivation"
            >
              <span v-if="resendingActivation" class="btn-spinner btn-spinner--dark"></span>
              <span v-else>Activare cont</span>
            </button>
          </div>
          <div class="reset-feedback-col">
            <div v-if="resendActivationStatus === 'success'" class="resend-feedback resend-feedback--success">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              {{ resendActivationMessage.success }}
            </div>
            <div v-else-if="resendActivationStatus === 'error'" class="resend-feedback resend-feedback--error">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {{ resendActivationMessage.error }}
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Roluri -->
      <div v-if="activeTab === 'roles'" class="modal-body">
        <!-- Adaugă rol -->
        <div class="add-role-section">
          <div class="add-role-row">
            <div class="form-group-inline">
              <label class="form-label">Alege rolul</label>
              <select v-model="newRole.role" class="form-select" @change="newRole.department = ''">
                <option value="">— Selectează rolul —</option>
                <option v-for="r in availableRoles" :key="r.value" :value="r.value">{{ r.label }}</option>
              </select>
            </div>
            <div class="form-group-inline">
              <label class="form-label">Alege structura organizatorică</label>
              <select v-model="newRole.department" class="form-select" :disabled="!needsDepartment">
                <option value="">— Selectează structura —</option>
                <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option>
              </select>
            </div>
          </div>
          <div class="add-role-footer">
            <span v-if="roleAlreadyExists" class="role-duplicate-msg">⚠ Acest rol este deja adăugat</span>
            <span v-else></span>
            <button class="btn btn-add-role" :disabled="!canAddRole" @click="addRole">
              + Adaugă Rol
            </button>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Tabel roluri -->
        <div class="roles-table-wrap">
          <div v-if="roles.length === 0" class="empty-roles">
            <span>👤</span>
            <p>Adaugă roluri utilizatorului</p>
          </div>
          <table v-else class="roles-table">
            <thead>
              <tr>
                <th>ROL</th>
                <th>STRUCTURĂ ORGANIZATORICĂ</th>
                <th>STATUS</th>
                <th>EMAIL ACTIVARE</th>
                <th style="text-align:right; padding-right: 1rem;">ACȚIUNI</th>
              </tr>
            </thead>
            <tbody>
              <template v-if="isSuperadmin">
                <template v-for="group in roleGroups" :key="group.institutionName">
                  <tr class="institution-row">
                    <td colspan="5">
                      <div class="institution-separator">
                        <span class="institution-name">{{ group.institutionName }}</span>
                        <div class="separator-line"></div>
                      </div>
                    </td>
                  </tr>
                  <tr v-for="role in group.roles" :key="role.id"
                    :class="['role-row', role._state === 2 ? 'row-blocked' : '']">
                    <td>{{ roleLabels[role.role] || role.role }}</td>
                    <td>{{ role.departmentName || '—' }}</td>
                    <td>
                      <span :class="['role-status', `role-status-${role.status}`]">
                        <span class="status-dot"></span>
                        {{ roleStatusLabels[role.status] || role.status }}
                      </span>
                      <span v-if="role._isNewStatus" class="modified-indicator" title="Status modificat"></span>
                    </td>
                    <td>
                      <span v-if="role._emailStatus === 'sent'" class="email-badge email-badge--sent">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        {{ role._emailSentAt || 'Trimis' }}
                      </span>
                      <span v-else-if="role._emailStatus === 'failed'" class="email-badge email-badge--failed">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        Eșuat
                      </span>
                      <span v-else class="email-badge email-badge--none">—</span>
                    </td>
                    <td style="text-align:right; padding-right: 1rem;">
                      <div class="role-action-btns">
                        <span v-if="role._state === true" class="inline-spin">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1565C0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                        </span>
                        <span v-else-if="role._state === 2" class="btn-role-blocked"
                          title="Rolul nu poate fi modificat — participă în avizare activă">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E53935" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </span>
                        <template v-else>
                          <button v-if="role.status === 'disabled'" class="btn-role-action btn-activate"
                            @click="activateRole(role)" title="Activează rolul">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          </button>
                          <template v-else-if="['active','reset'].includes(role.status)">
                            <button v-if="roles.length > 1" class="btn-role-action btn-deactivate"
                              @click="initiateDeactivate(role)" title="Dezactivează rolul">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                            </button>
                            <button v-else class="btn-role-action btn-disabled-action"
                              title="Ultimul rol poate fi dezactivat odată cu utilizatorul" disabled>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                            </button>
                          </template>
                          <button v-if="role.status === 'unconfirmed'" class="btn-role-action btn-resend"
                            @click="resendRoleEmail(role)" title="Retrimite confirmare email">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                          </button>
                          <button class="btn-role-action btn-role-delete"
                            @click="initiateDelete(role)" title="Șterge rol">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E53935" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                          </button>
                        </template>
                      </div>
                    </td>
                  </tr>
                </template>
              </template>
              <template v-else>
                <tr v-for="role in roles" :key="role.id"
                  :class="['role-row', role._state === 2 ? 'row-blocked' : '']">
                  <td>{{ roleLabels[role.role] || role.role }}</td>
                  <td>{{ role.departmentName || '—' }}</td>
                  <td>
                    <span :class="['role-status', `role-status-${role.status}`]">
                      <span class="status-dot"></span>
                      {{ roleStatusLabels[role.status] || role.status }}
                    </span>
                    <span v-if="role._isNewStatus" class="modified-indicator" title="Status modificat"></span>
                  </td>
                  <td>
                    <span v-if="role._emailStatus === 'sent'" class="email-badge email-badge--sent">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      {{ role._emailSentAt || 'Trimis' }}
                    </span>
                    <span v-else-if="role._emailStatus === 'failed'" class="email-badge email-badge--failed">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      Eșuat
                    </span>
                    <span v-else class="email-badge email-badge--none">—</span>
                  </td>
                  <td style="text-align:right; padding-right: 1rem;">
                    <div class="role-action-btns">
                      <span v-if="role._state === true" class="inline-spin">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1565C0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                      </span>
                      <span v-else-if="role._state === 2" class="btn-role-blocked"
                        title="Rolul nu poate fi modificat — participă în avizare activă">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E53935" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </span>
                      <template v-else>
                        <button v-if="role.status === 'disabled'" class="btn-role-action btn-activate"
                          @click="activateRole(role)" title="Activează rolul">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </button>
                        <template v-else-if="['active','reset'].includes(role.status)">
                          <button v-if="roles.length > 1" class="btn-role-action btn-deactivate"
                            @click="initiateDeactivate(role)" title="Dezactivează rolul">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                          </button>
                          <button v-else class="btn-role-action btn-disabled-action"
                            title="Ultimul rol poate fi dezactivat odată cu utilizatorul" disabled>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                          </button>
                        </template>
                        <button v-if="role.status === 'unconfirmed'" class="btn-role-action btn-resend"
                          @click="resendRoleEmail(role)" title="Retrimite confirmare email">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                        </button>
                        <button class="btn-role-action btn-role-delete"
                          @click="initiateDelete(role)" title="Șterge rol">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E53935" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                        </button>
                      </template>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('close')">Închide</button>
      </div>
    </div>

    <!-- Modal intern: motiv obligatoriu (dezactivare / ștergere / activare) -->
    <div v-if="reasonModal" class="inner-modal-overlay" @click.self="closeReasonModal">
      <div class="reason-modal">
        <h3 class="reason-modal-title">{{ reasonModal.title }}</h3>
        <p class="reason-modal-subtitle">{{ reasonModal.subtitle }}</p>
        <div v-if="reasonModal.warning" class="reason-warning">
          <span>⚠</span> {{ reasonModal.warning }}
        </div>
        <div class="form-group">
          <label class="form-label">{{ reasonModal.reasonLabel }}</label>
          <textarea v-model="reasonModal.reason" class="form-textarea" rows="3"
            :placeholder="reasonModal.reasonLabel + '...'"></textarea>
        </div>
        <div class="reason-modal-actions">
          <button class="btn btn-secondary" @click="closeReasonModal">Anulează</button>
          <button :class="['btn', reasonModal.type === 'danger' ? 'btn-danger' : 'btn-success']"
            :disabled="reasonModal.requireReason && !reasonModal.reason.trim()"
            @click="reasonModal.onConfirm(reasonModal.reason)">
            {{ reasonModal.confirmText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  USERS_ROLES, USERS_ADD_ROLE, USERS_DELETE_ROLE,
  USERS_CHECK_ROLE, VERIFY_DELETE_ROLE,
  ACTIVATE_ROLE, EDIT_ROLE, RESEND_ROLE,
  DEPARTMENTS_PAGINATED,
  USER_SYNC, RESEND_ACTIVATE_ACCOUNT,
  REQUEST_PASSWORD_RESET
} from '@/api.js'

const ROLE_LABELS = {
  admin_institutie: 'Admin instituție',
  responsabil_achizitii: 'Responsabil achiziții',
  supervizor_achizitii: 'Supervizor achiziții',
  responsabil_achizitii_extern: 'Responsabil achiziții extern',
  responsabil_buget: 'Responsabil buget',
  sef_institutie: 'Șef instituție',
  supervisor: 'Supervizor',
  angajat: 'Angajat'
}

const DEPARTMENT_ROLES = ['sef_institutie', 'supervisor', 'angajat']

// Cooldown retrimite email — 60 secunde per roleId
const emailCooldown = {}
const checkEmailCooldown = (roleId) => {
  const last = emailCooldown[roleId]
  if (!last) return true
  const remaining = 60000 - (Date.now() - last)
  return remaining > 0 ? remaining : true
}
const setEmailCooldown = (roleId) => { emailCooldown[roleId] = Date.now() }

export default {
  name: 'UsersEditModal',
  emits: ['close', 'saved'],
  props: {
    user: { type: Object, required: true }
  },

  data() {
    return {
      activeTab: 'details',
      syncing: false,
      syncFailed: false,
      resendingActivation: false,
      resendActivationStatus: null,
      lastAction: null,
      departments: [],
      roles: [],
      reasonModal: null,
      form: {
        institutionId: this.user.institution?.id || '',
        conectxId: this.user.conectxid || '',
        username: this.user.email || '',
        firstName: this.user.first_name || '',
        lastName: this.user.last_name || '',
        email: this.user.emailForCommunication || '',
        phone: this.user.phone || ''
      },
      newRole: { role: '', department: '' },
      statusLabels: { active: 'Activ', disabled: 'Dezactivat', reset: 'Activ', unconfirmed: 'Neconfirmat' },
      roleLabels: ROLE_LABELS,
      roleStatusLabels: { active: 'Activat', disabled: 'Dezactivat', unconfirmed: 'Neconfirmat', in_process: 'În procesare' }
    }
  },

  computed: {
    isSuperadmin() { return window.$getRoleAll?.()?.role === 'superadmin' },
    resendActivationMessage() {
      if (this.lastAction === 'reset') return {
        success: 'Emailul pentru resetare parolă a fost trimis cu succes.',
        error: 'Emailul pentru resetare parolă nu a putut fi expediat.'
      }
      return {
        success: 'Emailul pentru activarea contului a fost trimis cu succes.',
        error: 'Emailul pentru activarea contului nu a putut fi expediat.'
      }
    },
    emailValid() { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email || '') },
    availableRoles() {
      return Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }))
    },
    needsDepartment() { return DEPARTMENT_ROLES.includes(this.newRole.role) },
    canAddRole() {
      if (!this.newRole.role) return false
      if (this.needsDepartment && !this.newRole.department) return false
      if (this.roleAlreadyExists) return false
      return true
    },
    roleAlreadyExists() {
      if (!this.newRole.role) return false
      return this.roles.some(r =>
        r.role === this.newRole.role &&
        (r.departmentId || null) === (this.newRole.department || null)
      )
    },
    roleGroups() {
      const groups = {}
      this.roles.forEach(r => {
        const key = r.institutionName || 'Fără instituție'
        if (!groups[key]) groups[key] = { institutionName: key, roles: [] }
        groups[key].roles.push(r)
      })
      return Object.values(groups)
    }
  },

  methods: {
    // ── Detalii ──────────────────────────────────────────────────
    async syncUser() {
      this.syncing = true
      this.syncFailed = false
      try {
        const conectxId = Number(this.form.conectxId)
        if (!conectxId) { this.syncFailed = true; this.syncing = false; return }
        const body = { conectxId }
        const instId = this.user.institution?.id || window.$getRoleAll?.()?.institutionId
        if (instId) body.institutionId = Number(instId)
        const res = await USER_SYNC(body)
        const data = await res.json()
        if (!res.ok) { this.syncFailed = true; this.syncing = false; return }
        const d = data?.data || data
        if (d && (d.first_name || d.last_name || d.username)) {
          this.form.username = d.username || this.form.username
          this.form.firstName = d.first_name || this.form.firstName
          this.form.lastName = d.last_name || this.form.lastName
          this.form.email = d.email || this.form.email
          this.form.phone = d.phone || this.form.phone
          this.syncFailed = false
        } else {
          this.syncFailed = true
        }
      } catch(e) {
        console.error(e)
        this.syncFailed = true
      }
      this.syncing = false
    },
    async requestPasswordReset() {
      if (!this.form.username) return
      this.lastAction = 'reset'
      this.resendActivationStatus = null
      try {
        const res = await REQUEST_PASSWORD_RESET(this.form.username)
        this.resendActivationStatus = res.ok ? 'success' : 'error'
      } catch(e) {
        console.error(e)
        this.resendActivationStatus = 'error'
      }
    },
    async resendActivation() {
      this.resendingActivation = true
      this.resendActivationStatus = null
      this.lastAction = 'activate'
      try {
        const res = await RESEND_ACTIVATE_ACCOUNT(this.user.uuid)
        this.resendActivationStatus = res.ok ? 'success' : 'error'
      } catch(e) {
        console.error(e)
        this.resendActivationStatus = 'error'
      } finally {
        this.resendingActivation = false
      }
    },
    // ── Roluri - încărcare ────────────────────────────────────────
    async loadRoles() {
      try {
        const res = await USERS_ROLES(this.user.uuid)
        const rolesData = await res.json()
        if (Array.isArray(rolesData?.data?.result)) {
          // Păstrăm statusul email-ului pentru rolurile deja existente
          const prevRoles = this.roles
          this.roles = rolesData.data.result.map(r => {
            const prev = prevRoles.find(p => p.id === r.id)
            return {
              id: r.id,
              role: r.role,
              departmentId: r.department?.id || null,
              departmentName: r.department?.name || '',
              institutionName: r.institution?.name || '',
              status: r.userRoleStatus || 'active',
              _state: false,
              _isNewStatus: false,
              _emailStatus: prev?._emailStatus ?? null,   // null | 'sent' | 'failed'
              _emailSentAt: prev?._emailSentAt ?? null    // timestamp string
            }
          })
        }
      } catch(e) { console.error(e) }
    },

    // ── Adaugă rol ────────────────────────────────────────────────
    async addRole() {
      if (!this.canAddRole) return
      try {
        const res = await USERS_ADD_ROLE({
          user: this.user.uuid,
          institution: this.user.institution?.id || undefined,
          role: this.newRole.role,
          department: this.newRole.department || undefined
        })
        const data = await res.json()
        const newRoleId = data?.data?.result?.id
        const sentAt = new Date().toLocaleString('ro-RO', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })
        this.newRole = { role: '', department: '' }
        await this.loadRoles()
        if (newRoleId) {
          const idx = this.roles.findIndex(r => r.id === newRoleId)
          if (idx !== -1) {
            this.roles[idx]._emailStatus = res.ok ? 'sent' : 'failed'
            this.roles[idx]._emailSentAt = res.ok ? sentAt : null
          }
        }
      } catch(e) {
        console.error(e)
      }
    },

    // ── BUTON 1A: Activează rol ───────────────────────────────────
    // Fără verificare prealabilă. Modal cu câmp Observații (opțional).
    activateRole(role) {
      this.reasonModal = {
        title: 'Activează rol',
        subtitle: `${this.roleLabels[role.role] || role.role}${role.departmentName ? ' — ' + role.departmentName : ''}`,
        type: 'success',
        confirmText: 'Activează',
        reasonLabel: 'Observații',
        requireReason: false,
        reason: '',
        warning: null,
        onConfirm: async (reason) => {
          this.closeReasonModal()
          const idx = this.roles.findIndex(r => r.id === role.id)
          if (idx === -1) return
          this.roles[idx]._state = true
          try {
            await ACTIVATE_ROLE(role.id, reason || ' ')
            this.roles[idx].status = 'active'
            this.roles[idx]._isNewStatus = true
          } catch(e) { console.error(e) }
          this.roles[idx]._state = false
        }
      }
    },

    // ── BUTON 1B: Dezactivează rol ────────────────────────────────
    // Verifică mai întâi USERS_CHECK_ROLE:
    //   Fără dependențe  → modal motiv direct
    //   Are dependențe dar NU avizare → avertisment + confirmare + modal motiv
    //   Este în avizare  → _state = 2, apare ✕ roșu blocat
    initiateDeactivate(role) {
      const idx = this.roles.findIndex(r => r.id === role.id)
      if (idx === -1) return
      this.roles[idx]._state = true  // spinner în timp ce verificăm

      USERS_CHECK_ROLE(role.id)
        .then(res => res.json())
        .then(checkData => {
          this.roles[idx]._state = false
          if (!Array.isArray(checkData?.data?.result)) { console.error('Verificare eșuată'); return }

          const results = checkData.data.result
          const isInAvizare = results.some(e => e.status === 'avizo')
          const hasDependencies = results.length > 0

          if (isInAvizare) {
            // Blocat complet — butonul devine ✕ roșu dezactivat
            this.roles[idx]._state = 2
            return
          }

          this.reasonModal = {
            title: 'Dezactivează rol',
            subtitle: `${this.roleLabels[role.role] || role.role}${role.departmentName ? ' — ' + role.departmentName : ''}`,
            type: 'danger',
            confirmText: 'Dezactivează',
            reasonLabel: 'Motivul dezactivării',
            requireReason: true,
            reason: '',
            // Avertisment suplimentar dacă are dependențe (dar nu avizare activă)
            warning: hasDependencies
              ? 'Rolul selectat poate fi aprobatorul unor necesități. Dezactivarea va afecta procesele în curs.'
              : null,
            onConfirm: async (reason) => {
              this.closeReasonModal()
              this.roles[idx]._state = true
              try {
                await EDIT_ROLE(role.id, { userRoleStatus: 'disabled', reason })
                this.roles[idx].status = 'disabled'
                this.roles[idx]._isNewStatus = true
              } catch(e) { console.error(e) }
              this.roles[idx]._state = false
            }
          }
        })
        .catch(() => { this.roles[idx]._state = false; console.error('Verificare eșuată') })
    },

    // ── BUTON 2: Șterge rol ───────────────────────────────────────
    // Verifică mai întâi VERIFY_DELETE_ROLE.
    // Dacă ok → modal cu câmp Motiv OBLIGATORIU → USERS_DELETE_ROLE.
    initiateDelete(role) {
      const idx = this.roles.findIndex(r => r.id === role.id)
      if (idx === -1) return
      this.roles[idx]._state = true

      VERIFY_DELETE_ROLE(role.id)
        .then(res => {
          this.roles[idx]._state = false
          // Dacă backend returnează eroare, ștergerea nu e permisă
          if (res?.meta?.HttpStatusCode && String(res.meta.HttpStatusCode)[0] !== '2') {
            console.error(res.response || 'Ștergerea nu este permisă')
            return
          }
          this.reasonModal = {
            title: 'Șterge rol',
            subtitle: `Rol: ${this.roleLabels[role.role] || role.role}${role.departmentName ? ' — ' + role.departmentName : ''}`,
            type: 'danger',
            confirmText: 'Șterge',
            reasonLabel: 'Motivul',
            requireReason: true,  // câmp obligatoriu
            reason: '',
            warning: null,
            onConfirm: async (reason) => {
              if (!reason.trim()) return
              this.closeReasonModal()
              this.roles[idx]._state = true
              try {
                await USERS_DELETE_ROLE(role.id, reason)
                this.roles = this.roles.filter(r => r.id !== role.id)
              } catch(e) { console.error(e) }
            }
          }
        })
        .catch(() => { this.roles[idx]._state = false })
    },

    // ── BUTON 3: Retrimite email confirmare ───────────────────────
    // Afișat doar dacă status = 'unconfirmed'.
    // Are cooldown 60 secunde — dacă se retrimite prea repede, afișează câte secunde rămân.
    async resendRoleEmail(role) {
      const cooldown = checkEmailCooldown(role.id)
      if (cooldown !== true) {
        const seconds = Math.ceil(cooldown / 1000)
        alert(`Până la următoarea trimitere au mai rămas ${seconds} secunde.`)
        return
      }
      const idx = this.roles.findIndex(r => r.id === role.id)
      if (idx === -1) return
      this.roles[idx]._state = true
      try {
        const res = await RESEND_ROLE(role.id)
        const sentAt = new Date().toLocaleString('ro-RO', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })
        this.roles[idx]._state = false
        if (res.ok) {
          setEmailCooldown(role.id)
          this.roles[idx]._emailStatus = 'sent'
          this.roles[idx]._emailSentAt = sentAt
        } else {
          this.roles[idx]._emailStatus = 'failed'
          this.roles[idx]._emailSentAt = null
        }
        this.roles = [...this.roles]
      } catch {
        this.roles[idx]._state = false
        this.roles[idx]._emailStatus = 'failed'
        this.roles[idx]._emailSentAt = null
        this.roles = [...this.roles]
      }
    },

    closeReasonModal() { this.reasonModal = null }
  },

  created() {
    this.loadRoles()
    const instId = this.user.institution?.id || window.$getRoleAll?.()?.institutionId
    if (instId) {
      DEPARTMENTS_PAGINATED(1, 500, `institution.id=${instId}`).then(res => res.json()).then(d => {
        if (Array.isArray(d?.data?.result)) this.departments = d.data.result
      })
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center; z-index: 300;
}
.modal {
  background: white; border-radius: 10px; width: 820px; max-width: 96vw;
  max-height: 92vh; display: flex; flex-direction: column;
  box-shadow: 0 8px 40px rgba(0,0,0,0.18); animation: fadeIn 0.18s ease; position: relative;
}
@keyframes fadeIn { from { opacity:0; transform:scale(0.97); } to { opacity:1; transform:scale(1); } }

.modal-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 1.25rem 1.5rem; border-bottom: 1px solid #e8e8e8;
}
.modal-title { margin: 0; font-size: 1.15rem; font-weight: 600; color: #1a2f4e; }
.modal-subtitle { margin: 0.2rem 0 0; font-size: 0.85rem; color: #888; }
.btn-close {
  background: #f5f5f5; border: none; width: 30px; height: 30px; border-radius: 50%;
  cursor: pointer; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; color: #555;
}
.btn-close:hover { background: #fee; color: #e53935; }

.tabs-bar { display: flex; border-bottom: 2px solid #e8e8e8; padding: 0 1.5rem; }
.tab {
  padding: 0.7rem 1.25rem; background: none; border: none; cursor: pointer;
  font-size: 0.875rem; color: #777; border-bottom: 3px solid transparent;
  margin-bottom: -2px; font-family: 'Roboto', sans-serif; font-weight: 500;
}
.tab:hover { color: #1565C0; }
.tab-active { color: #1565C0; border-bottom-color: #1565C0; }

.modal-body { padding: 1.25rem 1.5rem; overflow-y: auto; flex: 1; scrollbar-gutter: stable; }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 4px; margin-bottom: 1rem; }
.form-group-inline { display: flex; flex-direction: column; gap: 4px; }
.form-label { font-size: 0.82rem; font-weight: 500; color: #444; }
.form-input {
  border: 1px solid #ddd; border-radius: 6px; padding: 0.5rem 0.75rem;
  font-size: 0.875rem; font-family: 'Roboto', sans-serif; color: #333;
}
.form-input:focus { outline: none; border-color: #1565C0; }
.form-readonly { background: #f8f9fc; color: #555; }
.institution-readonly {
  padding: 0.5rem 0.75rem; background: #f8f9fc; border: 1px solid #ddd;
  border-radius: 6px; font-size: 0.875rem; color: #555;
}
.form-select {
  border: 1px solid #ddd; border-radius: 6px; padding: 0.5rem 0.75rem;
  font-size: 0.875rem; font-family: 'Roboto', sans-serif; color: #333; background: white;
}
.form-select:focus { outline: none; border-color: #1565C0; }
.form-select:disabled { background: #f8f9fc; color: #aaa; }

.input-with-btn { display: flex; gap: 6px; align-items: center; }
.input-with-btn .form-input { flex: 1; }
.btn-sync-field {
  background: #1565C0; border: none; color: white; border-radius: 6px;
  width: 36px; height: 36px; cursor: pointer; font-size: 1rem; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.btn-sync-field:hover { background: #1251a3; }
.btn-sync-field--failed { background: #e53935; }
.btn-sync-field--failed:hover { background: #c62828; }
.validate-icon { margin-left: 4px; font-size: 0.8rem; font-weight: 600; }
.validate-icon.valid { color: #43a047; }
.validate-icon.invalid { color: #e53935; }

.reset-pwd-row {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 1rem; margin-top: 0.25rem; align-items: center;
}
.reset-pwd-col { display: flex; flex-direction: row; gap: 0.5rem; }
.reset-feedback-col { display: flex; align-items: center; }
.btn-reset-pwd {
  background: #1565C0; color: white; border: none; border-radius: 6px;
  padding: 0.45rem 1rem; cursor: pointer; font-size: 0.85rem;
  font-family: 'Roboto', sans-serif; display: flex; align-items: center;
  justify-content: center; flex: 1;
}
.btn-reset-pwd:hover { background: #1251a3; }
.resend-activation-wrap { display: flex; flex-direction: column; gap: 6px; }
.btn-resend-activation {
  background: #f57c00; color: white; border: none; border-radius: 6px;
  padding: 0.45rem 1rem; cursor: pointer; font-size: 0.85rem;
  font-family: 'Roboto', sans-serif; display: flex; align-items: center;
  justify-content: center; flex: 1;
}
.btn-resend-activation:hover:not(:disabled) { background: #e65100; }
.btn-resend-activation:disabled { opacity: 0.7; cursor: not-allowed; }
.btn-spinner--dark {
  width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite;
  display: inline-block;
}
.resend-feedback {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; font-weight: 500; padding: 8px 12px;
  border-radius: 6px; width: 100%; box-sizing: border-box;
}
.resend-feedback--success { background: #E8F5E9; color: #2E7D32; border: 1px solid #C8E6C9; }
.resend-feedback--error { background: #FFEBEE; color: #C62828; border: 1px solid #FFCDD2; }

.add-role-section {
  background: #f8f9fc; border: 1px solid #e8eaf0; border-radius: 8px;
  padding: 0.85rem 1rem; margin-bottom: 1rem;
}
.add-role-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 0.65rem; }
.add-role-footer { display: flex; justify-content: space-between; align-items: center; }
.role-duplicate-msg { font-size: 0.82rem; color: #e53935; font-weight: 500; }

.btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; border-radius: 6px; border: none; cursor: pointer; font-size: 0.875rem; font-weight: 500; font-family: 'Roboto', sans-serif; }
.btn-primary { background: #1565C0; color: white; }
.btn-primary:hover:not(:disabled) { background: #1251a3; }
.btn-primary:disabled { opacity: 0.5; cursor: default; }
.btn-secondary { background: #f5f5f5; color: #333; border: 1px solid #ddd; }
.btn-danger { background: #e53935; color: white; }
.btn-success { background: #43a047; color: white; }
.btn-add-role {
  background: #1565C0; color: white; border: none; border-radius: 6px;
  padding: 0.45rem 0.85rem; cursor: pointer; font-size: 0.85rem;
  font-family: 'Roboto', sans-serif; white-space: nowrap;
}
.btn-add-role:disabled { opacity: 0.4; cursor: default; }

.divider { border-top: 1px solid #e8e8e8; margin-bottom: 1rem; }

.roles-table-wrap { border: 1px solid #e8e8e8; border-radius: 8px; overflow: hidden; }
.empty-roles {
  display: flex; flex-direction: column; align-items: center;
  padding: 2.5rem; color: #bbb; gap: 0.5rem; text-align: center;
}
.empty-roles span { font-size: 2.5rem; }
.empty-roles p { margin: 0; font-size: 0.875rem; }

.roles-table { width: 100%; border-collapse: collapse; }
.roles-table thead th {
  background: #1565C0; color: white; padding: 0.55rem 0.75rem;
  font-size: 0.72rem; font-weight: 600; letter-spacing: 0.03em; text-align: left;
}
.role-row td { padding: 0.55rem 0.75rem; font-size: 0.85rem; border-bottom: 1px solid #f0f0f0; vertical-align: middle; }
.role-row:last-child td { border-bottom: none; }
.role-row:nth-child(even) { background: #fafbfd; }
.row-blocked { opacity: 0.6; }

.institution-row td { padding: 0.35rem 0.75rem; }
.institution-separator { display: flex; align-items: center; gap: 0.75rem; }
.institution-name { font-weight: 600; font-size: 0.82rem; color: #444; white-space: nowrap; }
.separator-line { flex: 1; border-top: 1px dashed #ccc; }

.role-status { display: inline-flex; align-items: center; gap: 5px; font-size: 0.8rem; font-weight: 500; }
.status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.role-status-active { color: #2e7d32; }
.role-status-active .status-dot { background: #43a047; }
.role-status-disabled { color: #c62828; }
.role-status-disabled .status-dot { background: #e53935; }
.role-status-unconfirmed { color: #f57f17; }
.role-status-unconfirmed .status-dot { background: #fbc02d; }
.role-status-in_process { color: #888; font-style: italic; }
.role-status-in_process .status-dot { background: #bbb; }

.modified-indicator {
  display: inline-block; width: 8px; height: 8px; border-radius: 50%;
  background: #1565C0; margin-left: 5px; vertical-align: middle;
}

.email-badge {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11px; font-weight: 600; padding: 2px 7px; border-radius: 4px;
}
.email-badge--sent { background: #E8F5E9; color: #2E7D32; }
.email-badge--failed { background: #FFEBEE; color: #C62828; }
.email-badge--none { color: #BDBDBD; font-weight: 400; }

.role-action-btns { display: flex; align-items: center; gap: 4px; justify-content: flex-end; }
.btn-role-action {
  width: 28px; height: 28px; border: none; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background 0.15s; background: transparent !important;
  flex-shrink: 0; padding: 0;
}
.btn-activate { color: #2E7D32 !important; }
.btn-activate:hover { background: #E8F5E9 !important; }
.btn-deactivate { color: #E53935 !important; }
.btn-deactivate:hover { background: #FFEBEE !important; }
.btn-resend { color: #1565C0 !important; }
.btn-resend:hover { background: #E3F2FD !important; }
.btn-role-delete { color: #E53935 !important; }
.btn-role-delete:hover { background: #FFEBEE !important; }
.btn-disabled-action { color: #BDBDBD !important; cursor: not-allowed; background: transparent !important; }
.btn-role-blocked { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; opacity: 0.5; cursor: default; }
.inline-spin { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; animation: spin 1s linear infinite; }

@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.spinning { animation: spin 1s linear infinite; display: inline-block; }
.sync-icon { display: inline-block; }

/* Modal intern motiv */
.inner-modal-overlay {
  position: absolute; inset: 0; background: rgba(0,0,0,0.35);
  display: flex; align-items: center; justify-content: center;
  border-radius: 10px; z-index: 10;
}
.reason-modal {
  background: white; border-radius: 8px; padding: 1.5rem;
  width: 440px; max-width: 90%; box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}
.reason-modal-title { margin: 0 0 0.25rem; font-size: 1rem; font-weight: 600; color: #1a2f4e; }
.reason-modal-subtitle { margin: 0 0 0.85rem; font-size: 0.85rem; color: #777; }
.reason-warning {
  background: #fff3e0; border: 1px solid #ffcc80; border-radius: 6px;
  padding: 0.6rem 0.85rem; margin-bottom: 0.85rem; font-size: 0.82rem; color: #e65100;
  display: flex; gap: 0.4rem;
}
.form-textarea {
  width: 100%; border: 1px solid #ddd; border-radius: 6px; padding: 0.5rem 0.75rem;
  font-family: 'Roboto', sans-serif; font-size: 0.875rem; resize: vertical; box-sizing: border-box;
}
.form-textarea:focus { outline: none; border-color: #1565C0; }
.reason-modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem; }

.modal-footer {
  display: flex; justify-content: flex-end; gap: 0.75rem;
  padding: 1rem 1.5rem; border-top: 1px solid #e8e8e8;
}
.spinner {
  width: 14px; height: 14px; border: 2px solid rgba(0,0,0,0.15);
  border-top-color: #333; border-radius: 50%; animation: spin 0.8s linear infinite;
}
.spinner-white { border-color: rgba(255,255,255,0.3); border-top-color: white; }
</style>
