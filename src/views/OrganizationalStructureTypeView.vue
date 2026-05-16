<template>
  <NomenclatorView
    title="Tipuri de structuri organizatorice"
    :columns="columns"
    :formFields="formFields"
    :apiFns="apiFns"
    :permissions="permissions"
  />
</template>

<script>
import NomenclatorView from '@/components/NomenclatorView.vue'
import { ORGANIZATIONAL_STRUCTURE_TYPE } from '@/api.js'
import PermisionsMixin from '@/mixins/organizationalStructureTypePermMixin.js'

export default {
  name: 'OrganizationalStructureTypeView',
  mixins: [PermisionsMixin],
  components: { NomenclatorView },
  data() {
    return {
      columns: [
        { key: 'name', label: 'NUME' }
      ],
      formFields: [
        { key: 'name', label: 'Nume', required: true }
      ],
      apiFns: {
        list:   (page, limit, q) => ORGANIZATIONAL_STRUCTURE_TYPE.get(page, limit, q),
        add:    (data)     => ORGANIZATIONAL_STRUCTURE_TYPE.add(data),
        edit:   (id, data) => ORGANIZATIONAL_STRUCTURE_TYPE.edit(id, data),
        delete: (id)       => ORGANIZATIONAL_STRUCTURE_TYPE.delete(id)
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
