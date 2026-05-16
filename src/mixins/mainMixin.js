// mainMixin — funcții utilitare comune
export default {
  methods: {
    isObject(val) { return val !== null && typeof val === 'object' && !Array.isArray(val) },
    isString(val) { return typeof val === 'string' },
    isArray(val) { return Array.isArray(val) },
    isNumber(val) { return typeof val === 'number' },
    makeid(length = 8) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    },
    checkHttpStatusCode(code) { return String(code)?.[0] === '2' },
    checkOwner(permission, uuid) {
      if (permission === true) return true
      if (permission === 'owner') return uuid === this.$store?.getters?.userId
      return false
    },
    checkParamsInObj(obj, params) {
      if (!obj || !params) return false
      return params.some(p => obj[p])
    },
    formatDate(date) {
      if (!date) return '—'
      return new Date(date).toLocaleDateString('ro-RO')
    },
    simulateLoad(cb) { this.$nextTick(() => cb?.()) },
    setSafeLoad() {},
    setLoad() {},
    imgLoaded() {}
  }
}
