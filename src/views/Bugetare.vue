<template>
  <NomenclatorView
    title="Clasificație bugetare"
    :columns="columns"
    :formFields="formFields"
    :apiFns="apiFns"
    :permissions="permissions"
  />
</template>

<script>
import NomenclatorView from '@/components/NomenclatorView.vue'
import { BUGETARE } from '@/api.js'
import PermisionsMixin from '@/mixins/bugetarePermMixin.js'

const BUDGET_TYPE_LABELS = {
  economic:   'Economică',
  functional: 'Funcțională'
}

export default {
  name: 'Bugetare',
  mixins: [PermisionsMixin],
  components: { NomenclatorView },
  data() {
    return {
      columns: [
        { key: 'titlu', label: 'TITLU' },
        { key: 'name',  label: 'DENUMIRE INDICATORI' },
        {
          key: 'type', label: 'TIPUL',
          // Transformăm valoarea internă în label lizibil în tabel
          render: (val) => BUDGET_TYPE_LABELS[val] || val || '-'
        }
      ],
      formFields: [
        { key: 'titlu', label: 'Titlu',               required: true },
        { key: 'name',  label: 'Denumire indicatori', required: true },
        {
          key: 'type', label: 'Tipul', required: true,
          type: 'select',
          options: [
            { id: 'economic',   name: 'Economică' },
            { id: 'functional', name: 'Funcțională' }
          ]
        }
      ],
      apiFns: {
        list:   (page, limit, q) => BUGETARE.get(page, limit, q),
        add:    (data)     => BUGETARE.add(data),
        edit:   (id, data) => BUGETARE.edit(id, data),
        delete: (id)       => BUGETARE.delete(id)
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
