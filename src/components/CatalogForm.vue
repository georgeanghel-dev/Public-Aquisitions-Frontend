<template>
  <div class="m-overlay" @click.self="$emit('close')">
  <div class="m-box">

    <!-- Header -->
    <div class="m-header">
      <span class="m-title">{{ product ? 'Modifică poziție de catalog' : 'Adaugă Poziție de catalog' }}</span>
      <button class="m-close" @click="$emit('close')">✕</button>
    </div>

    <!-- Body scrollabil -->
    <div class="m-body">

      <!-- ① Instituția — full width, doar superadmin -->
      <div v-if="isSuperadmin" class="fg mb12" :class="{'fg--err': errors.institution}">
        <label class="lbl">Instituția <span class="req">*</span></label>
        <VSelect
          v-model="form.institution"
          :options="institutions"
          label="name"
          :loading="loadingInstitutions"
          :filter="fuseFilter"
          placeholder="Selectează instituția..."
          class="vsel"
        />
        <span v-if="errors.institution" class="errtxt">Instituția nu a fost selectată.</span>
      </div>

      <!-- ② Bloc 2 coloane (50/50): stânga = form-uri | dreapta = Descriere -->
      <div class="two-col">

        <!-- Coloana STÂNGA — toate form-urile pe verticală -->
        <div class="col-left">

          <!-- Rândul 1: Denumire + UM -->
          <div class="row-inline">
            <div class="fg fg--half" :class="{'fg--err': errors.name}">
              <label class="lbl">Denumire poziție de catalog <span class="req">*</span></label>
              <div style="position:relative">
                <input
                  v-model="form.name"
                  type="text"
                  class="inp"
                  @input="onNameInput"
                  @focusout="onNameFocusOut"
                  autocomplete="off"
                />
                <div v-if="showSugg && suggestions.length" class="sugg-list">
                  <div class="sugg-hdr">Poziții de catalog existente:</div>
                  <div v-for="s in suggestions" :key="s.id" class="sugg-row">
                    <span class="sugg-name">{{ s.name }} - {{ s.cpvCategory?.cpvCode }}</span>
                    <span>
                      <i :class="{'fad fa-hourglass': s.status==='in_progres','fas fa-clipboard-check': s.status==='completed'}" style="color:#39f;margin-right:4px;font-size:11px;"></i>
                      <i class="fas fa-info-circle" style="color:#aaa;font-size:11px;"></i>
                    </span>
                  </div>
                </div>
              </div>
              <span v-if="errors.name" class="errtxt">Denumirea a fost introdusă incorect.</span>
            </div>

            <div class="fg fg--half" :class="{'fg--err': errors.measurementUnit}">
              <label class="lbl">Unitatea de măsură <span class="req">*</span></label>
              <VSelect
                v-model="form.measurementUnit"
                :options="measurementUnits"
                label="name"
                :loading="loadingMU"
                :filter="fuseFilter"
                placeholder="Selectează..."
                class="vsel"
              />
              <span v-if="errors.measurementUnit" class="errtxt">Unitatea de măsură nu a fost selectată.</span>
            </div>
          </div>

          <!-- Separator + titlu Criterii -->
          <div class="hr-line"></div>
          <h3 class="section-h3">Criterii căutare Cod CPV</h3>

          <!-- Rândul 2: Tip poziție + Search (aliniate cu rândul 1) -->
          <div class="row-inline">
            <div class="fg fg--half" :class="{'fg--err': errors.cpvType}">
              <label class="lbl">Tip poziție catalog <span class="req">*</span></label>
              <VSelect
                v-model="form.cpvType"
                :options="cpvTypes"
                label="name"
                :searchable="false"
                :clearable="false"
                placeholder="Selectează tipul..."
                class="vsel"
                @option:selected="onCpvTypeChange"
              />
              <span v-if="errors.cpvType" class="errtxt">Tipul nu a fost selectat.</span>
            </div>

            <div class="fg fg--half">
              <label class="lbl search-lbl-row">
                <span>Denumire / Cod CPV</span>
                <label class="toggle-wrap" :title="dynamicSearch ? 'Modul dinamic activ' : 'Modul static activ'">
                  <input type="checkbox" v-model="dynamicSearch" />
                  <span class="toggle-track"></span>
                </label>
              </label>
              <div class="inp-search-row">
                <input
                  v-model="cpvSearch"
                  type="text"
                  class="inp"
                  placeholder="Cuvinte cheie"
                  :disabled="!form.cpvType"
                  @keydown.enter="doSearch"
                />
                <button class="search-btn" :disabled="!form.cpvType" @click="doSearch">
                  <i class="fas fa-search"></i>
                </button>
              </div>
            </div>
          </div>

        </div><!-- /col-left -->

        <!-- Coloana DREAPTA — Descriere -->
        <div class="col-right">
          <label class="lbl" style="line-height:1.2">Descriere poziție de catalog</label>
          <pre class="desc-pre" v-html="form.description || ''"></pre>
        </div>

      </div><!-- /two-col -->

      <!-- ③ Tabelele CPV -->
      <keep-alive>
        <CatalogCpvSelect
          v-if="form.cpvType"
          :cpvType="form.cpvType.id"
          :search="cpvSearch"
          :searchCount="searchCount"
          :dynamicSearch="dynamicSearch"
          v-model="form.cpvCategory"
          @selected="onCpvSelected"
          @clearSearch="cpvSearch = ''"
        />
      </keep-alive>
      <span v-if="errors.cpvCategory" class="errtxt" style="display:block;padding:2px 0;">Codul CPV nu a fost selectat.</span>

    </div><!-- /m-body -->

    <!-- Footer -->
    <div class="m-footer">
      <button class="btn-back" @click="$emit('close')">Inapoi</button>
      <button class="btn-ai" @click="drawerOpen = !drawerOpen" type="button">
        <i class="fas fa-question-circle"></i>
        Asistență AI pentru identificarea Codului CPV
      </button>
      <button class="btn-save" @click="save" :disabled="saving">
        <span v-if="!saving">{{ submitLabel }}</span>
        <span v-else class="btn-spinner"></span>
      </button>
    </div>

    <!-- AI Drawer lateral -->
    <transition name="slide-ai">
      <div v-if="drawerOpen" class="ai-drawer">
        <div class="ai-head">
          <span><i class="fas fa-question-circle" style="color:#1565C0;margin-right:6px;"></i>Asistent AI — Cod CPV</span>
          <button class="ai-close-btn" @click="drawerOpen = false">✕</button>
        </div>
        <div class="ai-info-bar">
          Asistentul lucrează exclusiv cu codurile CPV din nomenclatorul platformei.
        </div>
        <div class="ai-chat" ref="chatRef">
          <div v-if="chatMessages.length === 0" class="ai-empty">
            <p>Descrieți ce doriți să achiziționați și vă voi ajuta să identificați codul CPV corect.</p>
            <p class="ai-ex">Ex: "Vreau să cumpăr Algocalmin"</p>
          </div>
          <div v-for="(msg, i) in chatMessages" :key="i" class="ai-msg" :class="`ai-msg--${msg.role}`">
            <div class="ai-bubble"><div v-html="msg.content"></div></div>
          </div>
          <div v-if="aiLoading" class="ai-msg ai-msg--assistant">
            <div class="ai-bubble ai-bubble--dots"><span></span><span></span><span></span></div>
          </div>
        </div>
        <div class="ai-inp-row">
          <textarea v-model="userMessage" rows="2" placeholder="Descrieți ce doriți..." @keydown.enter.exact.prevent="sendMessage"></textarea>
          <button class="ai-send-btn" @click="sendMessage" :disabled="aiLoading || !userMessage.trim()">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </transition>

  </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import VSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import CatalogCpvSelect from '@/components/CatalogCpvSelect.vue'
import {
  PRODUCTS_ADD, PRODUCTS_MODIFY, PRODUCTS_CAN_EDIT_CPV,
  PRODUCTS_SIMPLE, CPV_CATEGORY_PAGINATED, PRODUCTS_PAGINATED,
  INSTITUTIONS_PAGINATED, MEASUREMENT_UNITS, AI_MESSAGES,
} from '@/api.js'

const props = defineProps({ product: { type: Object, default: null } })
const emit  = defineEmits(['close', 'saved'])

const cpvTypes = [
  { name: 'Produse',  id: 1 },
  { name: 'Servicii', id: 2 },
  { name: 'Lucrări',  id: 3 },
]

// ── State ──────────────────────────────────────────────────────────────────────
const saving        = ref(false)
const drawerOpen    = ref(false)
const dynamicSearch = ref(true)
const cpvSearch     = ref('')
const searchCount   = ref(0)
const showSugg      = ref(false)
const suggestions   = ref([])
const suggestTimer  = ref(null)
const chatMessages  = ref([])
const userMessage   = ref('')
const aiLoading     = ref(false)
const chatRef       = ref(null)
const institutions     = ref([])
const measurementUnits = ref([])
const allProducts      = ref([])
const loadingInstitutions = ref(false)
const loadingMU           = ref(false)
const errors = ref({})
const form = ref({
  institution: null, name: '', measurementUnit: null,
  description: '', cpvType: null, cpvCategory: null,
})

// ── Computed ───────────────────────────────────────────────────────────────────
const isSuperadmin = computed(() => window.$getRoleAll?.()?.role === 'superadmin')
const canConfirm   = computed(() => {
  const r = window.$getRoleAll?.()?.role
  return ['responsabil_achizitii','supervizor_achizitii','responsabil_achizitii_extern'].includes(r)
})
const submitLabel = computed(() => {
  if (props.product) return 'Modifică'
  if (isSuperadmin.value || canConfirm.value) return 'Salvează'
  return 'Trimite spre aprobare'
})

// ── Watchers ───────────────────────────────────────────────────────────────────
watch(() => form.value.name, x => {
  if (x?.length) { const u = x[0].toUpperCase()+x.slice(1); if (u!==x) form.value.name=u }
  errors.value.name = false
})
watch(() => form.value.measurementUnit, () => { errors.value.measurementUnit = false })
watch(() => form.value.institution,     () => { errors.value.institution = false })
watch(() => form.value.cpvType,         () => { errors.value.cpvType = false })
watch(() => form.value.cpvCategory,     () => { errors.value.cpvCategory = false })

// ── Lifecycle ──────────────────────────────────────────────────────────────────
onMounted(async () => {
  try {
    const d = await (await PRODUCTS_SIMPLE(1,500)).json()
    allProducts.value = d?.data?.result || d?.data || []
  } catch {}

  if (isSuperadmin.value) {
    loadingInstitutions.value = true
    try {
      const d = await (await INSTITUTIONS_PAGINATED(1,500)).json()
      institutions.value = d?.data?.result || d?.data || []
    } catch {} finally { loadingInstitutions.value = false }
  }

  loadingMU.value = true
  try {
    const d   = await (await MEASUREMENT_UNITS.get(1,500)).json()
    const arr = d?.data?.result || d?.data || []
    measurementUnits.value = arr.map(m => ({
      ...m,
      name: m.shortName ? `${m.shortName}${m.description ? ` — „${m.description}"` : ''}` : (m.name||''),
    }))
  } catch {} finally { loadingMU.value = false }

  if (props.product) {
    const p = props.product
    form.value.name        = p.name || ''
    form.value.description = p.description || ''
    if (p.institution)     form.value.institution = institutions.value.find(i=>i.id===p.institution?.id) || p.institution
    if (p.measurementUnit) {
      const found = measurementUnits.value.find(m=>m.id===p.measurementUnit?.id)
      form.value.measurementUnit = found || { ...p.measurementUnit, name: p.measurementUnit.shortName ? `${p.measurementUnit.shortName}${p.measurementUnit.description?` — „${p.measurementUnit.description}"`:''}` : (p.measurementUnit.name||'') }
    }
    form.value.cpvCategory = p.cpvCategory || null
    if (p.cpvCategory?.cpvType) form.value.cpvType = cpvTypes.find(t=>t.id===p.cpvCategory.cpvType) || null
  }
})

// ── Helpers ────────────────────────────────────────────────────────────────────
function normalize(s) { return String(s||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'') }

function fuseFilter(options, search) {
  const q = normalize(search)
  return options.filter(o => normalize(o.name||'').includes(q))
}

function checkDuplicate(name) {
  const found = allProducts.value.find(el => normalize(el.name)===normalize(name) && el.id!==props.product?.id)
  if (found) { window.$toastr?.w('Există un produs în catalog cu acest nume.'); return true }
  return false
}

// ── Handlers ───────────────────────────────────────────────────────────────────
function onNameInput() {
  errors.value.name = false
  const val = (form.value.name||'').trim()
  clearTimeout(suggestTimer.value)
  if (!val || val.length < 2) { suggestions.value=[]; showSugg.value=false; return }
  suggestTimer.value = setTimeout(() => {
    const q = normalize(val)
    suggestions.value = allProducts.value.filter(p=>normalize(p.name).includes(q)).slice(0,8)
    showSugg.value = suggestions.value.length > 0
  }, 300)
}
function onNameFocusOut() { setTimeout(()=>{ showSugg.value=false }, 200) }
function onCpvTypeChange() { form.value.cpvCategory=null; form.value.description=''; cpvSearch.value='' }
function doSearch() { if (cpvSearch.value.trim()) searchCount.value++ }
function onCpvSelected(cpv) {
  if (!cpv) { form.value.description=''; return }
  form.value.description = `<b>Denumire</b>: ${cpv.cpvCode} - ${cpv.name}\n<b>Diviziunea</b>: ${cpv.division}\n<b>Grupul</b>: ${cpv.group}\n<b>Clasa</b>: ${cpv.class}\n<b>Categoria</b>: ${cpv.category}`
}

// ── Save ───────────────────────────────────────────────────────────────────────
async function save() {
  errors.value = {}
  if (isSuperadmin.value && !form.value.institution) { errors.value.institution=true; window.$toastr?.e('Instituția produsului nu a fost selectată.'); return }
  if (!form.value.name?.trim()) { errors.value.name=true; window.$toastr?.e('Denumirea produsului a fost introdusă incorect.'); return }
  if (!form.value.measurementUnit) { errors.value.measurementUnit=true; window.$toastr?.e('Măsura de unitate a produsului nu a fost selectată.'); return }
  if (checkDuplicate(form.value.name)) return
  if ((canConfirm.value||isSuperadmin.value) && !form.value.cpvType) { errors.value.cpvType=true; window.$toastr?.e('Poziția catalogului nu a fost selectată.'); return }
  if ((canConfirm.value||isSuperadmin.value) && !form.value.cpvCategory) { errors.value.cpvCategory=true; window.$toastr?.e('Codul CPV nu a fost selectat.'); return }
  saving.value = true
  try { props.product ? await doEdit() : await doCreate() } finally { saving.value=false }
}

async function doCreate() {
  // Notă: 'status' NU se trimite — backend-ul îl setează automat după rolul userului
  // TypeORM ManyToOne: relațiile se trimit ca obiecte { id } sau ca număr simplu
  // Backend DTO are @IsInt() deci trimitem numărul direct, TypeORM îl rezolvă
  const muId = parseInt(form.value.measurementUnit?.id)
  if (!muId || isNaN(muId)) {
    window.$toastr?.e('Unitatea de măsură nu a putut fi identificată.')
    return
  }

  const sd = {
    name:            form.value.name.trim(),
    measurementUnit: muId,
    description:     String(form.value.description || '').trim(),
    institution:     0,   // setat mai jos
  }

  // cpvCategory — TypeORM ManyToOne: trimitem { id } nu numărul direct
  if (form.value.cpvCategory?.id) {
    sd.cpvCategory = parseInt(form.value.cpvCategory.id)
  }

  // institution — TypeORM ManyToOne: backend-ul așteaptă numărul direct (integer)
  // dar validarea DTO transformă cu class-transformer — trimitem numărul simplu
  if (isSuperadmin.value) {
    const instId = form.value.institution?.id ?? form.value.institution
    sd.institution = parseInt(instId)
  } else {
    const role = window.$getRoleAll?.()
    if (role?.institutionId) {
      sd.institution = parseInt(role.institutionId)
    } else {
      window.$toastr?.e('Încercați să vă autorizați din nou.')
      return
    }
  }

  // measurementUnit — verificare că e număr valid
  if (!sd.measurementUnit || isNaN(sd.measurementUnit)) {
    window.$toastr?.e('Unitatea de măsură nu a putut fi identificată.')
    return
  }

  // Pentru superadmin: trimitem institutionId ales în header-ul conectx-userid-role
  // Backend-ul citește user.institutionId din JWT (null pentru superadmin),
  // dar institutionId din header-ul de rol este folosit în duplicate check.
  // Soluție: construim un header custom cu institutionId-ul instituției selectate.
  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/'
  const token = localStorage.getItem('token') || sessionStorage.getItem('token') || ''
  
  // Construim header-ul de rol cu institutionId-ul ales de superadmin
  // Structura exactă: { id, institutionId, departmentId, role } - identic cu getRoleToSend() din api.js
  let roleHeader
  try {
    const roleData = window.$getRoleAll?.() || {}
    roleHeader = JSON.stringify({
      id:            roleData.userRoleId  || null,
      institutionId: sd.institution,       // ID-ul instituției selectate din dropdown
      departmentId:  roleData.departmentId || null,
      role:          roleData.role         || 'superadmin',
    })
  } catch {
    roleHeader = JSON.stringify({ institutionId: sd.institution, role: 'superadmin' })
  }

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
    'conectx-userid-role': roleHeader,
  }

  console.log('[CatalogForm] PRODUCTS_ADD payload:', JSON.stringify(sd))
  console.log('[CatalogForm] conectx-userid-role header:', roleHeader)

  try {
    const response = await fetch(`${BASE_URL}products/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(sd),
    })
    const d = await response.json()
    console.log('[CatalogForm] PRODUCTS_ADD response status:', response.status, JSON.stringify(d))

    const statusCode = d?.meta?.HttpStatusCode
    if (!response.ok || !statusCode || String(statusCode)[0] !== '2') {
      const errMsg = d?.data?.message || d?.message || ''
      if (errMsg.toLowerCase().includes('product_exit') || errMsg.toLowerCase().includes('already') || response.status === 403) {
        window.$toastr?.e('Acest produs a fost adăugat deja.')
      } else {
        window.$toastr?.e(`Eroare la salvare (${response.status}). Verificați consola.`)
      }
      return
    }

    window.$toastr?.s('Poziția de catalog a fost creată.')
    emit('saved')
  } catch (e) {
    console.error('[CatalogForm] doCreate error:', e)
    window.$toastr?.e('Eroare de rețea. Verificați consola.')
  }
}

async function doEdit() {
  const p = props.product
  let canEdit
  try { canEdit = (await (await PRODUCTS_CAN_EDIT_CPV(p.id)).json())?.data?.result }
  catch (e) { console.error('canEdit:', e); window.$toastr?.e('Verificarea produsului a eșuat.'); return }
  if (canEdit===1) { window.$toastr?.w({msg:'Poziția de catalog nu poate fi modificată deoarece pe baza acesteia au fost create propuneri de nevoi care deja fac parte dintr-un referat de necesitate.',timeout:12000}); return }
  if (canEdit===2 && !window.confirm('Atenție!\nDupă editarea acestui produs, unele propuneri de nevoi create pe baza acestuia vor fi anulate automat.\n\nConfirmați editarea?')) return
  const sd = {}
  if (isSuperadmin.value) { const nId=form.value.institution?.id; if(p.institution?.id!==nId) sd.institution=+nId }
  if (String(p.name||'').trim()!==form.value.name.trim()) sd.name=form.value.name.trim()
  if (p.cpvCategory?.id!==form.value.cpvCategory?.id&&form.value.cpvCategory) sd.cpvCategory=+form.value.cpvCategory.id
  if (p.measurementUnit?.id!==form.value.measurementUnit?.id) sd.measurementUnit=+form.value.measurementUnit.id
  if (String(p.description||'').trim()!==String(form.value.description||'').trim()) sd.description=String(form.value.description||'').trim()
  if (!Object.keys(sd).length) { window.$toastr?.w('Datele nu au fost modificate.'); return }
  try {
    const d = await (await PRODUCTS_MODIFY(p.id,sd)).json()
    if (String(d?.meta?.HttpStatusCode)[0]!=='2') { window.$toastr?.e('Încercați mai târziu.'); return }
    window.$toastr?.s('Poziția de catalog a fost modificată.')
    emit('saved')
  } catch (e) { console.error('doEdit:', e); window.$toastr?.e('Încercați mai târziu.') }
}

// ── AI Agent — apel prin proxy backend (evită CORS) ───────────────────────────
// Frontend → Backend NestJS /ai/messages → api.anthropic.com
async function callAI(messages, systemPrompt) {
  const body = {
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages,
  }
  if (systemPrompt) body.system = systemPrompt

  const response = await AI_MESSAGES(body)

  if (!response.ok) {
    const errText = await response.text()
    console.error('AI proxy error:', response.status, errText)
    throw new Error(`API error ${response.status}: ${errText}`)
  }

  const data = await response.json()
  // Extrage textul din răspuns (poate conține și tool_use blocks)
  const text = data.content
    ?.filter(b => b.type === 'text')
    ?.map(b => b.text)
    ?.join('') || ''

  return text
}

async function sendMessage() {
  if (!userMessage.value.trim() || aiLoading.value) return
  const question = userMessage.value.trim()
  userMessage.value = ''
  chatMessages.value.push({ role: 'user', content: question })
  aiLoading.value = true
  await scrollChat()

  try {
    // Pasul 1: extrage termeni de căutare
    const extractText = await callAI([{
      role: 'user',
      content: `Ești expert în nomenclatoare CPV românești.\nUtilizatorul caută un cod CPV pentru: "${question}"\n\nExtrage DOAR JSON fără explicații:\n{"cpvTerms":["termen1","termen2"],"catalogTerms":["denumire1","denumire2"],"type":1}`
    }])

    let parsed = {}
    try { parsed = JSON.parse(extractText.replace(/```json|```/g,'').trim()) } catch {}

    const cpvTerms     = Array.isArray(parsed.cpvTerms)     ? parsed.cpvTerms     : [question]
    const catalogTerms = Array.isArray(parsed.catalogTerms) ? parsed.catalogTerms : [question]

    // Pasul 2: căutare paralelă în CPV + catalog
    const [cpvResults, existingProducts] = await Promise.all([
      Promise.all(cpvTerms.slice(0,3).map(async term => {
        try {
          const res  = await CPV_CATEGORY_PAGINATED(1, 8, parsed.type||null, `columnsOr=cpvCode,name,division,group,class,category||${term}`)
          const data = await res.json()
          return data?.data?.result || []
        } catch { return [] }
      })).then(r => Array.from(new Map(r.flat().map(x=>[x.id,x])).values()).slice(0,15)),

      Promise.all(catalogTerms.slice(0,3).map(async term => {
        try {
          const res  = await PRODUCTS_PAGINATED(1, 5, `columnsOr=name||${term}&isActive=true`)
          const data = await res.json()
          return data?.data?.result || []
        } catch { return [] }
      })).then(r => Array.from(new Map(r.flat().map(x=>[x.id,x])).values()).slice(0,8)),
    ])

    const cpvCtx = cpvResults.length
      ? cpvResults.map(r=>`- ${r.cpvCode}: ${r.name} (${r.division} > ${r.group} > ${r.class} > ${r.category})`).join('\n')
      : 'Nu au fost găsite coduri CPV relevante în nomenclatorul platformei.'

    const catCtx = existingProducts.length
      ? existingProducts.map(r=>`- "${r.name}" [${r.status==='completed'?'Completat':'În Progres'}] — CPV: ${r.cpvCategory?.cpvCode||'nealocat'}`).join('\n')
      : 'Nu au fost găsite produse similare în catalogul platformei.'

    // Pasul 3: răspuns final — trimitem tot istoricul conversației (ca AiPriceAgent)
    const history = chatMessages.value.slice(0,-1).map(m => ({ role: m.role, content: m.content }))
    history.push({
      role: 'user',
      content: `Utilizatorul dorește să adauge în catalog: "${question}"\n\n═══ PRODUSE EXISTENTE ÎN CATALOG ═══\n${catCtx}\n\n═══ CODURI CPV DIN NOMENCLATOR ═══\n${cpvCtx}\n\nInstrucțiuni (răspuns în română, concis):\n1. Dacă există produse similare în catalog, avertizează utilizatorul menționând denumirile și statusul.\n2. Recomandă cel mai relevant cod CPV cu ierarhia completă.\n3. Dacă nu există nimic relevant, informează utilizatorul.`
    })

    const answer = await callAI(history)
    chatMessages.value.push({ role: 'assistant', content: answer.replace(/\n/g,'<br>') })

  } catch (e) {
    console.error('AI sendMessage error:', e)
    chatMessages.value.push({ role: 'assistant', content: `A apărut o eroare: ${e.message || 'necunoscută'}. Verificați consola.` })
  } finally {
    aiLoading.value = false
    await scrollChat()
  }
}

async function scrollChat() {
  await nextTick()
  if (chatRef.value) chatRef.value.scrollTop = chatRef.value.scrollHeight
}
</script>

<style scoped>
/* ── Overlay & box ── */
.m-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 1050; font-family: 'Roboto', sans-serif;
}
.m-box {
  position: relative; background: #fff;
  display: flex; flex-direction: column;
  width: 95vw; max-width: 1350px;
  height: 92vh; max-height: 960px;
  border-radius: 8px; overflow: hidden;
  box-shadow: 0 8px 40px rgba(0,0,0,0.3);
}

/* ── Header ── */
.m-header {
  background: #1565C0; color: white; padding: 14px 28px;
  display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;
}
.m-title { font-size: 17px; font-weight: 600; }
.m-close {
  background: rgba(255,255,255,0.15); border: none; border-radius: 4px;
  width: 30px; height: 30px; font-size: 16px; color: white; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.m-close:hover { background: rgba(255,255,255,0.3); }

/* ── Body ── */
.m-body {
  flex: 1; overflow-y: auto; padding: 16px 28px 12px;
  display: flex; flex-direction: column; background: #fff;
}
.mb12 { margin-bottom: 12px; }

/* ── Labels & inputs ── */
.lbl {
  display: inline-flex; align-items: center; gap: 6px;
  font-weight: bold; font-size: 13px; color: #333; margin-bottom: 5px;
}
.req { color: #E53935; }
.errtxt { font-size: 11px; color: #E53935; margin-top: 3px; display: block; }
.inp {
  width: 100%; box-sizing: border-box;
  border: 1px solid #ccc; border-radius: 4px;
  padding: 6px 10px; font-size: 13px; color: #333;
  font-family: 'Roboto', sans-serif; background: white; outline: none;
}
.inp:focus { border-color: #1565C0; }
.inp:disabled { background: #f5f5f5; color: #999; }
.fg { display: flex; flex-direction: column; }
.fg--err .inp,
.fg--err .vsel :deep(.vs__dropdown-toggle) { border-color: #E53935 !important; }

/* ── v-select ── */
.vsel :deep(.vs__dropdown-toggle) {
  border: 1px solid #ccc; border-radius: 4px; padding: 2px 8px;
  background: white; min-height: 34px;
}
.vsel :deep(.vs__search), .vsel :deep(.vs__selected) { font-size: 13px; font-family: 'Roboto', sans-serif; }
.vsel :deep(.vs__dropdown-menu) { font-size: 13px; }

/* ── 2-col block ── */
.two-col {
  display: flex; gap: 0; align-items: stretch;
  text-align: left; margin-bottom: 12px;
}
.col-left {
  width: 50%; padding-right: 20px;
  display: flex; flex-direction: column; gap: 10px;
}
.col-right {
  width: 50%; padding-left: 20px;
  display: flex; flex-direction: column;
  border-left: 1px solid #eeeeee;
}

/* ── Rând cu 2 câmpuri egale ── */
.row-inline { display: flex; gap: 12px; }
.fg--half { flex: 1; min-width: 0; }

/* ── Descriere ── */
.desc-pre {
  flex: 1; min-height: 120px;
  border: 1px solid #ccc; border-radius: 4px;
  padding: 8px 10px; background: #fafafa;
  font-size: 13px; font-family: 'Roboto', sans-serif;
  white-space: pre-wrap; margin: 0; color: #333; line-height: 1.6;
  overflow-y: auto;
}

/* ── Separator + titlu ── */
.hr-line { border: none; border-top: 1px solid #e0e0e0; margin: 0; }
.section-h3 { font-size: 15px; font-weight: 600; color: #333; margin: 0; }

/* ── Search label row cu toggle ── */
.search-lbl-row { display: flex; align-items: center; gap: 8px; }
.inp-search-row { display: flex; gap: 6px; }
.inp-search-row .inp { flex: 1; }
.search-btn {
  background: #1565C0; border: none; border-radius: 4px;
  width: 34px; height: 34px; flex-shrink: 0; cursor: pointer;
  display: flex; align-items: center; justify-content: center; color: white; font-size: 13px;
}
.search-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── Toggle ── */
.toggle-wrap { position: relative; display: inline-flex; align-items: center; cursor: pointer; }
.toggle-wrap input { opacity: 0; width: 0; height: 0; position: absolute; }
.toggle-track {
  width: 34px; height: 18px; background: #ccc; border-radius: 9px;
  display: inline-block; position: relative; transition: background .2s;
}
.toggle-wrap input:checked + .toggle-track { background: #1565C0; }
.toggle-track::after {
  content: ''; position: absolute; width: 14px; height: 14px;
  background: white; border-radius: 50%; top: 2px; left: 2px; transition: left .2s;
}
.toggle-wrap input:checked + .toggle-track::after { left: 18px; }

/* ── Suggestions ── */
.sugg-list {
  position: absolute; top: 100%; left: 0; right: 0; z-index: 200;
  background: white; border: 1px solid #ccc; border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.12); max-height: 180px; overflow-y: auto;
}
.sugg-hdr { padding: 4px 10px; font-size: 11px; font-weight: 700; color: #757575; background: #f5f5f5; }
.sugg-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 6px 10px; font-size: 12px; border-bottom: 1px solid #f0f0f0;
}
.sugg-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-right: 8px; color: #333; }

/* ── Footer ── */
.m-footer {
  background: white; border-top: 1px solid #e0e0e0; padding: 12px 28px;
  display: flex; align-items: center; justify-content: space-between;
  flex-shrink: 0; gap: 12px;
}
.btn-back {
  background: #f0f0f0; color: #444; border: 1px solid #ccc;
  border-radius: 4px; padding: 8px 20px; font-size: 13px; font-weight: 500;
  font-family: 'Roboto', sans-serif; cursor: pointer; flex-shrink: 0;
}
.btn-back:hover { background: #e0e0e0; }
.btn-ai {
  display: flex; align-items: center; gap: 8px;
  background: #1565C0; color: white; border: none; border-radius: 4px;
  padding: 8px 18px; font-size: 12px; font-weight: 500;
  font-family: 'Roboto', sans-serif; cursor: pointer; flex-shrink: 0;
}
.btn-ai:hover { background: #0d47a1; }
.btn-save {
  background: #2E7D32; color: white; border: none; border-radius: 4px;
  padding: 8px 28px; font-size: 13px; font-weight: 600;
  font-family: 'Roboto', sans-serif; cursor: pointer; min-width: 160px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.btn-save:hover:not(:disabled) { background: #1B5E20; }
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-spinner {
  width: 15px; height: 15px; border: 2px solid rgba(255,255,255,0.4);
  border-top-color: white; border-radius: 50%; animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── AI Drawer ── */
.ai-drawer {
  position: absolute; top: 0; right: 0; bottom: 0; width: 340px;
  background: white; border-left: 1px solid #e0e0e0;
  display: flex; flex-direction: column; z-index: 200;
  box-shadow: -4px 0 16px rgba(0,0,0,0.12);
}
.ai-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 14px; border-bottom: 1px solid #e0e0e0;
  font-size: 13px; font-weight: 600; color: #1a1a2e; flex-shrink: 0;
}
.ai-close-btn { background: none; border: none; cursor: pointer; font-size: 14px; color: #757575; }
.ai-info-bar { background: #E3F2FD; color: #1565C0; font-size: 11px; padding: 7px 14px; flex-shrink: 0; }
.ai-chat { flex: 1; overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 8px; min-height: 0; }
.ai-empty { text-align: center; color: #9e9e9e; font-size: 12px; padding: 20px 8px; }
.ai-ex { color: #bdbdbd; font-style: italic; margin-top: 6px; }
.ai-msg { display: flex; }
.ai-msg--user { justify-content: flex-end; }
.ai-bubble { max-width: 85%; padding: 7px 11px; border-radius: 10px; font-size: 12px; line-height: 1.5; }
.ai-msg--user      .ai-bubble { background: #1565C0; color: white; border-bottom-right-radius: 3px; }
.ai-msg--assistant .ai-bubble { background: #f5f7fa; color: #333; border-bottom-left-radius: 3px; }
.ai-bubble--dots { display: flex; gap: 4px; align-items: center; }
.ai-bubble--dots span { width: 6px; height: 6px; background: #9e9e9e; border-radius: 50%; animation: dots 1s infinite; }
.ai-bubble--dots span:nth-child(2) { animation-delay: .2s; }
.ai-bubble--dots span:nth-child(3) { animation-delay: .4s; }
@keyframes dots { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-4px)} }
.ai-inp-row { display: flex; gap: 6px; padding: 9px; border-top: 1px solid #e0e0e0; flex-shrink: 0; }
.ai-inp-row textarea {
  flex: 1; border: 1px solid #ccc; border-radius: 4px;
  padding: 6px 9px; font-size: 12px; font-family: 'Roboto', sans-serif; resize: none; outline: none;
}
.ai-send-btn {
  background: #1565C0; border: none; border-radius: 4px;
  width: 34px; flex-shrink: 0; cursor: pointer; color: white; font-size: 13px;
  display: flex; align-items: center; justify-content: center;
}
.ai-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── Transition ── */
.slide-ai-enter-active, .slide-ai-leave-active { transition: transform .25s ease, opacity .25s ease; }
.slide-ai-enter-from, .slide-ai-leave-to { transform: translateX(100%); opacity: 0; }
</style>
