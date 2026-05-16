import { createRouter, createWebHistory } from 'vue-router'

// ── Auth ──
import Login from '@/views/Login.vue'
import ForgotPassword from '@/views/ForgotPassword.vue'
import SetPassword from '@/views/SetPassword.vue'

// ── Layout ──
import MainLayout from '@/layouts/MainLayout.vue'

// ── Home ──
import Home from '@/views/Home.vue'

// ── Profil utilizator ──
import ProfilUtilizator from '@/views/ProfilUtilizator.vue'

// ── Administrare Superadmin ──
import Catalog from '@/views/Catalog.vue'
import Institutions from '@/views/Institutions.vue'
import Departments from '@/views/Departments.vue'
import Users from '@/views/Users.vue'
import UsersRolesView from '@/views/UsersRolesView.vue'

// ── Nomenclatoare ──
import Bugetare from '@/views/Bugetare.vue'
import CategoriiCpv from '@/views/Categorii_cpv.vue'
import Registru from '@/views/Registru.vue'
import UnitatiMasura from '@/views/UnitatiMasura.vue'
import ProjectFinancingSources from '@/views/ProjectFinancingSources.vue'
import ContractTypes from '@/views/ContractTypes.vue'
import ProcedureType from '@/views/ProcedureType.vue'
import OrganizationalStructureTypeView from '@/views/OrganizationalStructureTypeView.vue'
import InstitutionTypeView from '@/views/InstitutionTypeView.vue'
import CreditOrdererTypeView from '@/views/CreditOrdererTypeView.vue'
import AcquisitionConfig from '@/views/AcquisitionConfig.vue'

// ── Admin instituție ──
import InstitutionAdmin from '@/views/InstitutionAdmin.vue'
import InstitutionObjectives from '@/views/InstitutionObjectives.vue'
import AnnualInstitutionObjectives from '@/views/AnnualInstitutionObjectives.vue'

// ── Planificare ──
import Needs from '@/views/Needs.vue'

const routes = [
  // ── Pagini publice (fara layout) ──
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { public: true }
  },
  {
    path: '/forgot/password',
    name: 'ForgotPassword',
    component: ForgotPassword,
    meta: { public: true }
  },
  {
    // Activare cont prima dată (link din emailul de activare)
    path: '/password/set/:token/:email',
    name: 'ActivateAccount',
    component: SetPassword,
    meta: { public: true, firstReset: true }
  },
  {
    // Resetare parolă (link din emailul de resetare)
    path: '/password/reset/:token/:email',
    name: 'ResetPassword',
    component: SetPassword,
    meta: { public: true, firstReset: false }
  },

  // ── Aplicatie (cu layout) ──
  {
    path: '/',
    component: MainLayout,
    children: [

      // ── Profil utilizator ──
      {
        path: 'profil',
        name: 'Profil',
        component: ProfilUtilizator
      },

      // ── Administrare Superadmin ──
      {
        path: 'administrare/catalog',
        name: 'Catalog',
        component: Catalog
      },
      {
        path: 'administrare/institutii',
        name: 'Instituții',
        component: Institutions
      },
      {
        path: 'administrare/departamente',
        name: 'Structuri organizatorice',
        component: Departments
      },
      {
        path: 'administrare/utilizatori',
        name: 'Utilizatori',
        component: Users
      },
      {
        path: 'administrare/roluri-utilizatori',
        name: 'Roluri utilizatori',
        component: UsersRolesView
      },

      // ── Nomenclatoare ──
      {
        path: 'administrare/clasificatie_bugetare',
        name: 'Clasificație bugetare',
        component: Bugetare
      },
      {
        path: 'administrare/categorii_cpv',
        name: 'Categorii CPV',
        component: CategoriiCpv
      },
      {
        path: 'administrare/registrul_pragurilor',
        name: 'Registrul pragurilor',
        component: Registru
      },
      {
        path: 'administrare/unitati_masura',
        name: 'Unități de măsură',
        component: UnitatiMasura
      },
      {
        path: 'administrare/surse_finantare',
        name: 'Surse de finanțare',
        component: ProjectFinancingSources
      },
      {
        path: 'administrare/tipuri_contracte',
        name: 'Tipuri contracte',
        component: ContractTypes
      },
      {
        path: 'administrare/tip_proceduri',
        name: 'Tipuri de proceduri',
        component: ProcedureType
      },
      {
        path: 'administrare/tipuri-structuri-organizatorice',
        name: 'Tipuri structuri organizatorice',
        component: OrganizationalStructureTypeView
      },
      {
        path: 'administrare/tipuri-de-institutii',
        name: 'Tipuri de instituții',
        component: InstitutionTypeView
      },
      {
        path: 'administrare/ordonatori-credite',
        name: 'Tipuri ordonatori de credite',
        component: CreditOrdererTypeView
      },
      {
        path: 'administrare/configurare-achizitii',
        name: 'Configurare achiziții',
        component: AcquisitionConfig
      },

      // ── Admin instituție ──
      {
        path: 'administrare/institutie',
        name: 'Profil instituție',
        component: InstitutionAdmin
      },
      {
        path: 'administrare/obiective-institutie',
        name: 'Obiective instituție',
        component: InstitutionObjectives
      },
      {
        path: 'administrare/obiective-anuale',
        name: 'Obiective anuale',
        component: AnnualInstitutionObjectives
      },

      // ── Planificare ──
      {
        path: 'planificare/catalog',
        name: 'Catalog planificare',
        component: Catalog
      },
      {
        path: 'planificare/nevoi',
        name: 'Propuneri de nevoi',
        component: Needs
      },
      {
        path: 'planificare/referate',
        name: 'Referate necesitate',
        component: () => import('@/views/Needs.vue')
      },
      {
        path: 'planificare/paap',
        name: 'PAAP',
        component: () => import('@/views/Paap.vue')
      },
      {
        path: 'planificare/paap/:id/centralizare',
        name: 'PAAP Centralizare',
        component: () => import('@/views/PaapCentralization.vue')
      },
      {
        path: 'planificare/avizare-aprobare',
        name: 'Avizare și aprobare',
        component: () => import('@/views/Needs.vue')
      },
      {
        path: 'planificare/utilizatori',
        name: 'Utilizatori planificare',
        component: Users
      },
      {
        path: 'planificare/departamente',
        name: 'Departamente planificare',
        component: Departments
      },

      // ── Home ──
      {
        path: 'home',
        name: 'Home',
        component: Home
      },

      // ── Atribuire ──
      {
        path: 'atribuire/procedura/:procedureType',
        name: 'Atribuire',
        component: () => import('@/views/Assignments.vue')
      },
      {
        path: 'atribuire/procedura/:procedureType/:centralization',
        name: 'Atribuire referate',
        component: () => import('@/views/AssignmentsNeedReferences.vue')
      },
      {
        path: 'atribuire/procedura/:procedureType/:centralization/achizitii',
        name: 'Achiziții',
        component: () => import('@/views/Acquisitions.vue')
      },
      {
        path: 'atribuire/procedura/:procedureType/:centralization/proces-verbal',
        name: 'Procese verbale',
        component: () => import('@/views/VerbalProcess.vue')
      },
      {
        path: 'atribuire/procedura/:procedureType/:centralization/anunt',
        name: 'Anunțuri',
        component: () => import('@/views/Announcement.vue')
      },

      // ── Monitorizare ──
      {
        path: 'monitorizare',
        name: 'Monitorizare',
        component: () => import('@/views/Needs.vue')
      },

      // ── Redirect implicit bazat pe rol ──
      {
        path: '',
        redirect: () => {
          const role = window.$getRoleAll?.()?.role || ''
          const homeRoles = ['responsabil_achizitii', 'supervizor_achizitii']
          if (homeRoles.includes(role)) return '/home'
          return '/administrare/catalog'
        }
      }
    ]
  },

  // ── Catch-all → login ──
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

// ── Guard autentificare ──
router.beforeEach((to, from, next) => {
  const isPublic = to.meta?.public === true
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')

  if (!isPublic && !token) {
    next('/login')
  } else if (isPublic && token) {
    next('/')
  } else {
    next()
  }
})

export default router
