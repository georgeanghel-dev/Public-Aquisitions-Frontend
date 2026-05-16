<template>
  <NomenclatorView
    title="Tipuri de ordonatori de credite"
    :columns="columns"
    :formFields="formFields"
    :apiFns="apiFns"
    :permissions="permissions"
  />
</template>

<script>
import NomenclatorView from '@/components/NomenclatorView.vue'
import { CREDIT_ORDERER_TYPE } from '@/api.js'
import PermisionsMixin from '@/mixins/creditOrdererTypePermMixin.js'

export default {
  name: 'CreditOrdererTypeView',
  mixins: [PermisionsMixin],
  components: { NomenclatorView },
  data() {
    return {
      columns: [
        { key: 'name',   label: 'NUME' },
        // parent = boolean: true înseamnă că este creditor principal
        { key: 'parent', label: 'CREDITOR PRINCIPAL', type: 'boolean', filterable: false }
      ],
      formFields: [
        { key: 'name',   label: 'Nume',                  required: true },
        // Câmp checkbox — NomenclatorView îl tratează ca boolean
        { key: 'parent', label: 'Este creditor principal?', type: 'checkbox' }
      ],
      apiFns: {
        list:   (page, limit, q) => CREDIT_ORDERER_TYPE.get(page, limit, q),
        add:    (data)     => CREDIT_ORDERER_TYPE.add(data),
        edit:   (id, data) => CREDIT_ORDERER_TYPE.edit(id, data),
        delete: (id)       => CREDIT_ORDERER_TYPE.delete(id)
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
