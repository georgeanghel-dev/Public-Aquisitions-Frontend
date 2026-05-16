import { createStore } from 'vuex'

export default createStore({
  state: {
    user: null,
    token: localStorage.getItem('token') || null,
    roleData: JSON.parse(localStorage.getItem('roleData') || 'null'),
    procedureTypes: null
  },
  getters: {
    userId: state => state.user?.id,
    userRole: state => state.roleData,
    userInstitution: state => state.roleData,
    isLoggedIn: state => !!state.token,
    procedureTypes: state => state.procedureTypes,

    PERMISIONS: state => {
      const role = state.roleData?.role || ''

      const isSuperadmin = role === 'superadmin'
      const isAdmin = role === 'admin_institutie'
      const hasPlanningAccess = ['angajat', 'supervisor', 'sef_institutie', 'responsabil_achizitii', 'supervizor_achizitii'].includes(role)
      const canConfirm = ['sef_institutie', 'responsabil_achizitii', 'supervizor_achizitii', 'supervisor'].includes(role)
      const canConexe = ['angajat', 'supervisor'].includes(role)
      const canPaap = ['responsabil_achizitii', 'supervizor_achizitii', 'responsabil_buget'].includes(role)
      const canNeedReference = ['angajat', 'supervisor', 'sef_institutie', 'responsabil_buget', 'responsabil_achizitii', 'supervizor_achizitii'].includes(role)

      return {
        list: hasPlanningAccess,
        view: hasPlanningAccess,
        create: hasPlanningAccess,
        edit: hasPlanningAccess,
        delete: hasPlanningAccess,
        confirm: canConfirm,
        reject: canConfirm,
        conexe: canConexe,
        needs: hasPlanningAccess,
        products: isSuperadmin || hasPlanningAccess,
        paap: canPaap,
        needReference: canNeedReference,
        nomenclatoare: isSuperadmin,
        institutii: isSuperadmin || isAdmin,
        utilizatori: isSuperadmin || isAdmin,
        obiective: isAdmin
      }
    }
  },
  mutations: {
    SET_USER(state, user) { state.user = user },
    SET_TOKEN(state, token) {
      state.token = token
      if (token) localStorage.setItem('token', token)
      else localStorage.removeItem('token')
    },
    SET_ROLE_DATA(state, data) {
      state.roleData = data
      if (data) localStorage.setItem('roleData', JSON.stringify(data))
      else localStorage.removeItem('roleData')
    },
    SET_PROCEDURE_TYPES(state, data) { state.procedureTypes = data }
  },
  actions: {
    login({ commit }, { token, user }) {
      commit('SET_TOKEN', token)
      commit('SET_USER', user)
    },
    logout({ commit }) {
      commit('SET_TOKEN', null)
      commit('SET_USER', null)
      commit('SET_ROLE_DATA', null)
    }
  }
})
