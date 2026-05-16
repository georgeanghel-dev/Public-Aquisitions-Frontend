<template>
  <div class="cpv-select" align="left">

    <!-- ① Codul CPV selectat -->
    <div>
      <h4 style="margin:0.3rem 0 0.6rem;">Codul CPV selectat</h4>
    </div>
    <div style="overflow:auto;">
      <table class="ctb">
        <thead>
          <tr>
            <th style="width:4rem">Nr.</th>
            <th colspan="2">Diviziunea</th>
            <th>Grupul</th>
            <th>Clasa</th>
            <th>Categoria</th>
            <th>Denumire</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!modelValue">
            <td colspan="7" class="td-center"><h4>Nu a fost selectat nimic</h4></td>
          </tr>
          <tr v-else>
            <td style="text-align:center">1</td>
            <td colspan="2">{{ modelValue.division }}</td>
            <td>{{ modelValue.group }}</td>
            <td>{{ modelValue.class }}</td>
            <td>{{ modelValue.category }}</td>
            <td>({{ modelValue.cpvCode }}) {{ modelValue.name }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Divider -->
    <div class="hr1" style="margin:1rem 0 1rem"></div>

    <!-- Nota ghidaj -->
    <div class="alert alert-warning" role="alert" style="margin:0 0 1rem 0;font-size:12px;">
      Dacă identificați mai multe coduri CPV care reflectă nevoia dorită, vă rugăm să selectați codul CPV cu cele mai puține zerouri înainte de cratimă "-". <br />
      Ex. Dacă avem de ales între 39225720-8 Borcane și 39225700-2 Sticle. borcane și flacoane, codul CPV corect este 39225720-8 pentru că are mai puține zerouri înainte de cratimă"-".
    </div>

    <!-- ② Rezultatele căutării -->
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.6rem;">
      <h4 style="margin:0;">Rezultatele căutării</h4>
      <select @change="onPerPageChange" style="padding:0.2rem 0.5rem;font-size:12px;border:1px solid #ccc;border-radius:3px;">
        <option value="50">Primele 50</option>
        <option value="20">Primele 20</option>
        <option value="10">Primele 10</option>
      </select>
    </div>

    <div class="results-wrap">
      <table class="ctb" :class="{'ctb--loading': loading && searched}">
        <thead>
          <tr>
            <th style="width:4rem">Nr.</th>
            <th colspan="2">Diviziunea</th>
            <th>Grupul</th>
            <th>Clasa</th>
            <th>Categoria</th>
            <th>Denumire</th>
            <th v-if="hasResults" style="width:3rem;text-align:center;"></th>
          </tr>
        </thead>
        <tbody>
          <!-- Stare initiala — nu s-a cautat nimic -->
          <tr v-if="!searched">
            <td :colspan="8" class="td-center td-muted">Introduceți cuvinte cheie și apăsați butonul de căutare.</td>
          </tr>

          <!-- Loading -->
          <tr v-else-if="loading">
            <td colspan="8" class="td-center">
              <i class="fas fa-sync fa-spin" style="font-size:2rem;color:#1565C0;margin:8px 0;display:block;"></i>
            </td>
          </tr>

          <!-- Nimic gasit -->
          <tr v-else-if="!hasResults">
            <td colspan="7" class="td-center td-muted">Nimic nu a fost găsit</td>
          </tr>

          <!-- Rezultate -->
          <template v-else>
            <tr
              v-for="(row, i) in cpvData"
              :key="row.cpvCode"
              :class="{'tr-selected': row._selected}"
            >
              <td style="text-align:center">{{ i + 1 + pageOffset }}</td>
              <td colspan="2" v-html="hl(row.division)"></td>
              <td v-html="hl(row.group)"></td>
              <td v-html="hl(row.class)"></td>
              <td v-html="hl(row.category)"></td>
              <td v-html="'(' + hl(row.cpvCode) + ') ' + hl(row.name)"></td>
              <td style="text-align:center;">
                <i
                  @click="selectCpv(row)"
                  :class="`fas fa-${row._selected ? 'minus' : 'plus'}-circle`"
                  style="cursor:pointer;color:#39f;font-size:1.4rem;"
                ></i>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Footer: count + paginatie + sterge -->
    <div v-if="!isNaN(cpvCount)" style="display:flex;justify-content:space-between;align-items:center;margin-top:0.5rem;">
      <div><b>Nr. total de rezultate: {{ cpvCount }}</b></div>
      <div style="display:flex;align-items:center;gap:6px;">
        <div class="pages">
          <template v-for="page in pages" :key="page">
            <a
              @click.prevent="selectPage(page)"
              href="#"
              class="page-btn"
              :class="{ 'page-active': page === currPage, 'page-dots': page === '...' }"
            ><span>{{ page }}</span></a>
          </template>
        </div>
        <a href="#" class="red-link" @click.prevent="clearSearch">Șterge <i class="fas fa-times"></i></a>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { CPV_CATEGORY_PAGINATED } from '@/api.js'

const props = defineProps({
  cpvType:      { required: true },
  search:       { type: String,  default: '' },
  searchCount:  { type: Number,  default: 0 },
  dynamicSearch:{ type: Boolean, default: true },
  modelValue:   { default: null },
})
const emit = defineEmits(['update:modelValue', 'selected', 'clearSearch'])

const cpvData    = ref([])
const cpvCount   = ref(NaN)
const currPage   = ref(1)
const viewRows   = ref(50)
const searched   = ref('')   // '' = nicio cautare efectuata
const loading    = ref(false)
const selectedId = ref(null)

let searchTimeout  = null
let lastSearchTime = 0
const DEBOUNCE = 800

const hasResults = computed(() => Array.isArray(cpvData.value) && cpvData.value.length > 0 && cpvData.value[0])
const pageOffset = computed(() => (currPage.value - 1) * viewRows.value)

const pages = computed(() => {
  const total = Math.ceil(cpvCount.value / viewRows.value)
  if (!total || isNaN(total)) return []
  const arr = []
  for (let i = 1; i <= total; i++) {
    if (i <= 4 || (i > currPage.value - 3 && i < currPage.value + 3) || i > total - 4) {
      if (arr.length && i !== arr[arr.length-1]+1) arr.push('...')
      arr.push(i)
    }
  }
  return arr
})

// Highlight cu suport diacritice
const hlReg = computed(() => {
  if (!searched.value) return null
  const map = [['a','ă','â'],['t','ț','ţ'],['s','ș','ş'],['i','î']]
  let inp = searched.value
  map.forEach(e => inp = inp.replace(new RegExp(`[${e.join('')}]`,'gi'), `[${e.join('')}]`))
  return new RegExp(inp,'gi')
})
function hl(val) {
  if (!val || !hlReg.value) return val || ''
  return val.replace(hlReg.value, m => m.bold())
}

watch(() => props.searchCount, () => { currPage.value = 1; doSearch() })
watch(() => props.cpvType, () => clearSearch())

function doSearch(reSearch = false) {
  const term = reSearch ? searched.value : props.search.trim()
  if (!reSearch) searched.value = term
  if (!term || term.length < 3) {
    if (term && term.length < 3) window.$toastr?.w('Căutarea trebuie să conțină minim 3 caractere.')
    return
  }

  cpvData.value = []
  loading.value = true
  clearTimeout(searchTimeout)
  const delay = Date.now() - lastSearchTime > DEBOUNCE ? 0 : DEBOUNCE

  searchTimeout = setTimeout(async () => {
    lastSearchTime = Date.now()
    const sType = props.dynamicSearch ? 'columnsOr' : 'columnsOrStrict'
    try {
      // FIX: trecem searchParam ca string direct, nu array
      const searchParam = `${sType}=cpvCode,name,division,group,class,category||${term}`
      const res  = await CPV_CATEGORY_PAGINATED(currPage.value, viewRows.value, props.cpvType, searchParam)
      const data = await res.json()
      if (Array.isArray(data?.data?.result)) {
        cpvData.value = data.data.result.length
          ? data.data.result.map(r => ({...r, _selected: r.id === selectedId.value}))
          : [false]
        cpvCount.value = Number.isInteger(data.data.recordsQuantity) ? data.data.recordsQuantity : NaN
      } else {
        cpvData.value = []
        window.$toastr?.e('Încercați mai târziu')
      }
    } catch (e) {
      console.error('CPV search:', e)
      cpvData.value = []
    } finally {
      loading.value = false
    }
  }, delay)
}

function selectCpv(row) {
  if (selectedId.value === row.id) {
    selectedId.value = null
    cpvData.value.forEach(r => r && (r._selected = false))
    emit('update:modelValue', null)
    emit('selected', null)
  } else {
    selectedId.value = row.id
    cpvData.value.forEach(r => r && (r._selected = r.id === row.id))
    emit('update:modelValue', row)
    emit('selected', row)
  }
}

function selectPage(page) {
  if (page === '...' || page === currPage.value) return
  currPage.value = parseInt(page)
  doSearch(true)
}
function onPerPageChange(e) {
  viewRows.value = parseInt(e.target.value) || 50
  currPage.value = 1
  doSearch(true)
}
function clearSearch() {
  emit('clearSearch')
  searched.value = ''; cpvData.value = []; cpvCount.value = NaN; currPage.value = 1; loading.value = false
}
</script>

<style scoped>
.cpv-select { flex-grow: 1; display: flex; flex-direction: column; }

/* Tabel stil similar cu codul vechi (custom_docTb) */
.ctb { width: 100%; border-collapse: collapse; font-size: 12px; }
.ctb thead tr { background: #1565C0; }
.ctb thead th {
  padding: 7px 10px; text-align: left;
  font-size: 11px; font-weight: 700; color: white; white-space: nowrap;
  position: sticky; top: 0; z-index: 1;
}
.ctb tbody tr { border-bottom: 1px solid #f0f0f0; }
.ctb tbody tr:hover { background: #f5f7fa; }
.ctb tbody tr:nth-child(even) { background: #fafafa; }
.ctb tbody tr:nth-child(even):hover { background: #f5f7fa; }
/* Randuri compacte */
.ctb td { padding: 5px 10px; color: #333; vertical-align: middle; font-size: 12px; }

.ctb--loading { opacity: 0.5; }

.tr-selected { background: #E3F2FD !important; }

.td-center { text-align: center; padding: 14px 12px !important; }
.td-muted  { color: #9e9e9e; font-style: italic; font-size: 12px; }

/* Results wrapper cu scroll */
.results-wrap { overflow: auto; max-height: 340px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 6px; }

/* Divider */
.hr1 { border: none; border-top: 1px solid #e0e0e0; }

/* Alert warning (identic cu bootstrap din codul vechi) */
.alert-warning {
  background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px;
  padding: 8px 12px; color: #856404; line-height: 1.5;
}

/* Paginatie */
.pages { display: inline-flex; gap: 3px; }
.page-btn {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 24px; height: 24px; padding: 0 4px;
  border-radius: 4px; font-size: 12px; color: #333; text-decoration: none;
  transition: background .15s; position: relative; overflow: hidden;
}
.page-btn:hover { background: #e0e0e0; }
.page-active { background: #b0bec5; color: white; pointer-events: none; }
.page-dots   { pointer-events: none; color: #999; }

.red-link { color: #E53935; text-decoration: none; font-size: 12px; display: flex; align-items: center; gap: 4px; }
.red-link:hover { text-decoration: underline; }
</style>
