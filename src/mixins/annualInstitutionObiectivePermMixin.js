export default {
  computed: {
    PERMISIONS() {
      const role = window.$getRoleAll?.()?.role || ''
      const isAdmin = role === 'admin_institutie'
      return {
        list: isAdmin,
        create: isAdmin,
        edit: isAdmin,
        delete: isAdmin
      }
    }
  }
}
