<template>
  <div class="page">

    <!-- Breadcrumb -->
    <div class="page__breadcrumb">
      <router-link to="/">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
      </router-link>
      <span class="breadcrumb-sep">›</span>
      <span class="breadcrumb-current">{{ avizoMode ? 'Avizare & Aprobare' : 'Propuneri de nevoi' }}</span>
    </div>

    <!-- Titlu -->
    <div class="page__titlebar">
      <h1 class="page__title">{{ avizoMode ? 'Avizare & Aprobare' : 'Propuneri de nevoi' }}</h1>
      <div class="titlebar-actions">
        <!-- Cos nevoi conexate -->
        <div v-if="PERMISIONS.conexe" class="cart-wrapper" ref="cartWrapRef">
          <button class="cart-btn" :class="{ 'cart-btn--active': cartVisible }" @click="cartVisible = !cartVisible">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            <span class="cart-badge">{{ cartData.length }}</span>
          </button>
          <transition name="cart-drop">
            <div v-if="cartVisible" class="cart-dropdown">
              <div class="cart-dropdown__header">Nevoi selectate</div>
              <div v-if="cartData.length < 2" class="cart-empty">Selectați minim 2 nevoi</div>
              <template v-else>
                <ul class="cart-list">
                  <li v-for="item in cartData" :key="item.id" class="cart-item">
                    <button class="cart-remove" @click.stop="removeFromCart(item.id)">✕</button>
                    <div class="cart-item__info">
                      <div class="cart-item__name">{{ item.productName }}</div>
                      <span :class="item.social === true ? 'badge-social' : 'badge-nonsocial'">{{ item.social === true ? 'Social' : 'Non-social' }}</span>
                    </div>
                  </li>
                </ul>
                <button class="cart-create-btn" :disabled="cartLoading || cartTypeError" @click="createConexedNeed">
                  <span v-if="cartLoading">Se determină tipul...</span>
                  <span v-else-if="cartTypeError">Eroare tip nevoie</span>
                  <span v-else>Creează nevoie {{ cartTypeLabel }}</span>
                </button>
              </template>
            </div>
          </transition>
        </div>
        <button v-if="PERMISIONS.create && !avizoMode" class="btn btn-primary" @click="openAddModal">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Adaugă
        </button>
      </div>
    </div>

    <div class="page__content">
      <div v-if="!PERMISIONS.list" class="access-denied">
        <p>Acces interzis</p>
      </div>
      <div v-else class="table-card">
        <div class="table-scroll-wrapper">
          <table class="needs-table">
            <thead>
              <tr class="tr-header">
                <th v-if="PERMISIONS.conexe" class="col-chk"></th>
                <th class="col-nr">NR.</th>
                <th v-if="showInstName">DENUMIRE INSTITUȚIE</th>
                <th v-if="showDepName">DENUMIRE STRUCTURĂ ORGANIZATORICĂ</th>
                <th>NUME PRENUME SOLICITANT / ID CONECTX</th>
                <th>DENUMIRE PROPUNERE</th>
                <th>CATEGORIE ACHIZIȚIE</th>
                <th>DATA ȘI ORA CREĂRII</th>
                <th>CODUL CPV</th>
                <th>UNITATEA DE MĂSURĂ</th>
                <th>CANTITATEA</th>
                <th>VALOAREA ESTIMATĂ BUCATĂ (FĂRĂ TVA)</th>
                <th>COTĂ TVA(%)</th>
                <th>VALOAREA ESTIMATĂ BUCATĂ (CU TVA)</th>
                <th>VALOAREA ESTIMATĂ TOTALĂ</th>
                <th>CARACTER NEVOIE</th>
                <!-- Status flux avizare/aprobare -->
                <th v-if="showAvizoColumn" class="col-icon col-sticky" title="Status flux avizare/aprobare">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                </th>
                <!-- Status referat -->
                <th class="col-icon col-sticky">
                  <div class="th-icon-wrap">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                    <div class="th-filter-wrap">
                      <button class="th-fbtn" :class="{ active: statusFilter !== null }" @click.stop="showStatusFilter = !showStatusFilter">▼</button>
                      <div v-if="showStatusFilter" class="th-fdropdown">
                        <button v-for="opt in referateStatusOptions" :key="opt.value" class="th-fopt" :class="{ active: statusFilter === opt.value }" :title="opt.label" @click="setStatusFilter(opt.value)">
                          <i :class="opt.icon" :style="opt.css"></i>
                        </button>
                        <button class="th-fclear" @click="setStatusFilter(null)">✕</button>
                      </div>
                    </div>
                  </div>
                </th>
                <!-- Tip nevoie -->
                <th class="col-icon col-sticky">
                  <div class="th-icon-wrap">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                    <div class="th-filter-wrap">
                      <button class="th-fbtn" :class="{ active: typeFilter !== null }" @click.stop="showTypeFilter = !showTypeFilter">▼</button>
                      <div v-if="showTypeFilter" class="th-fdropdown">
                        <button v-for="opt in needTypeOptions" :key="opt.value" class="th-fopt" :class="{ active: typeFilter === opt.value }" :title="opt.label" @click="setTypeFilter(opt.value)">
                          <i :class="opt.icon" :style="opt.css"></i>
                        </button>
                        <button class="th-fclear" @click="setTypeFilter(null)">✕</button>
                      </div>
                    </div>
                  </div>
                </th>
                <th v-if="isEditable" class="col-icon col-sticky">
                  <button class="th-fclear" @click="clearAllFilters" title="Șterge filtrele">✕</button>
                </th>
              </tr>
              <!-- Filtre -->
              <tr class="tr-filters">
                <td v-if="PERMISIONS.conexe"></td>
                <td></td>
                <td v-if="showInstName"><div class="fi"><input v-model="filters.instName" @input="onFilter" /></div></td>
                <td v-if="showDepName"><div class="fi"><input v-model="filters.depName" @input="onFilter" /></div></td>
                <td><div class="fi"><input v-model="filters.applicant" @input="onFilter" /></div></td>
                <td><div class="fi"><input v-model="filters.name" @input="onFilter" /></div></td>
                <td><div class="fi"><input v-model="filters.category" @input="onFilter" /></div></td>
                <td>
                  <div class="fi-date">
                    <input type="date" v-model="filters.dateFrom" @change="onFilter" class="fd" />
                    <input type="date" v-model="filters.dateTo" @change="onFilter" class="fd" />
                  </div>
                </td>
                <td><div class="fi"><input v-model="filters.cpvCode" @input="onFilter" /></div></td>
                <td></td><td></td><td></td><td></td><td></td><td></td>
                <td>
                  <select v-model="filters.social" @change="onFilter" class="fs">
                    <option value="">-</option>
                    <option value="1">Social</option>
                    <option value="0">Non-social</option>
                  </select>
                </td>
                <td v-if="showAvizoColumn" class="col-sticky"></td>
                <td class="col-sticky"></td>
                <td class="col-sticky"></td>
                <td v-if="isEditable" class="col-sticky"></td>
              </tr>
            </thead>

            <tbody v-if="loading">
              <tr><td :colspan="colCount" class="tc"><div class="ld"><span></span><span></span><span></span></div></td></tr>
            </tbody>
            <tbody v-else-if="!paginatedRows.length">
              <tr><td :colspan="colCount" class="tc">Nu există propuneri de nevoi.</td></tr>
            </tbody>
            <tbody v-else>
              <template v-for="row in paginatedRows" :key="row.id">
                <tr class="tr-data" :class="{ 'tr-conexed': row.isConexed, 'tr-alt': row.nr % 2 === 0 }">
                  <td v-if="PERMISIONS.conexe" class="tc">
                    <label v-if="row.canConexe" class="chk-wrap" :class="{ checked: selectedIds.includes(row.id) }">
                      <input type="checkbox" :checked="selectedIds.includes(row.id)" @change="toggleCheckbox(row)" style="display:none" />
                      <span class="chk-box"></span>
                    </label>
                  </td>
                  <td class="tc cell-nr">{{ row.nr }}</td>
                  <td v-if="showInstName" class="cell-wrap">{{ row.instName }}</td>
                  <td v-if="showDepName" class="cell-wrap">{{ row.depName }}</td>
                  <td class="cell-nowrap">{{ row.applicant }}</td>
                  <td class="cell-name">{{ row.productName }}</td>
                  <td class="cell-wrap">{{ row.category }}</td>
                  <td class="tc" v-html="row.dateHtml"></td>
                  <td class="cell-nowrap">{{ row.cpvCode }}</td>
                  <td class="tc">{{ row.mu }}</td>
                  <td class="tr">{{ row.qty }}</td>
                  <td class="tr">{{ row.priceWoTva }}</td>
                  <td class="tr">{{ row.cotaTva }}</td>
                  <td class="tr">{{ row.priceWithTva }}</td>
                  <td class="tr">{{ row.sumNeed }}</td>
                  <td class="tc">
                    <span :class="row.social === 'Social' ? 'badge-social' : row.social === 'Non-social' ? 'badge-nonsocial' : ''">{{ row.social || '-' }}</span>
                  </td>
                  <!-- Status flux avizare -->
                  <td v-if="showAvizoColumn" class="tc col-sticky">
                    <span v-if="row.avizoStatusIcon" :title="row.avizoStatusIcon.tooltip">
                      <i :class="row.avizoStatusIcon.icon" :style="row.avizoStatusIcon.css"></i>
                    </span>
                    <span v-else>—</span>
                  </td>
                  <!-- Status referat -->
                  <td class="tc col-sticky">
                    <span :title="row.referateIcon.tooltip">
                      <i :class="row.referateIcon.icon" :style="row.referateIcon.css"></i>
                    </span>
                  </td>
                  <!-- Tip nevoie -->
                  <td class="tc col-sticky">
                    <span v-if="row.needTypeIcon" :title="row.needTypeIcon.tooltip">
                      <i :class="row.needTypeIcon.icon" :style="row.needTypeIcon.css"></i>
                    </span>
                  </td>
                  <!-- Actiuni -->
                  <td v-if="isEditable" class="tc col-sticky">
                    <div v-if="row.actions && row.actions.length" class="act-wrap">
                      <button class="act-toggle" @click.stop="toggleMenu(row.id)">⋮</button>
                      <div v-if="openMenuId === row.id" class="act-dropdown">
                        <button v-for="action in row.actions" :key="action.key" class="act-item" @click="handleAction(action, row)">
                          <i :class="action.icon" :style="action.css"></i>
                          <span>{{ action.label }}</span>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
                <!-- Sub-randuri conexate -->
                <template v-if="row.isConexed">
                  <tr v-if="loadingSubRows[row.id]">
                    <td :colspan="colCount" class="tc"><div class="ld"><span></span><span></span><span></span></div></td>
                  </tr>
                  <tr v-for="(sub, si) in (subRows[row.id] || [])" :key="'sub_' + sub.id" class="tr-data tr-sub">
                    <td v-if="PERMISIONS.conexe"></td>
                    <td class="tc cell-nr" style="color:#BDBDBD">{{ row.nr }}.{{ si + 1 }}</td>
                    <td v-if="showInstName"></td>
                    <td v-if="showDepName"></td>
                    <td>{{ sub.applicant }}</td>
                    <td class="cell-name">{{ sub.productName }}</td>
                    <td>{{ sub.category }}</td>
                    <td class="tc" v-html="sub.dateHtml"></td>
                    <td>{{ sub.cpvCode }}</td>
                    <td class="tc">{{ sub.mu }}</td>
                    <td class="tr">{{ sub.qty }}</td>
                    <td class="tr">{{ sub.priceWoTva }}</td>
                    <td class="tr">{{ sub.cotaTva }}</td>
                    <td class="tr">{{ sub.priceWithTva }}</td>
                    <td class="tr">{{ sub.sumNeed }}</td>
                    <td class="tc">{{ sub.social || '-' }}</td>
                    <td v-if="showAvizoColumn" class="col-sticky"></td>
                    <td class="col-sticky"></td>
                    <td class="col-sticky"></td>
                    <td v-if="isEditable" class="tc col-sticky">
                      <div v-if="sub.actions && sub.actions.length" class="act-wrap">
                        <button class="act-toggle" @click.stop="toggleMenu('sub_' + sub.id)">⋮</button>
                        <div v-if="openMenuId === 'sub_' + sub.id" class="act-dropdown">
                          <button v-for="action in sub.actions" :key="action.key" class="act-item" @click="handleAction(action, sub)">
                            <i :class="action.icon" :style="action.css"></i>
                            <span>{{ action.label }}</span>
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                </template>
              </template>
            </tbody>
          </table>
        </div>


        <!-- Footer -->

        <div class="table-footer">
          <span class="tf-total">TOTAL AFIȘAT: {{ filteredRows.length }}/{{ totalItems }}</span>
          <div class="tf-pagination">
            <span class="tf-info">Rânduri pe pagină:
              <select v-model.number="pageSize" @change="pageFrom = 0" class="tf-select">
                <option v-for="s in [15,25,50,100]" :key="s" :value="s">{{ s }}</option>
              </select>
            </span>
            <span class="tf-pages">{{ pageFrom + 1 }}-{{ Math.min(pageFrom + pageSize, filteredRows.length) }}</span>
            <button class="pg-btn" :disabled="pageFrom === 0" @click="prevPage">‹</button>
            <button class="pg-btn" :disabled="pageFrom + pageSize >= filteredRows.length" @click="nextPage">›</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Adauga/Editeaza -->
    <NeedsAddModal v-if="modalOpen" :origin="editOrigin" :isEdit="!!editOrigin" @close="modalOpen = false" @saved="onSaved" />

    <!-- Modal Versiuni -->
    <div v-if="cronologyModal.open" class="modal-overlay" @click.self="cronologyModal.open = false">
      <div class="modal">
        <div class="modal-header">
          <div><h2 class="modal-title">Versiuni precedente</h2><p class="modal-sub">{{ cronologyModal.title }}</p></div>
          <button class="modal-close" @click="cronologyModal.open = false">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="cronologyModal.loading" class="ld"><span></span><span></span><span></span></div>
          <div v-else-if="!cronologyModal.versions.length" class="tc" style="padding:24px;color:#9e9e9e">Nu există versiuni.</div>
          <div v-else class="cron-list">
            <div v-for="(v, i) in cronologyModal.versions" :key="v.id" class="cron-item" :class="{ 'cron-item--current': i === 0 }">
              <div class="cron-nr">V{{ String(cronologyModal.versions.length - i).padStart(2,'0') }}</div>
              <div class="cron-info">
                <div class="cron-name">{{ v.product?.name || v.productName || '—' }}</div>
                <div class="cron-meta">{{ formatDate(v.createdAt) }} · {{ v.status }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Confirmare -->
    <div v-if="confirmModal.open" class="modal-overlay" @click.self="confirmModal.open = false">
      <div class="simple-modal">
        <h3 class="modal-title">{{ confirmModal.title }}</h3>
        <p style="font-size:13px;color:#424242;line-height:1.6">{{ confirmModal.message }}</p>
        <div v-if="confirmModal.needsReason" style="display:flex;flex-direction:column;gap:5px;margin-top:8px">
          <label class="field-label">{{ confirmModal.reasonLabel || 'Motiv' }} <span style="color:#E53935">*</span></label>
          <textarea v-model="confirmModal.reason" class="field-input" rows="3" placeholder="Introduceți motivul..."></textarea>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:16px">
          <button class="btn btn-secondary" @click="confirmModal.open = false">Anulează</button>
          <button class="btn" :class="confirmModal.btnClass || 'btn-danger'" @click="confirmModal.onConfirm?.(confirmModal.reason)" :disabled="confirmModal.needsReason && !confirmModal.reason?.trim()">
            {{ confirmModal.btnLabel || 'Confirmă' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NeedsAddModal from '@/components/NeedsAddModal.vue'
import {
  NEEDS_PAGINATED, NEED_CANCEL, NEEDS_CONEXE, NEEDS_FROM_CONEXED,
  NEEDS_AVIZO, NEEDS_AVIZO_MODIFY, NEEDS_CANCEL_AVIZO, NEEDS_AVIZO_TYPE,
  NEEDS_REMOVE_CONNECTED, INSTITUTION, NEED_DELETE
} from '@/api.js'

const route = useRoute()
const router = useRouter()

// ── Permisiuni ──
const PERMISIONS = computed(() => {
  const role = window.$getRoleAll?.()?.role || ''

  const hasPlanningAccess = ['angajat', 'supervisor', 'sef_institutie', 'responsabil_achizitii', 'supervizor_achizitii'].includes(role)
  const canConfirm = ['sef_institutie', 'responsabil_achizitii', 'supervizor_achizitii', 'supervisor'].includes(role)
  const canConexe = ['angajat', 'supervisor'].includes(role)

  return {
    list: hasPlanningAccess,
    view: hasPlanningAccess,
    create: hasPlanningAccess,
    edit: hasPlanningAccess,
    delete: hasPlanningAccess,
    confirm: canConfirm,
    reject: canConfirm,
    conexe: canConexe
  }
})

// ── State ──
const rows = ref([])
const subRows = ref({})
const loadingSubRows = ref({})
const loading = ref(false)
const totalItems = ref(0)
const pageFrom = ref(0)
const pageSize = ref(15)
const openMenuId = ref(null)
const modalOpen = ref(false)
const editOrigin = ref(null)
const cartVisible = ref(false)
const cartData = ref([])
const cartLoading = ref(false)
const cartTypeLabel = ref('')
const cartTypeError = ref(false)
const selectedIds = ref([])
const showStatusFilter = ref(false)
const showTypeFilter = ref(false)
const statusFilter = ref(null)
const typeFilter = ref(null)
const showInstName = ref(false)
const showDepName = ref(false)
const showAvizoColumn = ref(false)

const cronologyModal = ref({ open: false, title: '', versions: [], loading: false })
const confirmModal = ref({ open: false, title: '', message: '', reason: '', reasonLabel: '', needsReason: false, btnLabel: '', btnClass: '', onConfirm: null })

const filters = ref({ instName:'', depName:'', applicant:'', name:'', category:'', dateFrom:'', dateTo:'', cpvCode:'', social:'' })

// ── Computed ──
const avizoMode = computed(() => route.path.includes('/avizare-aprobare'))

const isEditable = computed(() => {
  const role = window.$getRoleAll?.()?.role
  return ['sef_institutie','supervisor','angajat','responsabil_achizitii','supervizor_achizitii','responsabil_buget'].includes(role)
})

const colCount = computed(() => {
  let c = 17
  if (PERMISIONS.value.conexe) c++
  if (showInstName.value) c++
  if (showDepName.value) c++
  if (showAvizoColumn.value) c++
  if (isEditable.value) c++
  return c
})

const filteredRows = computed(() => {
  let r = rows.value
  const f = filters.value
  if (f.instName) r = r.filter(x => x.instName?.toLowerCase().includes(f.instName.toLowerCase()))
  if (f.depName) r = r.filter(x => x.depName?.toLowerCase().includes(f.depName.toLowerCase()))
  if (f.applicant) r = r.filter(x => x.applicant?.toLowerCase().includes(f.applicant.toLowerCase()))
  if (f.name) r = r.filter(x => x.productName?.toLowerCase().includes(f.name.toLowerCase()))
  if (f.category) r = r.filter(x => x.category?.toLowerCase().includes(f.category.toLowerCase()))
  if (f.cpvCode) r = r.filter(x => x.cpvCode?.includes(f.cpvCode))
  if (f.social === '1') r = r.filter(x => x.social === 'Social')
  if (f.social === '0') r = r.filter(x => x.social === 'Non-social')
  if (f.dateFrom) r = r.filter(x => x.rawDate >= f.dateFrom)
  if (f.dateTo) r = r.filter(x => x.rawDate <= f.dateTo)
  if (statusFilter.value) r = r.filter(x => x.referateStatus === statusFilter.value)
  if (typeFilter.value) r = r.filter(x => x.needType === typeFilter.value)
  return r
})

const paginatedRows = computed(() => filteredRows.value.slice(pageFrom.value, pageFrom.value + pageSize.value))

// ── Status maps ──
const referateStatusOptions = [
  { value: 'draft',                 label: 'Draft',                  icon: 'far fa-clock',             css: 'color:#f2da07;font-size:1.3rem;' },
  { value: 'completion',            label: 'În completare',           icon: 'fas fa-pencil-alt',         css: 'color:#F2994A;font-size:1.2rem;' },
  { value: 'completed',             label: 'Completat',               icon: 'fas fa-pencil-alt',         css: 'color:#569a36;font-size:1.2rem;' },
  { value: 'signature_waiting',     label: 'Așteaptă semnare',        icon: 'fas fa-clock',              css: 'color:#f2da07;font-size:1.3rem;' },
  { value: 'in_progress_signature', label: 'În curs de aprobare',     icon: 'fas fa-pen-nib',            css: 'color:#F2994A;font-size:1.2rem;' },
  { value: 'rejected',              label: 'Respins',                 icon: 'fas fa-times-circle',       css: 'color:#ec4a4a;font-size:1.3rem;' },
  { value: 'cancelled',             label: 'Anulat',                  icon: 'fas fa-exclamation-circle', css: 'color:#ce302d;font-size:1.3rem;' },
  { value: 'approved',              label: 'Aprobat',                 icon: 'fas fa-clipboard-check',    css: 'color:#569a36;font-size:1.3rem;' },
]

const needTypeOptions = [
  { value: 'open',    label: 'Deblocat', icon: 'fas fa-unlock',       css: 'color:#27ae60;font-size:1.3rem;' },
  { value: 'locked',  label: 'Blocat',   icon: 'fas fa-lock',         css: 'color:#e74c3c;font-size:1.3rem;' },
  { value: 'similar', label: 'Similar',  icon: 'fas fa-check-double', css: 'color:#2980b9;font-size:1.3rem;' },
  { value: 'complex', label: 'Complex',  icon: 'fas fa-layer-group',  css: 'color:#8e44ad;font-size:1.3rem;' },
]

const avizoStatusMap = {
  generated:     { icon: 'fas fa-star',             css: 'color:#f2da07;font-size:1.2rem;', tooltip: 'Generat' },
  pending:       { icon: 'far fa-clock',             css: 'color:#f2da07;font-size:1.2rem;', tooltip: 'Așteptare aprobare' },
  avizo:         { icon: 'fas fa-low-vision',        css: 'color:#2980b9;font-size:1.2rem;', tooltip: 'În proces de avizare' },
  editing:       { icon: 'fas fa-times-circle',      css: 'color:#39f;font-size:1.2rem;',    tooltip: 'Așteptare editare după avizare negativă' },
  approvalReady: { icon: 'far fa-calendar-check',   css: 'color:#F2994A;font-size:1.2rem;', tooltip: 'Așteptare aprobare după avizare' },
  approved:      { icon: 'fas fa-clipboard-check',  css: 'color:#569a36;font-size:1.2rem;', tooltip: 'Aprobat' },
  rejected:      { icon: 'fas fa-times-circle',     css: 'color:#ec4a4a;font-size:1.2rem;', tooltip: 'Respins' },
  cancelled:     { icon: 'fas fa-ban',              css: 'color:#ce302d;font-size:1.2rem;', tooltip: 'Anulat' },
  disabled:      { icon: 'fas fa-exclamation-circle', css: 'color:red;font-size:1.2rem;',   tooltip: 'Dezactivat' },
}

// ── Helpers ──
function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

function getReferateIcon(status) {
  const map = {
    draft:                 { icon: 'far fa-clock',             css: 'color:#f2da07;font-size:1.2rem;', tooltip: 'Draft' },
    completion:            { icon: 'fas fa-pencil-alt',        css: 'color:#F2994A;font-size:1.1rem;', tooltip: 'În completare' },
    completed:             { icon: 'fas fa-pencil-alt',        css: 'color:#569a36;font-size:1.1rem;', tooltip: 'Completat' },
    signature_waiting:     { icon: 'fas fa-clock',             css: 'color:#f2da07;font-size:1.2rem;', tooltip: 'Așteaptă semnare' },
    in_progress_signature: { icon: 'fas fa-pen-nib',           css: 'color:#F2994A;font-size:1.1rem;', tooltip: 'În curs de aprobare' },
    rejected:              { icon: 'fas fa-times-circle',      css: 'color:#ec4a4a;font-size:1.2rem;', tooltip: 'Referat respins' },
    cancelled:             { icon: 'fas fa-exclamation-circle',css: 'color:#ce302d;font-size:1.2rem;', tooltip: 'Referat anulat' },
    approved:              { icon: 'fas fa-clipboard-check',   css: 'color:#569a36;font-size:1.2rem;', tooltip: 'Referat aprobat' },
  }
  return map[status] || { icon: 'far fa-file-alt', css: 'color:#39f;font-size:1.2rem;', tooltip: 'Fără referat' }
}

function getNeedTypeIcon(needType) {
  const map = {
    open:    { icon: 'fas fa-unlock',       css: 'color:#27ae60;font-size:1.2rem;', tooltip: 'Deblocat' },
    locked:  { icon: 'fas fa-lock',         css: 'color:#e74c3c;font-size:1.2rem;', tooltip: 'Blocat' },
    complex: { icon: 'fas fa-layer-group',  css: 'color:#8e44ad;font-size:1.2rem;', tooltip: 'Complex' },
    similar: { icon: 'fas fa-check-double', css: 'color:#2980b9;font-size:1.2rem;', tooltip: 'Similar' },
  }
  return map[needType] || null
}

function formatNumber(val) {
  if (val === null || val === undefined) return '-'
  return Number(val).toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function prepareRow(row, index) {
  const isConexed = ['complex','similar'].includes(row.needType)
  const role = window.$getRoleAll?.()
  const uuid = row.createdByUser?.id
  const roleOwner = String(role?.id) === String(uuid)
  const status = String(row.status || '').toLowerCase()
  const applicant = row.createdByUser ? `${row.createdByUser.last_name || ''} ${row.createdByUser.first_name || ''} / ${row.createdByUser.id || ''}` : '-'
  const dateHtml = formatDate(row.createdAt).replace(' ', '<br>')
  const referateStatus = row.needReferateObj?.needReferateStatus || row.needReferenceStatus || 'none'
  const referateIcon = getReferateIcon(referateStatus)
  const needTypeIcon = getNeedTypeIcon(row.needType)
  const avizoStatusIcon = avizoStatusMap[row.status] || null
  const actions = buildActions(row, { roleOwner, uuid, status, isConexed, role })
  const canConexe = (status === 'approved' || status === 'generated') && !isConexed && row.needType !== 'locked'

  return {
    id: row.id, nr: index + 1,
    instName: row.institution?.name || '-',
    depName: row.department?.name || '-',
    applicant, dateHtml,
    rawDate: (row.createdAt || '').substring(0, 10),
    productName: isConexed && row.needName ? row.needName : row.product?.name || '-',
    category: isConexed ? row.dominantNeed?.product?.cpvCategory?.category || '-' : row.product?.cpvCategory?.category || '-',
    cpvCode: isConexed ? row.dominantNeed?.product?.cpvCategory?.cpvCode || '-' : row.product?.cpvCategory?.cpvCode || '-',
    mu: row.product?.measurementUnit?.shortName || '-',
    qty: isConexed ? '' : row.qty || '-',
    priceWoTva: isConexed ? '' : formatNumber(row.estimatedPriceWoTva),
    cotaTva: isConexed ? '' : `${(+row.cotaTva)?.toFixed(2) || '0.00'} %`,
    priceWithTva: isConexed ? '' : formatNumber(row.estimatedPrice),
    sumNeed: formatNumber(row.sumNeed),
    social: { true: 'Social', false: 'Non-social' }[row.needIsSocial] || '-',
    referateIcon, referateStatus, needTypeIcon, avizoStatusIcon,
    needType: row.needType, isConexed, canConexe, actions, status, data: row,
  }
}

function buildActions(row, { roleOwner, uuid, status, isConexed, role }) {
  const actions = []
  const roleName = role?.role || ''
  const editGranted = ['sef_institutie','supervisor','angajat']

  // Anulează
  if (roleOwner && !['approved','cancelled','generated'].includes(row.status)) {
    actions.push({ key: 'cancel', label: 'Anulează', icon: 'fas fa-window-close', css: 'font-size:1.1rem;color:#ec4a4a;', action: 'cancel' })
  }
  // Modifică
  if (editGranted.includes(roleName) && !isConexed && row.needType !== 'locked' && roleOwner) {
    const css = row.needReferateObj ? 'font-size:1.1rem;color:#EB5757;' : 'font-size:1.1rem;color:#F2994A;'
    actions.unshift({ key: 'edit', label: 'Modifică', icon: 'fas fa-pencil-alt', css, action: 'edit' })
  }
  // Șterge
  if (!isConexed && roleOwner && editGranted.includes(roleName) && ['rejected','editing','cancelled'].includes(status) && !row.needReferateObj && !row.parentConnectedId) {
    actions.push({ key: 'delete', label: 'Șterge', icon: 'fas fa-trash', css: 'font-size:1.1rem;color:#e74c3c;', action: 'delete' })
  }
  // Oprire flux avizare
  if (['avizo','approvalReady'].includes(row.status) && row.createdByUserRole === roleName) {
    actions.push({ key: 'cancelAvizo', label: 'Oprire flux de avizare', icon: 'fas fa-times-circle', css: 'font-size:1.1rem;color:red;', action: 'cancelAvizo' })
  }
  // Generare RF
  if (!row.needReferateObj && row.needType !== 'locked' && ['approved','generated'].includes(row.status) && row.createdByUserRoleName === roleName) {
    actions.push({ key: 'generateRF', label: 'Generare Referat Necesitate', icon: 'fas fa-file-alt', css: 'font-size:1.1rem;color:#2196f3;', action: 'generateRF' })
  }
  // Cronologie
  actions.push({ key: 'cronology', label: 'Versiuni precedente', icon: 'fas fa-history', css: 'font-size:1.1rem;color:#555;', action: 'cronology' })
  // Anulare conexare
  if (row.parentConnectedId) {
    actions.push({ key: 'unpair', label: 'Anulează conexarea', icon: 'fas fa-unlink', css: 'font-size:1.1rem;color:#888;', action: 'unpair' })
  }
  return actions
}

// ── Data ──
async function loadData() {
  loading.value = true
  try {
    const fn = avizoMode.value ? NEEDS_AVIZO : NEEDS_PAGINATED
    const res = await fn(1, 500)
    const data = await res.json()
    if (Array.isArray(data?.data?.result)) {
      rows.value = data.data.result.map((r, i) => prepareRow(r, i))
      totalItems.value = data.data.recordsQuantity || rows.value.length
    }
  } catch(e) { console.error(e) }
  finally { loading.value = false }
}

async function loadInstitution() {
  const instId = window.$getUserInstitution?.()
  if (!instId) return
  try {
    const res = await INSTITUTION(instId)
    const data = await res.json()
    if (data?.data?.result) {
      showAvizoColumn.value = !!(data.data.result.approveMode || data.data.result.avizoMode)
    }
  } catch {}
}

// ── Filters ──
function onFilter() { pageFrom.value = 0 }
function setStatusFilter(val) { statusFilter.value = val; showStatusFilter.value = false; pageFrom.value = 0 }
function setTypeFilter(val) { typeFilter.value = val; showTypeFilter.value = false; pageFrom.value = 0 }
function clearAllFilters() {
  filters.value = { instName:'', depName:'', applicant:'', name:'', category:'', dateFrom:'', dateTo:'', cpvCode:'', social:'' }
  statusFilter.value = null; typeFilter.value = null; pageFrom.value = 0
}
function prevPage() { if (pageFrom.value > 0) pageFrom.value -= pageSize.value }
function nextPage() { if (pageFrom.value + pageSize.value < filteredRows.value.length) pageFrom.value += pageSize.value }

// ── Actions ──
function toggleMenu(id) { openMenuId.value = openMenuId.value === id ? null : id }

function handleAction(action, row) {
  openMenuId.value = null
  const h = {
    edit:       () => { editOrigin.value = row.data; modalOpen.value = true },
    delete:     () => confirmDelete(row),
    cancel:     () => confirmCancel(row),
    cancelAvizo:() => confirmCancelAvizo(row),
    generateRF: () => router.push(`/planificare/referate?needId=${row.id}`),
    cronology:  () => openCronology(row),
    unpair:     () => confirmUnpair(row),
  }
  h[action.action]?.()
}

function openAddModal() { editOrigin.value = null; modalOpen.value = true }
function onSaved() { modalOpen.value = false; loadData() }

function confirmDelete(row) {
  confirmModal.value = { open:true, title:'Șterge propunere nevoie', message:`Ești sigur că vrei să ștergi "${row.productName}"?`, btnLabel:'Șterge', btnClass:'btn-danger', needsReason:false,
    onConfirm: async () => { confirmModal.value.open = false; await NEED_DELETE(row.id); loadData() } }
}
function confirmCancel(row) {
  confirmModal.value = { open:true, title:'Anulare nevoie', message:`Anulați nevoie "${row.productName}"?`, needsReason:true, reasonLabel:'Motivul anulării', btnLabel:'Anulează nevoie', btnClass:'btn-danger', reason:'',
    onConfirm: async (reason) => { confirmModal.value.open = false; await NEED_CANCEL(row.id, { reason }); loadData() } }
}
function confirmCancelAvizo(row) {
  confirmModal.value = { open:true, title:'Oprire flux de avizare', message:`Opriți fluxul pentru "${row.productName}"?`, needsReason:true, reasonLabel:'Motivul opririi', btnLabel:'Oprire flux', btnClass:'btn-danger', reason:'',
    onConfirm: async (reason) => { confirmModal.value.open = false; await NEEDS_CANCEL_AVIZO(row.id, { reason }); loadData() } }
}
function confirmUnpair(row) {
  confirmModal.value = { open:true, title:'Anulare conexare', message:`Anulați conexarea nevoii "${row.productName}"?`, btnLabel:'Anulează conexarea', btnClass:'btn-danger', needsReason:false,
    onConfirm: async () => { confirmModal.value.open = false; await NEEDS_REMOVE_CONNECTED(row.id); loadData() } }
}
async function openCronology(row) {
  cronologyModal.value = { open:true, title:`Nevoie: ${row.productName}`, versions:[], loading:true }
  try {
    const res = await NEEDS_FROM_CONEXED(row.id)
    const data = await res.json()
    cronologyModal.value.versions = Array.isArray(data?.data) ? data.data : []
  } catch {}
  finally { cronologyModal.value.loading = false }
}

// ── Cart ──
function toggleCheckbox(row) {
  const idx = selectedIds.value.indexOf(row.id)
  if (idx > -1) { selectedIds.value.splice(idx,1); cartData.value = cartData.value.filter(c => c.id !== row.id) }
  else { selectedIds.value.push(row.id); cartData.value.push({ id:row.id, productName:row.productName, social: row.social === 'Social' ? true : row.social === 'Non-social' ? false : null }) }
  syncCartType()
}
function removeFromCart(id) { selectedIds.value = selectedIds.value.filter(x => x !== id); cartData.value = cartData.value.filter(c => c.id !== id); syncCartType() }

async function syncCartType() {
  if (cartData.value.length < 2) { cartTypeLabel.value = ''; return }
  cartLoading.value = true; cartTypeError.value = false
  try {
    const res = await NEEDS_AVIZO_TYPE(cartData.value.map(e => e.id))
    const data = await res.json()
    cartTypeLabel.value = typeof data?.data?.result === 'string' ? { complex:'complexă', similar:'similară' }[data.data.result] || data.data.result : ''
    if (!data?.data?.result) cartTypeError.value = true
  } catch { cartTypeError.value = true }
  finally { cartLoading.value = false }
}

async function createConexedNeed() {
  const hasSocial = cartData.value.some(n => n.social === true)
  const hasNonSocial = cartData.value.some(n => n.social === false)
  if (hasSocial && hasNonSocial) {
    alert('Nevoia conexată nu poate fi compusă din nevoi Sociale și nevoi Non-sociale.')
    return
  }
  const needName = cartTypeLabel.value ? prompt(`Denumiți nevoia ${cartTypeLabel.value}:`) : ''
  if (needName === null) return
  try {
    await NEEDS_CONEXE(cartData.value.map(e => e.id), needName || '')
    selectedIds.value = []; cartData.value = []; cartVisible.value = false; cartTypeLabel.value = ''
    loadData()
  } catch(e) { console.error(e) }
}

// ── Click outside ──
function handleClickOutside(e) {
  if (openMenuId.value && !e.target.closest('.act-wrap')) openMenuId.value = null
  if (showStatusFilter.value && !e.target.closest('.th-filter-wrap')) showStatusFilter.value = false
  if (showTypeFilter.value && !e.target.closest('.th-filter-wrap')) showTypeFilter.value = false
  if (cartVisible.value && !e.target.closest('.cart-wrapper')) cartVisible.value = false
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  const role = window.$getRoleAll?.()?.role
  showInstName.value = ['superadmin','admin_institutie'].includes(role) || avizoMode.value
  showDepName.value = avizoMode.value
  loadData()
  loadInstitution()
})
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
watch(() => route.path, loadData)
</script>

<style scoped>
.page { display:flex; flex-direction:column; height:100%; overflow:hidden; font-family:'Roboto',sans-serif; }
.page__breadcrumb { background:#1565C0; padding:9px 24px; display:flex; align-items:center; gap:6px; font-size:12px; color:rgba(255,255,255,0.8); flex-shrink:0; }
.breadcrumb-sep { color:rgba(255,255,255,0.5); }
.breadcrumb-current { color:white; font-weight:500; }
.page__titlebar { display:flex; align-items:center; justify-content:space-between; padding:14px 24px; background:white; border-bottom:0.5px solid #E0E0E0; flex-shrink:0; }
.page__title { font-size:18px; font-weight:600; color:#1a1a2e; margin:0; }
.titlebar-actions { display:flex; align-items:center; gap:10px; }
.page__content { flex:1; padding:16px 24px; overflow:hidden; display:flex; flex-direction:column; }

/* Table card */
.table-card { background:white; border-radius:12px; border:0.5px solid #E0E0E0; display:flex; flex-direction:column; flex:1; overflow:hidden; }
.table-scroll-wrapper { flex:1; overflow:auto; }
.needs-table { width:100%; border-collapse:collapse; font-size:12px; min-width:1600px; }

/* Header */
.tr-header th { background:#1565C0; color:white; padding:9px 8px; font-size:10px; font-weight:700; letter-spacing:0.3px; text-align:left; white-space:nowrap; border-right:1px solid rgba(255,255,255,0.1); position:sticky; top:0; z-index:3; }
.tr-header th:last-child { border-right:none; }

/* Filter row */
.tr-filters td { background:#F8F9FC; padding:5px 6px; border-bottom:2px solid #E0E0E0; position:sticky; top:37px; z-index:2; }

/* Sticky right columns */
.col-sticky { position:sticky; right:0; background:inherit; z-index:2; }
.tr-header .col-sticky { background:#1565C0; z-index:4; }
.tr-filters .col-sticky { background:#F8F9FC; }

/* Data rows */
.tr-data td { padding:8px 8px; border-bottom:0.5px solid #F0F0F0; color:#424242; vertical-align:middle; }
.tr-data:hover td { background:#F5F7FA !important; }
.tr-alt td { background:#FAFAFA; }
.tr-conexed td { background:#FFFDE7; }
.tr-sub td { background:#F9FBE7; font-size:11px; }

/* Cell types */
.tc { text-align:center; }
.tr { text-align:right; white-space:nowrap; }
.cell-nr { color:#9e9e9e; width:40px; }
.cell-name { white-space:normal; word-break:break-word; line-height:1.4; max-width:200px; }
.cell-nowrap { white-space:nowrap; }
.cell-wrap { white-space:normal; word-break:break-word; max-width:160px; }
.col-nr { width:40px; }
.col-chk { width:36px; }
.col-icon { width:40px; }

/* Filter inputs */
.fi { display:flex; align-items:center; background:white; border:0.5px solid #E0E0E0; border-radius:4px; padding:2px 5px; }
.fi input { border:none; outline:none; font-size:11px; width:100%; background:transparent; font-family:'Roboto',sans-serif; }
.fi-date { display:flex; flex-direction:column; gap:2px; }
.fd { border:0.5px solid #E0E0E0; border-radius:4px; padding:2px 4px; font-size:10px; width:100%; }
.fs { border:0.5px solid #E0E0E0; border-radius:4px; padding:2px 4px; font-size:11px; width:100%; }

/* Header filter */
.th-icon-wrap { display:flex; align-items:center; justify-content:center; gap:4px; }
.th-filter-wrap { position:relative; }
.th-fbtn { background:none; border:none; cursor:pointer; color:rgba(255,255,255,0.7); font-size:9px; padding:2px; }
.th-fbtn:hover, .th-fbtn.active { color:#ffd54f; }
.th-fdropdown { position:absolute; top:calc(100% + 6px); right:0; background:white; border-radius:10px; border:0.5px solid #E0E0E0; box-shadow:0 4px 16px rgba(0,0,0,0.12); display:flex; align-items:center; gap:4px; padding:8px 10px; z-index:100; white-space:nowrap; }
.th-fopt { background:none; border:none; cursor:pointer; padding:4px 6px; border-radius:6px; transition:background 0.15s; }
.th-fopt:hover, .th-fopt.active { background:#F5F7FA; }
.th-fclear { background:none; border:none; cursor:pointer; color:#9e9e9e; font-size:12px; padding:4px; }

/* Badges */
.badge-social { background:#E8F5E9; color:#2E7D32; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:600; }
.badge-nonsocial { background:#FFF8E1; color:#F57F17; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:600; }

/* Checkbox */
.chk-wrap { display:flex; align-items:center; justify-content:center; cursor:pointer; }
.chk-box { width:15px; height:15px; border:2px solid #E0E0E0; border-radius:3px; background:white; transition:all 0.15s; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; color:white; }
.chk-wrap.checked .chk-box { background:#1565C0; border-color:#1565C0; }
.chk-wrap.checked .chk-box::after { content:'✓'; }

/* Actions */
.act-wrap { position:relative; display:flex; justify-content:center; }
.act-toggle { background:none; border:none; cursor:pointer; color:#9e9e9e; padding:4px 8px; border-radius:4px; font-size:18px; line-height:1; transition:background 0.15s; }
.act-toggle:hover { background:#F5F7FA; color:#424242; }
.act-dropdown { position:absolute; right:0; top:calc(100% + 4px); background:white; border-radius:10px; border:0.5px solid #E0E0E0; box-shadow:0 4px 16px rgba(0,0,0,0.12); min-width:210px; z-index:100; overflow:hidden; }
.act-item { display:flex; align-items:center; gap:10px; padding:9px 14px; width:100%; background:none; border:none; cursor:pointer; font-size:13px; font-family:'Roboto',sans-serif; color:#424242; text-align:left; transition:background 0.15s; }
.act-item:hover { background:#F5F7FA; }

/* Footer */
.table-footer { display:flex; align-items:center; justify-content:space-between; padding:10px 16px; background:#F8F9FC; border-top:0.5px solid #E0E0E0; flex-shrink:0; font-size:12px; position: sticky; bottom: 0; z-index: 2; }
.tf-total { color:#757575; }
.tf-pagination { display:flex; align-items:center; gap:10px; }
.tf-info { color:#757575; }
.tf-pages { color:#757575; }
.tf-select { border:0.5px solid #E0E0E0; border-radius:4px; padding:2px 4px; font-size:12px; margin-left:4px; }
.pg-btn { width:28px; height:28px; border:0.5px solid #E0E0E0; border-radius:6px; background:white; cursor:pointer; font-size:16px; transition:background 0.15s; }
.pg-btn:hover:not(:disabled) { background:#F5F7FA; }
.pg-btn:disabled { opacity:0.4; cursor:not-allowed; }

/* Loading */
.ld { display:inline-flex; gap:6px; padding:24px; }
.ld span { width:8px; height:8px; background:#1565C0; border-radius:50%; animation:bounce 1.2s infinite; }
.ld span:nth-child(2) { animation-delay:0.2s; }
.ld span:nth-child(3) { animation-delay:0.4s; }
@keyframes bounce { 0%,60%,100% { transform:translateY(0); } 30% { transform:translateY(-6px); } }

/* Cart */
.cart-wrapper { position:relative; }
.cart-btn { display:flex; align-items:center; gap:6px; background:white; border:1.5px solid #E0E0E0; border-radius:8px; padding:7px 12px; cursor:pointer; color:#424242; transition:all 0.15s; }
.cart-btn:hover, .cart-btn--active { background:#F0F4FF; border-color:#1565C0; color:#1565C0; }
.cart-badge { background:#1565C0; color:white; border-radius:10px; padding:1px 6px; font-size:11px; font-weight:700; }
.cart-dropdown { position:absolute; top:calc(100% + 8px); right:0; background:white; border-radius:12px; border:0.5px solid #E0E0E0; box-shadow:0 8px 24px rgba(0,0,0,0.12); width:280px; z-index:100; overflow:hidden; }
.cart-dropdown__header { padding:10px 16px; font-size:11px; font-weight:600; color:#757575; background:#F5F7FA; border-bottom:0.5px solid #E0E0E0; }
.cart-empty { padding:20px; text-align:center; color:#9e9e9e; font-size:12px; }
.cart-list { list-style:none; padding:6px 0; max-height:180px; overflow-y:auto; }
.cart-item { display:flex; align-items:center; gap:8px; padding:7px 14px; }
.cart-item:hover { background:#F5F7FA; }
.cart-remove { background:none; border:none; cursor:pointer; color:#E53935; font-size:14px; flex-shrink:0; }
.cart-item__name { font-size:12px; font-weight:500; color:#1a1a2e; }
.cart-create-btn { width:100%; padding:12px; background:#1565C0; color:white; border:none; cursor:pointer; font-size:13px; font-weight:600; font-family:'Roboto',sans-serif; transition:background 0.2s; }
.cart-create-btn:hover:not(:disabled) { background:#1976D2; }
.cart-create-btn:disabled { opacity:0.6; cursor:not-allowed; }
.cart-drop-enter-active, .cart-drop-leave-active { transition:all 0.2s ease; }
.cart-drop-enter-from, .cart-drop-leave-to { opacity:0; transform:translateY(-8px); }

/* Modal */
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:1000; padding:20px; }
.modal { background:white; border-radius:16px; width:100%; max-width:640px; max-height:85vh; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 8px 32px rgba(0,0,0,0.15); }
.modal-header { display:flex; align-items:flex-start; justify-content:space-between; padding:18px 24px; border-bottom:0.5px solid #E0E0E0; flex-shrink:0; }
.modal-title { font-size:17px; font-weight:600; color:#1a1a2e; margin:0; }
.modal-sub { font-size:12px; color:#9e9e9e; margin-top:3px; }
.modal-close { background:none; border:none; cursor:pointer; font-size:18px; color:#757575; }
.modal-body { flex:1; overflow-y:auto; padding:24px; }
.simple-modal { background:white; border-radius:16px; padding:28px; max-width:460px; width:100%; display:flex; flex-direction:column; gap:14px; box-shadow:0 8px 32px rgba(0,0,0,0.15); }
.cron-list { display:flex; flex-direction:column; gap:10px; }
.cron-item { display:flex; gap:14px; padding:12px 16px; border-radius:8px; border:0.5px solid #E0E0E0; }
.cron-item--current { background:#F0F7FF; border-color:#90CAF9; }
.cron-nr { font-size:12px; font-weight:700; color:#1565C0; min-width:36px; }
.cron-name { font-size:13px; font-weight:500; }
.cron-meta { font-size:11px; color:#757575; margin-top:3px; }

/* Access denied */
.access-denied { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; height:100%; color:#9e9e9e; font-size:14px; }

/* Form */
.field-label { font-size:11px; font-weight:600; color:#616161; text-transform:uppercase; letter-spacing:0.4px; }
.field-input { padding:10px 12px; border:1.5px solid #E0E0E0; border-radius:8px; font-size:13px; font-family:'Roboto',sans-serif; outline:none; width:100%; }
.field-input:focus { border-color:#1565C0; }

/* Buttons */
.btn { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:8px; border:none; cursor:pointer; font-size:13px; font-weight:500; font-family:'Roboto',sans-serif; }
.btn-primary { background:#1565C0; color:white; }
.btn-primary:hover { background:#1976D2; }
.btn-secondary { background:white; color:#757575; border:1.5px solid #E0E0E0; }
.btn-secondary:hover { background:#F5F7FA; }
.btn-danger { background:#E53935; color:white; }
.btn-danger:hover { background:#C62828; }
.btn:disabled { opacity:0.6; cursor:not-allowed; }
</style>
