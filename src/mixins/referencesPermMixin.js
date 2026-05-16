// referencesPermMixin — permisiuni pentru modulul Referate de necesitate
export default {
  computed: {
    PERMISIONS() {
      const roleData = window.$getRoleAll?.() || {}
      const role = roleData?.role || ''

      // Roluri cu acces la modulul de planificare
      const hasPlanningAccess = ['angajat', 'supervisor', 'sef_institutie', 'responsabil_buget', 'responsabil_achizitii', 'supervizor_achizitii'].includes(role)

      // Poate crea și edita referate
      const canCreate = ['angajat', 'supervisor', 'sef_institutie', 'responsabil_achizitii', 'supervizor_achizitii'].includes(role)

      // Vizualizare toate referatele instituției
      const canViewAll = ['sef_institutie', 'responsabil_achizitii', 'supervizor_achizitii'].includes(role)

      // Completare PAAP / clasificație bugetară
      const canComplete = ['supervizor_achizitii', 'responsabil_buget'].includes(role)

      // Aprobare / respingere finală
      const canApprove = ['sef_institutie'].includes(role)

      return {
        list: hasPlanningAccess,
        view: hasPlanningAccess,
        create: canCreate,
        edit: canCreate,
        delete: canCreate,
        viewAll: canViewAll,
        complete: canComplete,
        approve: canApprove,
        reject: canApprove
      }
    }
  }
}
