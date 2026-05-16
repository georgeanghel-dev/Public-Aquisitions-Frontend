<template>
  <div class="page-container">

    <!-- Banner breadcrumb -->
    <div class="page-banner">
      <div class="breadcrumb">
        <span class="breadcrumb-link" @click="$router.push('/')">Acasă</span>
        <span class="breadcrumb-sep">/</span>
        <span>Instituție</span>
        <span class="breadcrumb-sep">/</span>
        <span>Administrare</span>
      </div>
    </div>

    <div class="page-content">
      <h1 class="page-title">Profil instituție</h1>

      <div v-if="loading" class="loading-state">
        <span class="spinner-lg"></span>
        <p>Se încarcă datele instituției...</p>
      </div>

      <div v-else-if="!PERMISIONS.institution" class="access-denied">
        <span class="access-icon">⚠️</span>
        <p>Acces interzis</p>
      </div>

      <!-- Reutilizăm InstitutionsPanel cu datele instituției proprii preîncărcate.
           Action = 'edit' — Adminul nu poate crea instituții noi, doar editează propria instituție. -->
      <InstitutionsPanel
        v-else-if="panelData.data"
        :options="panelData"
        @saved="onSaved"
        @closePanel="onSaved"
      />
    </div>
  </div>
</template>

<script>
import InstitutionsPanel from '@/components/InstitutionsPanel.vue'
import { INSTITUTIONS_PAGINATED } from '@/api.js'

export default {
  name: 'Institution',
  components: { InstitutionsPanel },

  data() {
    return {
      loading: true,
      panelData: { action: 'edit', data: null },
      PERMISIONS: { institution: false }
    }
  },

  methods: {
    async loadInstitution() {
      this.loading = true
      try {
        // Preia instituția proprie din store/sesiune
        const institution = this.$store?.getters?.userInstitution
          || window.$getUserInstitution?.()
          || null

        if (!institution?.id) {
          this.loading = false
          return
        }

        const res = await INSTITUTIONS_PAGINATED(1, 1, null, `eq=id,${institution.id}`)
        const data = await res.json()

        if (Array.isArray(data?.data?.result) && data.data.result.length) {
          this.panelData = { action: 'edit', data: data.data.result[0] }
          this.PERMISIONS.institution = true
        }
      } catch(e) {
        console.error(e)
      }
      this.loading = false
    },

    onSaved() {
      // Reîncarcă datele după salvare
      this.loadInstitution()
    }
  },

  created() {
    this.loadInstitution()
  }
}
</script>

<style scoped>
.page-container { display: flex; flex-direction: column; min-height: 100%; font-family: 'Roboto', sans-serif; }

.page-banner { background: #1565C0; color: white; padding: 0.6rem 1.5rem; }
.breadcrumb { font-size: 0.85rem; }
.breadcrumb-link { cursor: pointer; opacity: 0.85; }
.breadcrumb-link:hover { opacity: 1; text-decoration: underline; }
.breadcrumb-sep { margin: 0 0.4rem; opacity: 0.6; }

.page-content { padding: 1.25rem 1.5rem; flex: 1; }
.page-title { font-size: 1.4rem; font-weight: 600; color: #1a2f4e; margin: 0 0 1.25rem; }

.loading-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 4rem; color: #888; gap: 1rem;
}
.spinner-lg {
  width: 36px; height: 36px; border: 3px solid #e0e8f8;
  border-top-color: #1565C0; border-radius: 50%;
  animation: spin 0.8s linear infinite; display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }

.access-denied {
  display: flex; flex-direction: column; align-items: center;
  padding: 4rem; color: #aaa;
}
.access-icon { font-size: 4rem; margin-bottom: 1rem; }
</style>
