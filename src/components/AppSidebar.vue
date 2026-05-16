<template>
  <div :class="['sidebar', collapsed ? 'sidebar--collapsed' : '']">

    <!-- Grupuri de navigare — accordion: una deschisă la un moment dat -->
    <div class="sidebar-groups">
      <div
        v-for="(group, groupIndex) in visibleGroups"
        :key="group.name"
        class="sidebar-group"
      >
        <!-- Header grup -->
        <button
          class="group-header"
          @click="toggleGroup(groupIndex)"
        >
          <span v-if="!collapsed" class="group-name">{{ group.name }}</span>
          <span v-if="!collapsed" :class="['group-chevron', openGroupIndex === groupIndex ? 'group-chevron--open' : '']">›</span>
        </button>

        <!-- Itemuri grup -->
        <transition name="slide">
          <div v-show="openGroupIndex === groupIndex" class="group-items">
            <router-link
              v-for="item in group.items"
              :key="item.path"
              :to="item.path"
              :class="['nav-item', isActive(item.path) ? 'nav-item--active' : '']"
              @click.native="onNavClick"
            >
              <span class="nav-icon">
                <i v-if="item.faIcon" :class="item.faIcon"></i>
                <span v-else>{{ item.emoji }}</span>
              </span>
              <span v-if="!collapsed" class="nav-label">{{ item.name }}</span>
              <!-- Badge notificări -->
              <span v-if="!collapsed && item.badge" class="nav-badge">{{ item.badge }}</span>
            </router-link>
          </div>
        </transition>
      </div>
    </div>

    <!-- Buton retractare -->
    <button class="sidebar-toggle" @click="collapsed = !collapsed" :title="collapsed ? 'Extinde' : 'Restrânge'">
      <span :class="['toggle-icon', collapsed ? 'toggle-icon--right' : '']">←</span>
    </button>
  </div>
</template>

<script>
import { INSTITUTION_ONCE as INSTITUTION } from '@/api.js'

// ─── Definiții navigare ────────────────────────────────────────────────────

const PLANIFICARE_BASE = [
  { name: 'Catalog',               path: '/planificare/catalog',      faIcon: 'fas fa-shopping-cart', key: 'products' },
  { name: 'Propuneri de nevoi',    path: '/planificare/nevoi',        faIcon: 'fas fa-clipboard-list', key: 'needs' },
  { name: 'Referate necesitate',   path: '/planificare/referate',     faIcon: 'fas fa-file-alt',      key: 'needReference' },
  { name: 'PAAP',                  path: '/planificare/paap',         faIcon: 'fas fa-book',          key: 'paap' },
]

// Item dinamic avizare — inserat la poziția 1 (după Catalog) dacă instituția are approveMode
const AVIZARE_ITEM = (avizoMode) => ({
  name: avizoMode ? 'Avizare & Aprobare' : 'Aprobări',
  path: '/planificare/avizare-aprobare',
  faIcon: 'fas fa-bezier-curve',
  key: 'needs'
})

const ADMINISTRARE_SUPERADMIN = [
  { name: 'Catalog',                          path: '/administrare/catalog',                    faIcon: 'fas fa-shopping-cart',    key: 'products' },
  { name: 'Instituții',                       path: '/administrare/institutii',                 faIcon: 'fas fa-university',       key: 'institutions' },
  { name: 'Structuri organizatorice',         path: '/administrare/departamente',               faIcon: 'fas fa-sitemap',          key: 'departments' },
  { name: 'Utilizatori',                      path: '/administrare/utilizatori',                faIcon: 'fas fa-users',            key: 'usersManagement' },
  { name: 'Roluri utilizatori',               path: '/administrare/roluri-utilizatori',         faIcon: 'fas fa-user-tag',         key: 'usersManagement' },
]

const NOMENCLATOARE_SUPERADMIN = [
  { name: 'Clasificație bugetare',            path: '/administrare/clasificatie_bugetare',      faIcon: 'fas fa-chart-bar',        key: 'bugetare' },
  { name: 'Categorii CPV',                    path: '/administrare/categorii_cpv',              faIcon: 'fas fa-list-alt',         key: 'cpvCategories' },
  { name: 'Registrul pragurilor',             path: '/administrare/registrul_pragurilor',       faIcon: 'fas fa-book',             key: 'register' },
  { name: 'Unități de măsură',               path: '/administrare/unitati_masura',             faIcon: 'fas fa-ruler',            key: 'measurmentUnits' },
  { name: 'Surse de finanțare',              path: '/administrare/surse_finantare',            faIcon: 'fas fa-donate',           key: 'financing' },
  { name: 'Tipuri contracte',                 path: '/administrare/tipuri_contracte',           faIcon: 'fas fa-file-contract',    key: 'contract' },
  { name: 'Tipuri de proceduri',              path: '/administrare/tip_proceduri',              faIcon: 'fas fa-procedures',       key: 'procedureTypes' },
  { name: 'Tipuri structuri organizatorice',  path: '/administrare/tipuri-structuri-organizatorice', faIcon: 'fas fa-sitemap',   key: 'organizationalStructureTypes' },
  { name: 'Tipuri de instituții',            path: '/administrare/tipuri-de-institutii',       faIcon: 'fas fa-building',         key: 'institutionTypes' },
  { name: 'Tipuri ordonatori de credite',     path: '/administrare/ordonatori-credite',         faIcon: 'fas fa-credit-card',      key: 'creditOrdererTypes' },
  { name: 'Configurare achiziții',           path: '/administrare/configurare-achizitii',      faIcon: 'fas fa-cogs',             key: 'achizitiiConfig' },
]

const PROFIL_INSTITUTIE_ADMIN = [
  { name: 'Instituție',                       path: '/administrare/institutie',                 faIcon: 'fas fa-university',       key: 'institution' },
  { name: 'Structuri organizatorice',         path: '/administrare/departamente',               faIcon: 'fas fa-sitemap',          key: 'departments' },
  { name: 'Utilizatori',                      path: '/administrare/utilizatori',                faIcon: 'fas fa-users',            key: 'usersManagement' },
  { name: 'Roluri utilizatori',               path: '/administrare/roluri-utilizatori',         faIcon: 'fas fa-user-tag',         key: 'usersManagement' },
]

const INSTRUMENTE_ADMIN = [
  { name: 'Catalog',                          path: '/administrare/catalog',                    faIcon: 'fas fa-shopping-cart',    key: 'products' },
  { name: 'Obiective instituție',            path: '/administrare/obiective-institutie',         faIcon: 'fas fa-bullseye',         key: 'institutionObjectives' },
  { name: 'Obiective anuale',                 path: '/administrare/obiective-anuale',            faIcon: 'fas fa-bullseye',         key: 'annualInstitutionObjectives' },
]

export default {
  name: 'AppSidebar',

  data() {
    return {
      collapsed: false,
      openGroupIndex: 0,
      // Cache avizare: { institutionId, approveMode, avizoMode }
      avizoCache: null,
      avizoLoading: false
    }
  },

  computed: {
    userRole() {
      return window.$getRoleAll?.()?.role || this.$store?.getters?.userRole?.role || ''
    },
    userInstitutionId() {
      return window.$getRoleAll?.()?.institutionId || this.$store?.getters?.userInstitution?.institutionId || null
    },
    currentNavigation() {
      // Extrage sectiunea din path: /planificare/... → 'planificare'
      const parts = this.$route?.path?.split('/').filter(Boolean)
      return parts?.[0] || ''
    },
    isSuperadmin() { return this.userRole === 'superadmin' },
    isAdmin()      { return this.userRole === 'admin_institutie' },

    visibleGroups() {
      const nav = this.currentNavigation
      const storePerms = this.$store?.getters?.PERMISIONS || {}
      // Fallback: calculeaza permisiunile direct din roleData daca store-ul e gol
      const role = this.userRole
      const isSuperadmin = role === 'superadmin'
      const isAdmin = role === 'admin_institutie'
      const hasPlanningAccess = ['angajat', 'supervisor', 'sef_institutie', 'responsabil_achizitii', 'supervizor_achizitii'].includes(role)
      const canPaap = ['responsabil_achizitii', 'supervizor_achizitii', 'responsabil_buget'].includes(role)
      const canNeedReference = ['angajat', 'supervisor', 'sef_institutie', 'responsabil_buget', 'responsabil_achizitii', 'supervizor_achizitii'].includes(role)
      const localPerms = {
        products: isSuperadmin || hasPlanningAccess,
        needs: hasPlanningAccess,
        needReference: canNeedReference,
        paap: canPaap,
        nomenclatoare: isSuperadmin,
        institutii: isSuperadmin || isAdmin,
        utilizatori: isSuperadmin || isAdmin,
        obiective: isAdmin,
      }
      const perms = Object.keys(storePerms).length > 0 ? storePerms : localPerms

      if (nav === 'planificare') {
        return this.buildPlanificareGroups(perms)
      }

      if (nav === 'atribuire') {
        return this.buildAtribuireGroups()
      }

      if (nav === 'administrare') {
        return this.buildAdministrareGroups(perms)
      }

      // Fallback pentru rute gen /profil, /home etc — afisam meniul default al rolului
      if (this.isSuperadmin) {
        return this.buildAdministrareGroups(perms)
      }
      if (this.isAdmin) {
        return this.buildAdministrareGroups(perms)
      }
      // Roluri cu acces la planificare
      if (['angajat', 'supervisor', 'sef_institutie', 'responsabil_achizitii', 'supervizor_achizitii', 'responsabil_buget'].includes(this.userRole)) {
        return this.buildPlanificareGroups(perms)
      }

      return []
    }
  },

  watch: {
    // Când utilizatorul intră în planificare, încarcă configurarea avizare
    currentNavigation: {
      immediate: true,
      handler(nav) {
        if (nav === 'planificare') {
          this.loadAvizoConfig()
        }
      }
    },
    // Resetează grupul deschis la schimbarea navigării
    '$route.path': {
      handler() {
        this.setActiveGroup()
      }
    }
  },

  methods: {
    // ── Avizare config ───────────────────────────────────────────
    async loadAvizoConfig() {
      const instId = this.userInstitutionId
      if (!instId) return
      // Folosim cache — nu reîncărcăm dacă deja avem pentru aceeași instituție
      if (this.avizoCache?.institutionId === instId) return
      if (this.avizoLoading) return

      this.avizoLoading = true
      try {
        const res = await INSTITUTION(instId)
        const data = await res.json()
        const result = data?.data?.result

        if (result) {
          this.avizoCache = {
            institutionId: instId,
            approveMode: !!result.approveMode,
            avizoMode: !!result.avizoMode
          }
        } else {
          this.avizoCache = { institutionId: instId, approveMode: false, avizoMode: false }
        }
      } catch(e) {
        this.avizoCache = { institutionId: instId, approveMode: false, avizoMode: false }
      }
      this.avizoLoading = false
    },

    // ── Construire grupuri PLANIFICARE ───────────────────────────
    buildAtribuireGroups() {
      const procedureTypes = this.$store?.getters?.procedureTypes || {}
      const items = Object.entries(procedureTypes).map(([key, val]) => ({
        name: val.name,
        path: `/atribuire/procedura/${key}`,
        faIcon: 'fas fa-list-ul',
        count: val.count || 0
      }))
      return [{ name: 'ATRIBUIRE', items }]
    },

    buildPlanificareGroups(perms) {
      // Items de bază cu filtrare permisiuni
      let items = PLANIFICARE_BASE.filter(item => !item.key || perms[item.key] !== false)

      // Inserare item avizare dacă instituția are approveMode activ
      // Poziția 1 = după Catalog (index 0)
      if (this.avizoCache?.approveMode) {
        const avizoItem = AVIZARE_ITEM(this.avizoCache.avizoMode)
        if (!items.key || perms['needs'] !== false) {
          items.splice(1, 0, avizoItem)
        }
      }

      return [{ name: 'PLANIFICARE', items }]
    },

    // ── Construire grupuri ADMINISTRARE ──────────────────────────
    buildAdministrareGroups(perms) {
      if (this.isSuperadmin) {
        const administrareItems = ADMINISTRARE_SUPERADMIN.filter(i => !i.key || perms[i.key] !== false)
        const nomenclatoareItems = NOMENCLATOARE_SUPERADMIN.filter(i => !i.key || perms[i.key] !== false)

        const groups = []
        if (administrareItems.length) groups.push({ name: 'ADMINISTRARE', items: administrareItems })
        if (nomenclatoareItems.length) groups.push({ name: 'NOMENCLATOARE', items: nomenclatoareItems })
        return groups
      }

      if (this.isAdmin) {
        const profilItems = PROFIL_INSTITUTIE_ADMIN.filter(i => !i.key || perms[i.key] !== false)
        const instrItems  = INSTRUMENTE_ADMIN.filter(i => !i.key || perms[i.key] !== false)

        const groups = []
        if (profilItems.length) groups.push({ name: 'PROFIL INSTITUȚIE', items: profilItems })
        if (instrItems.length)  groups.push({ name: 'INSTRUMENTE', items: instrItems })
        return groups
      }

      return []
    },

    // ── Accordion ────────────────────────────────────────────────
    toggleGroup(index) {
      // Accordion: dacă dai click pe grupul deschis, nu-l închidem
      // (UX mai bun — utilizatorul știe mereu unde e)
      if (this.openGroupIndex !== index) {
        this.openGroupIndex = index
      }
    },

    setActiveGroup() {
      const path = this.$route?.path || ''
      const groups = this.visibleGroups
      for (let i = 0; i < groups.length; i++) {
        if (groups[i].items.some(item => path.startsWith(item.path))) {
          this.openGroupIndex = i
          return
        }
      }
    },

    isActive(itemPath) {
      const currentPath = this.$route?.path || ''
      return currentPath === itemPath || currentPath.startsWith(itemPath + '/')
    },

    onNavClick() {
      // Pe mobil, colapsăm sidebar-ul după click
      if (window.innerWidth < 768) {
        this.collapsed = true
      }
    }
  },

  mounted() {
    this.setActiveGroup()
  }
}
</script>

<style scoped>
.sidebar {
  width: 240px;
  min-width: 240px;
  background: white;
  border-right: 1px solid #e8eaf0;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: width 0.2s ease, min-width 0.2s ease;
  overflow: hidden;
  font-family: 'Roboto', sans-serif;
}

.sidebar--collapsed {
  width: 56px;
  min-width: 56px;
}

/* ── Grupuri ── */
.sidebar-groups {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0.5rem 0;
}

.sidebar-group {
  margin-bottom: 2px;
}

.group-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.55rem 1rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #9e9e9e;
  text-transform: uppercase;
  transition: background 0.15s;
  white-space: nowrap;
}

.group-header:hover {
  background: #f5f7ff;
  color: #1565C0;
}

.group-chevron {
  font-size: 1rem;
  transition: transform 0.2s;
  display: inline-block;
}

.group-chevron--open {
  transform: rotate(90deg);
}

/* ── Items ── */
.group-items {
  overflow: hidden;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.55rem 0.85rem 0.55rem 1.1rem;
  text-decoration: none;
  color: #444;
  font-size: 0.875rem;
  border-radius: 0;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
  border-left: 3px solid transparent;
  position: relative;
}

.nav-item:hover {
  background: #f0f4ff;
  color: #1565C0;
}

.nav-item--active {
  background: #e8f0fd;
  color: #1565C0;
  font-weight: 500;
  border-left-color: #1565C0;
}

.nav-icon {
  width: 20px;
  text-align: center;
  font-size: 0.9rem;
  flex-shrink: 0;
  color: inherit;
}

.nav-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-badge {
  background: #1565C0;
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

/* ── Slide animation ── */
.slide-enter-active,
.slide-leave-active {
  transition: max-height 0.2s ease, opacity 0.2s ease;
  max-height: 400px;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}

/* ── Toggle buton ── */
.sidebar-toggle {
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  border-top: 1px solid #e8eaf0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  color: #888;
  transition: background 0.15s, color 0.15s;
}

.sidebar-toggle:hover {
  background: #f5f7ff;
  color: #1565C0;
}

.toggle-icon {
  font-size: 1rem;
  display: inline-block;
  transition: transform 0.2s;
}

.toggle-icon--right {
  transform: rotate(180deg);
}

/* ── Collapsed state ── */
.sidebar--collapsed .nav-item {
  padding: 0.55rem 0;
  justify-content: center;
}

.sidebar--collapsed .group-header {
  padding: 0.55rem 0;
  justify-content: center;
}

.sidebar--collapsed .sidebar-toggle {
  justify-content: center;
}
</style>
