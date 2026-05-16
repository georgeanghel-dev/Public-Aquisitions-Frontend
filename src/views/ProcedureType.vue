<template>
  <NomenclatorView
    title="Tipuri de proceduri"
    :columns="columns"
    :formFields="formFields"
    :apiFns="apiFns"
    :permissions="permissions"
  />
</template>

<script>
import NomenclatorView from '@/components/NomenclatorView.vue'
import { PROCEDURE_TYPE_PAGINATED, PROCEDURE_TYPE_ADD, PROCEDURE_TYPE_MODIFY, PROCEDURE_TYPE_DELETE } from '@/api.js'
import PermisionsMixin from '@/mixins/procedureTypePermMixin.js'

export default {
  name: 'ProcedureType',
  mixins: [PermisionsMixin],
  components: { NomenclatorView },
  data() {
    return {
      columns: [
        { key: 'name',        label: 'DENUMIRE TIP DE PROCEDURĂ' },
        { key: 'description', label: 'DESCRIERE TIP DE PROCEDURĂ' }
      ],
      formFields: [
        { key: 'name',        label: 'Denumire tip procedură', required: true },
        { key: 'description', label: 'Descriere tip procedură', type: 'textarea' }
      ],
      apiFns: {
        list:   (page, limit, q) => PROCEDURE_TYPE_PAGINATED(page, limit, q),
        add:    (data)     => PROCEDURE_TYPE_ADD(data),
        edit:   (id, data) => PROCEDURE_TYPE_MODIFY(id, data),
        delete: (id)       => PROCEDURE_TYPE_DELETE(id)
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
