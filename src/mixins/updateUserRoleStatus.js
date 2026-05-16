// updateUserRoleStatus mixin
export default {
  data() { return { currentRoleStatus: null } },
  computed: {
    isSuperadmin() { return window.$getRoleAll?.()?.role === 'superadmin' },
    isAdmin() { return ['admin_institutie'].includes(window.$getRoleAll?.()?.role) },
    isUser() { return !this.isSuperadmin && !this.isAdmin }
  },
  methods: {
    updateRoleStatus() {
      this.currentRoleStatus = window.$getRoleAll?.()?.role || null
    },
    getBeautifiedRole() {
      const roles = {
        superadmin: 'Superadmin', admin_institutie: 'Admin', responsabil_achizitii: 'Responsabil Achiziții',
        supervizor_achizitii: 'Supervizor Achiziții', responsabil_buget: 'Responsabil Buget',
        sef_institutie: 'Șef Instituție', supervisor: 'Supervizor', angajat: 'Angajat'
      }
      return roles[window.$getRoleAll?.()?.role] || 'Utilizator'
    },
    getUserInstitution(returnObj = false) {
      const data = window.$getRoleAll?.()
      if (returnObj) return data
      return data?.institutionId || null
    }
  }
}
