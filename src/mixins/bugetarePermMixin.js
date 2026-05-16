export default {
  computed: {
    PERMISIONS() {
      const role = window.$getRoleAll?.()?.role || ''
      const isSuperadmin = role === 'superadmin'
      return {
        list: isSuperadmin,
        create: isSuperadmin,
        edit: isSuperadmin,
        delete: isSuperadmin
      }
    }
  }
}
