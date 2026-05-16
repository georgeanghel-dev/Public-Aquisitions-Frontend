<template>
  <NomenclatorView
    title="Surse de finanțare"
    :columns="columns"
    :formFields="formFields"
    :apiFns="apiFns"
    :permissions="permissions"
  />
</template>

<script>
import NomenclatorView from '@/components/NomenclatorView.vue'
import { FINANCING } from '@/api.js'
import PermisionsMixin from '@/mixins/boudgetFinancingPermMixin.js'

export default {
  name: 'ProjectFinancingSources',
  mixins: [PermisionsMixin],
  components: { NomenclatorView },
  data() {
    return {
      columns: [
        { key: 'sourceName', label: 'DENUMIRE SURSĂ FINANȚARE' }
      ],
      formFields: [
        { key: 'sourceName', label: 'Denumire sursă finanțare', required: true }
      ],
      apiFns: {
        list:   (page, limit, q) => FINANCING.get(page, limit, q),
        add:    (data)     => FINANCING.add(data),
        edit:   (id, data) => FINANCING.edit(id, data),
        delete: (id)       => FINANCING.delete(id)
      }
    }
  },
  computed: {
    permissions() {
      return {
        list:   this.PERMISIONS.list,
        create: this.PERMISIONS.create,
        edit:   this.PERMISIONS.edit,
        delete: this.PERMISIONS.delete
      }
    }
  }
}
</script>
