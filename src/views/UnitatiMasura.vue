<template>
  <NomenclatorView
    title="Unități de măsură"
    :columns="columns"
    :formFields="formFields"
    :apiFns="apiFns"
    :permissions="permissions"
  />
</template>

<script>
import NomenclatorView from '@/components/NomenclatorView.vue'
import {
  MEASUREMENT_UNIT_PAGINATED, MEASUREMENT_UNIT_ADD,
  MEASUREMENT_UNIT_MODIFY, MEASUREMENT_UNIT_DELETE
} from '@/api.js'
import PermisionsMixin from '@/mixins/measurmentUnitPermMixin.js'

export default {
  name: 'UnitatiMasura',
  mixins: [PermisionsMixin],
  components: { NomenclatorView },
  data() {
    return {
      columns: [
        { key: 'shortName',   label: 'DENUMIRE UNITATE DE MĂSURĂ' },
        { key: 'description', label: 'DESCRIERE' }
      ],
      formFields: [
        { key: 'shortName',   label: 'Denumire unitate de măsură', required: true },
        { key: 'description', label: 'Descriere unitate de măsură', type: 'textarea' }
      ],
      apiFns: {
        list:   (page, limit, q) => MEASUREMENT_UNIT_PAGINATED(page, limit, q),
        add:    (data)     => MEASUREMENT_UNIT_ADD(data),
        edit:   (id, data) => MEASUREMENT_UNIT_MODIFY(id, data),
        delete: (id)       => MEASUREMENT_UNIT_DELETE(id)
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
