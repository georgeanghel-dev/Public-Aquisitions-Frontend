// needsPermMixin — permisiuni pentru modulul Nevoi
export default {
  computed: {
    PERMISIONS() {
      const role = window.$getRoleAll?.()?.role || ''

      // Roluri cu acces la modulul de planificare (fără responsabil_buget și fără superadmin/admin)
      const hasPlanningAccess = ['angajat', 'supervisor', 'sef_institutie', 'responsabil_achizitii', 'supervizor_achizitii'].includes(role)

      // Poate confirma/respinge nevoi
      const canConfirm = ['sef_institutie', 'responsabil_achizitii', 'supervizor_achizitii', 'supervisor'].includes(role)

      // Poate conexa nevoi proprii (angajat, supervisor) — responsabil/supervizor achizitii în așteptare clarificare backend
      const canConexe = ['angajat', 'supervisor'].includes(role)

      // Acces PAAP — doar responsabil_achizitii și supervizor_achizitii
      const canPaap = ['responsabil_achizitii', 'supervizor_achizitii'].includes(role)

      return {
        list: hasPlanningAccess,
        view: hasPlanningAccess,
        create: hasPlanningAccess,
        edit: hasPlanningAccess,
        delete: hasPlanningAccess,
        confirm: canConfirm,
        reject: canConfirm,
        conexe: canConexe,
        paap: canPaap
      }
    }
  }
}
