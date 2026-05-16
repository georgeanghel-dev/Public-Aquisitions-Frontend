<template>
  <NomenclatorView
    title="Tipuri Contracte"
    :columns="columns"
    :formFields="formFields"
    :apiFns="apiFns"
    :permissions="permissions"
  />
</template>

<script>
import NomenclatorView from '@/components/NomenclatorView.vue'
import { CONTRACT } from '@/api.js'
import PermisionsMixin from '@/mixins/contractTypesPermMixin.js'

export default {
  name: 'ContractTypes',
  mixins: [PermisionsMixin],
  components: { NomenclatorView },
  data() {
    return {
      columns: [
        { key: 'contractType', label: 'DENUMIRE TIP CONTRACT' }
      ],
      formFields: [
        { key: 'contractType', label: 'Denumire tip contract', required: true }
      ],
      apiFns: {
        list:   (page, limit, q) => CONTRACT.get(page, limit, q),
        add:    (data)     => CONTRACT.add(data),
        edit:   (id, data) => CONTRACT.edit(id, data),
        delete: (id)       => CONTRACT.delete(id)
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
