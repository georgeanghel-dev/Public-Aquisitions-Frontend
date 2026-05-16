<template>
  <div class="needs-modal-backdrop" @click.self="$emit('close')">
    <div class="needs-modal" :class="{ 'needs-modal--wide': aiDrawerVisible }">

      <!-- Header modal -->
      <div class="modal-header">
        <div class="modal-header__title">
          {{ isEdit ? 'Modifică Nevoie' : 'Adaugă propunere' }}
        </div>
        <div class="modal-header__actions">
          <!-- Buton Asistent AI -->
          <button
            class="btn-ai-toggle"
            @click="aiDrawerVisible = !aiDrawerVisible"
            :class="{ active: aiDrawerVisible }"
            v-tooltip="'Asistent AI – Referințe de preț'"
          >
            <i class="fas fa-robot"></i>
            <span>Asistent AI</span>
            <span v-if="aiDrawerVisible" class="ai-active-dot"></span>
          </button>
          <button class="modal-close" @click="$emit('close')">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- Corp modal -->
      <div class="modal-body">

        <!-- ════════════════════════════════════════
             COLOANA STÂNGĂ
        ═════════════════════════════════════════ -->
        <div class="modal-col modal-col--left">

          <!-- Header info instituție -->
          <div class="info-header">
            <div class="info-row">
              <i class="fas fa-building"></i>
              <span>{{ institutionName || '—' }}</span>
            </div>
            <div class="info-row">
              <i class="fas fa-sitemap"></i>
              <span>{{ departmentName || '—' }}</span>
            </div>
            <div class="info-row">
              <i class="fas fa-user"></i>
              <span>{{ userName || '—' }}</span>
            </div>
            <div class="info-date">{{ currentDateTime }}</div>
          </div>

          <!-- Nevoie -->
          <div class="form-group" :class="{ 'form-group--error': errors.product }">
            <label class="form-label">Nevoie <span class="required">*</span></label>
            <div class="select-wrap">
              <v-select
                v-model="form.product"
                :options="catalogProducts"
                label="name"
                :loading="loadingProducts"
                :disabled="isEdit"
                :clearable="!isEdit"
                placeholder="Caută în catalog..."
                @search="onProductSearch"
                @option:selected="onProductSelected"
                class="v-select-custom"
              >
                <template #option="item">
                  <span class="product-option">
                    <span>
                      {{ item.name }}
                      <em v-if="item.status === 'in_progres'" class="status-pending">(în curs de validare)</em>
                    </span>
                    <i
                      v-tooltip="item.status === 'in_progres' ? 'În curs de validare' : 'Validat'"
                      :class="item.status === 'in_progres' ? 'fad fa-hourglass status-icon--pending' : 'fas fa-clipboard-check status-icon--ok'"
                    ></i>
                  </span>
                </template>
                <!-- Footer: Adaugă în catalog dacă nu e găsit -->
                <template v-if="canCreateProduct && showAddToCatalog" #list-footer>
                  <li class="add-to-catalog">
                    <button @click="openAddToCatalog" class="add-to-catalog__btn">
                      <i class="fas fa-plus-circle"></i>
                      Adaugă în catalog
                    </button>
                  </li>
                </template>
              </v-select>
            </div>
            <span v-if="errors.product" class="form-error">Selectați o poziție de catalog.</span>
            <span v-if="form.product && form.product.status === 'in_progres'" class="form-warning">
              <i class="fas fa-exclamation-triangle"></i>
              Poziția de catalog nu este validată încă. Salvarea este dezactivată.
            </span>
          </div>

          <!-- Tip u.m. + Cod CPV (read-only, auto-completate) -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Tip u.m.</label>
              <input type="text" class="form-input form-input--readonly" :value="form.product?.measurementUnit?.shortName || ''" readonly />
            </div>
            <div class="form-group">
              <label class="form-label">Cod CPV</label>
              <input type="text" class="form-input form-input--readonly" :value="form.product?.cpvCategory?.cpvCode || ''" readonly />
            </div>
          </div>

          <!-- Cantitate + Cotă TVA % (pe același rând) -->
          <div class="form-row">
            <div class="form-group" :class="{ 'form-group--error': errors.qty }">
              <label class="form-label">Cantitate <span class="required">*</span></label>
              <input
                type="number"
                class="form-input"
                v-model.number="form.qty"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                @input="recalculate"
              />
              <span v-if="errors.qty" class="form-error">Introduceți cantitatea.</span>
            </div>
            <div class="form-group" :class="{ 'form-group--error': errors.cotaTva }">
              <label class="form-label">Cotă TVA % <span class="required">*</span></label>
              <input
                type="number"
                class="form-input"
                :class="{ 'form-input--ai-filled': aiFilled.tva }"
                v-model.number="form.cotaTva"
                min="0"
                max="100"
                step="1"
                placeholder="0"
                @input="recalculate; aiFilled.tva = false"
              />
              <span v-if="errors.cotaTva" class="form-error">Introduceți cota TVA.</span>
              <span v-if="aiFilled.tva" class="form-ai-hint"><i class="fas fa-robot"></i> Completat de AI</span>
            </div>
          </div>

          <!-- V.U.E fără TVA + V.T.E fără TVA -->
          <div class="form-row">
            <div class="form-group" :class="{ 'form-group--error': errors.priceWoTva }">
              <label class="form-label">
                V.U.E fără TVA
                <i class="fas fa-info-circle" v-tooltip="'Valoarea Unitară Estimată fără TVA'"></i>
                <span class="required">*</span>
              </label>
              <input
                type="number"
                class="form-input"
                :class="{ 'form-input--ai-filled': aiFilled.priceWoTva }"
                v-model.number="form.priceWoTva"
                min="0"
                step="0.01"
                placeholder="0.00"
                @input="recalculate; aiFilled.priceWoTva = false"
              />
              <span v-if="errors.priceWoTva" class="form-error">Introduceți prețul.</span>
              <span v-if="aiFilled.priceWoTva" class="form-ai-hint"><i class="fas fa-robot"></i> Completat de AI</span>
            </div>
            <div class="form-group">
              <label class="form-label">
                V.T.E fără TVA
                <i class="fas fa-info-circle" v-tooltip="'Valoarea Totală Estimată fără TVA = Cantitate × V.U.E fără TVA'"></i>
              </label>
              <input type="text" class="form-input form-input--readonly form-input--computed" :value="vteFaraTva" readonly />
            </div>
          </div>

          <!-- V.U.E cu TVA + V.T.E cu TVA -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">
                V.U.E cu TVA
                <i class="fas fa-info-circle" v-tooltip="'Valoarea Unitară Estimată cu TVA'"></i>
              </label>
              <input type="text" class="form-input form-input--readonly form-input--computed" :value="vueCuTva" readonly />
            </div>
            <div class="form-group">
              <label class="form-label">
                V.T.E cu TVA
                <i class="fas fa-info-circle" v-tooltip="'Valoarea Totală Estimată cu TVA = Cantitate × V.U.E cu TVA'"></i>
              </label>
              <input type="text" class="form-input form-input--readonly form-input--computed" :value="vteCuTva" readonly />
            </div>
          </div>

          <!-- Documente -->
          <div class="form-group">
            <label class="form-label">Documente</label>
            <div class="files-area" :class="{ 'files-area--drag': isDragging }"
              @dragover.prevent="isDragging = true"
              @dragleave="isDragging = false"
              @drop.prevent="onFileDrop"
            >
              <div class="files-list" v-if="files.length">
                <div v-for="(f, i) in files" :key="i" class="file-item" :class="{ 'file-item--pdf': f.type === 'application/pdf', 'file-item--ai': f._aiGenerated }">
                  <i :class="f.type === 'application/pdf' ? 'fas fa-file-pdf' : 'fas fa-file-alt'"></i>
                  <span class="file-item__name" :title="f.name">{{ f.name }}</span>
                  <span v-if="f._aiGenerated" class="file-item__ai-badge">
                    <i class="fas fa-robot"></i> AI
                  </span>
                  <button class="file-item__remove" @click="removeFile(i)">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
              <div class="files-upload">
                <label class="btn-attach">
                  <i class="fas fa-paperclip"></i>
                  Atașează
                  <input type="file" multiple @change="onFileInput" style="display:none" />
                </label>
                <span class="files-hint">
                  <i class="fas fa-info-circle" v-tooltip="'Extensii permise: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG'"></i>
                  Extensii permise
                </span>
              </div>
            </div>
          </div>

          <!-- ── Separator + Secțiune flux aprobare/avizare ── -->
          <template v-if="approveMode">
            <div class="section-divider"></div>

            <!-- Trimite spre aprobare -->
            <div class="toggle-row">
              <label class="toggle-label" :for="`approve_${uid}`">
                Trimite spre aprobare
                <input type="checkbox" :id="`approve_${uid}`" v-model="form.approveState" />
              </label>
            </div>

            <!-- Aprobator -->
            <div v-if="form.approveState" class="form-group" :class="{ 'form-group--error': errors.approver }">
              <label class="form-label">Aprobator <span class="required">*</span></label>
              <v-select
                v-model="form.approver"
                :options="filteredApprovers"
                label="label"
                placeholder="Selectați aprobatorul..."
                class="v-select-custom"
              >
                <template #option="{ label }">
                  <span class="v-select-option-info">
                    {{ label }}
                    <i v-tooltip="label" class="fas fa-info-circle"></i>
                  </span>
                </template>
              </v-select>
              <span v-if="errors.approver" class="form-error">Selectați aprobatorul.</span>
            </div>

            <!-- Trimite spre avizare -->
            <template v-if="canAvizo && form.approveState">
              <div class="section-divider section-divider--light"></div>
              <div class="toggle-row">
                <label class="toggle-label" :for="`avizo_${uid}`">
                  Trimite spre avizare
                  <input type="checkbox" :id="`avizo_${uid}`" v-model="form.revisionState" />
                </label>
              </div>

              <template v-if="form.revisionState">
                <!-- Tip flux -->
                <div class="form-group" :class="{ 'form-group--error': errors.fluxType }">
                  <label class="form-label">Selectează tipul de flux <span class="required">*</span></label>
                  <v-select
                    v-model="form.fluxType"
                    :options="fluxTypes"
                    label="title"
                    :searchable="false"
                    class="v-select-custom"
                  >
                    <template #option="item">
                      <span class="v-select-option-info">
                        {{ item.title }}
                        <i v-tooltip="{ content: item.desc, classes: ['Tooltip-large'] }" class="fas fa-info-circle"></i>
                      </span>
                    </template>
                  </v-select>
                  <span v-if="errors.fluxType" class="form-error">Selectați tipul de flux.</span>
                </div>

                <!-- Avizatori instituție -->
                <div class="form-group" :class="{ 'form-group--error': errors.avizatori }">
                  <label class="form-label">Avizatori din cadrul instituției <span class="required">*</span></label>
                  <v-select
                    :options="filteredAvizatori"
                    label="label"
                    :value="null"
                    :loading="loadingUsers"
                    :disabled="!form.approver"
                    v-tooltip="!form.approver ? 'Mai întâi alegeți aprobatorul' : ''"
                    @option:selected="addAvizator"
                    placeholder="Adaugă avizator..."
                    class="v-select-custom"
                  >
                    <template #option="{ label }">
                      <span class="v-select-option-info">
                        {{ label }}
                        <i v-tooltip="label" class="fas fa-info-circle"></i>
                      </span>
                    </template>
                  </v-select>
                  <span v-if="errors.avizatori" class="form-error">Adăugați cel puțin un avizator.</span>
                </div>

                <!-- Avizatori instituții externe -->
                <div class="form-group">
                  <label class="form-label">Avizatori din instituții externe</label>
                  <v-select
                    :options="filteredExternalAvizatori"
                    label="label"
                    :value="null"
                    :disabled="!form.approver"
                    v-tooltip="!form.approver ? 'Mai întâi alegeți aprobatorul' : ''"
                    @option:selected="addAvizator"
                    placeholder="Adaugă avizator extern..."
                    class="v-select-custom"
                  />
                </div>

                <!-- Lista avizatori selectați (drag & drop) -->
                <div v-if="form.selectedAvizatori.length" class="avizatori-list">
                  <div class="avizatori-list__label">
                    <i class="fas fa-grip-vertical" style="color:#ccc;margin-right:0.3rem"></i>
                    Ordinea avizării (trageți pentru reordonare)
                  </div>
                  <draggable v-model="form.selectedAvizatori" group="avizatori" handle=".drag-handle">
                    <div
                      v-for="(av, i) in form.selectedAvizatori"
                      :key="av.id || i"
                      class="avizator-item"
                    >
                      <span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>
                      <span class="avizator-item__nr">{{ i + 1 }}.</span>
                      <span class="avizator-item__name">{{ av.label }}</span>
                      <button class="avizator-item__remove" @click="removeAvizator(i)">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </draggable>
                </div>
              </template>
            </template>
          </template>
        </div>

        <!-- ════════════════════════════════════════
             COLOANA DREAPTĂ
        ═════════════════════════════════════════ -->
        <div class="modal-col modal-col--right">

          <!-- Caracter nevoie (read-only) -->
          <div class="form-group">
            <label class="form-label">Caracter nevoie</label>
            <input
              type="text"
              class="form-input form-input--readonly"
              :value="caracterNevoie"
              readonly
            />
          </div>

          <!-- Modalitatea pentru descrierea caracteristicilor -->
          <div class="form-group" :class="{ 'form-group--error': errors.modalitate }">
            <label class="form-label">Modalitatea utilizată pentru descrierea caracteristicilor <span class="required">*</span></label>
            <v-select
              v-model="form.modalitate"
              :options="modalitatiDesc"
              label="name"
              :searchable="false"
              class="v-select-custom"
            >
              <template #option="{ name }">
                <span class="v-select-option-info">
                  {{ name }}
                  <i v-tooltip="name" class="fas fa-info-circle"></i>
                </span>
              </template>
            </v-select>
            <span v-if="errors.modalitate" class="form-error">Selectați modalitatea.</span>
          </div>

          <!-- Caietul de sarcini (apare doar dacă modalitate id === 1) -->
          <div v-if="form.modalitate && form.modalitate.id === 1" class="form-group caiet-group">
            <label class="form-label">
              Caietul de sarcini va include trimiteri la următoarele categorii de standarde
              <small>(Legea 98/2016, art. 156, alin.(1), lit. b)</small>
            </label>
            <div class="caiet-checkboxes">
              <label v-for="(std, i) in standarde" :key="i" class="checkbox-label">
                <input type="checkbox" v-model="form.standarde[i]" />
                <span>{{ std }}</span>
              </label>
            </div>
            <span v-if="errors.standarde" class="form-error">Selectați cel puțin o categorie de standarde.</span>
          </div>

          <!-- Descriere tehnică -->
          <div class="form-group form-group--desc">
            <div class="desc-label-row">
              <label class="form-label">
                Descriere tehnică
                <button class="btn-add-desc" @click="openDescHistory" :disabled="!form.product" v-tooltip="form.product ? 'Caută în istoricul descrierilor' : 'Selectați mai întâi un produs'">
                  <i class="fas fa-plus"></i>
                </button>
              </label>
              <div class="desc-label-right">
                <span class="char-count" :class="{ 'char-count--warn': charCount > 2800 }">
                  {{ charCount }} din 3000 caractere
                </span>
                <!-- Buton lupă istoric descrieri -->
                <button
                  v-if="form.product"
                  class="btn-search-desc"
                  @click="openDescHistory"
                  v-tooltip="'Copiază din istoricul descrierilor'"
                >
                  <i class="fas fa-search-plus"></i>
                </button>
              </div>
            </div>
            <div class="editor-wrap" :class="{ 'editor-wrap--ai-filled': aiFilled.description }">
              <editor
                v-model="form.description"
                :key="`editor_${editorKey}`"
                minHeight="180"
                @input="onDescriptionInput"
              />
            </div>
            <div v-if="aiFilled.description" class="ai-filled-badge">
              <i class="fas fa-robot"></i> Descriere completată de Asistentul AI — editabilă
            </div>
          </div>

        </div>
      </div>

      <!-- Footer modal -->
      <div class="modal-footer">
        <button class="btn-back" @click="$emit('close')">Înapoi</button>
        <button
          class="btn-save"
          @click="handleSave"
          :disabled="isSaving || (form.product && form.product.status === 'in_progres')"
        >
          <i v-if="isSaving" class="fas fa-spinner fa-spin"></i>
          {{ form.approveState ? 'Salvează și Trimite' : 'Salvează' }}
        </button>
      </div>

    </div><!-- end .needs-modal -->

    <!-- ════════════════════════════════════════
         MODAL 2: Copiază descriere tehnică
    ═════════════════════════════════════════ -->
    <div v-if="showDescHistory" class="desc-history-backdrop" @click.self="showDescHistory = false">
      <div class="desc-history-modal">
        <div class="desc-history__title">Copiază descriere tehnică</div>
        <div class="desc-history__subtitle">{{ form.product ? `Nevoie: ${form.product.name}` : '' }}</div>

        <div v-if="descHistory.length" class="desc-history__body">
          <div class="desc-history__list">
            <button
              v-for="(d, i) in descHistory"
              :key="i"
              class="desc-history__item"
              :class="{ active: selectedDescIdx === i }"
              @click="selectDesc(i)"
            >
              Descriere {{ i + 1 }}
            </button>
          </div>
          <div class="desc-history__preview">
            <div v-if="selectedDescIdx === -1" class="desc-history__empty-preview">
              Nimic nu a fost selectat
            </div>
            <div v-else class="desc-history__content" v-html="descHistory[selectedDescIdx]?.technicalDescription || ''"></div>
          </div>
        </div>
        <div v-else class="desc-history__empty">
          <i class="fas fa-times"></i>
          Nu sunt descrieri tehnice similare produsului selectat
        </div>

        <div class="desc-history__footer">
          <button class="btn-back" @click="showDescHistory = false">Înapoi</button>
          <transition name="fade">
            <button v-if="selectedDescIdx > -1" class="btn-save" @click="copyDesc">Copiază</button>
          </transition>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════════════════
         AGENT AI — Drawer lateral
    ═════════════════════════════════════════ -->
    <ai-price-agent
      :visible="aiDrawerVisible"
      :product-name="form.product ? form.product.name : ''"
      :product-cpv="form.product ? form.product.cpvCategory?.cpvCode : ''"
      @close="aiDrawerVisible = false"
      @apply-price="onAiApplyPrice"
      @apply-tva="onAiApplyTva"
      @apply-description="onAiApplyDescription"
      @pdf-generated="onAiPdfGenerated"
    />

  </div>
</template>

<script>
import AiPriceAgent from './AiPriceAgent.vue'
import draggable from 'vuedraggable'
import {
  PRODUCTS_SIMPLE,
  NEEDS_ADD,
  NEEDS_MODIFY_FORMDATA,
  NEEDS_DESCRIPTION,
  USERS_ORIGIN,
  INSTITUTION,
} from '@/api.js'
import mainMixin from '@/mixins/mainMixin.js'
import { mapGetters, mapMutations } from 'vuex'

let stopWatcherDesc = false

export default {
  name: 'NeedsAddModal',
  components: { AiPriceAgent, draggable },
  mixins: [mainMixin],

  props: {
    isEdit: { type: Boolean, default: false },
    needId: { type: Number, default: null },
    origin: { type: Object, default: null }, // date existente la editare
  },
  emits: ['close', 'saved'],

  data() {
    return {
      uid: this.makeid ? this.makeid(6) : Math.random().toString(36).slice(2),

      // Form
      form: {
        product: null,
        qty: null,
        cotaTva: null,
        priceWoTva: null,
        description: '',
        modalitate: null,
        standarde: [false, false, false, false, false, false, false],
        approveState: false,
        approver: null,
        revisionState: false,
        fluxType: null,
        selectedAvizatori: [],
      },

      // Validare
      errors: {},

      // State
      isSaving: false,
      editorKey: 0,
      charCount: 0,
      isDragging: false,

      // Catalog products
      catalogProducts: [],
      loadingProducts: false,
      showAddToCatalog: false,
      searchQuery: '',

      // Flux aprobare
      approveMode: false,
      canAvizo: false,
      allUsers: [],
      externalAvizatori: [],
      loadingUsers: false,

      // Descriere history
      showDescHistory: false,
      descHistory: [],
      selectedDescIdx: -1,

      // AI Agent
      aiDrawerVisible: false,
      aiFilled: {
        priceWoTva: false,
        tva: false,
        description: false,
      },

      // Files
      files: [],

      // Modalități descriere
      modalitatiDesc: [
        { name: 'prin raportare la cerințe de performanță/funcționale', id: 0 },
        { name: 'prin trimitere la specificații tehnice însoțită de mențiunea "sau echivalent"', id: 1 },
        { name: 'prin raportare la cerințe de performanță/funcționale și prin trimitere la specificații', id: 2 },
        { name: 'prin trimitere la specificațiile pentru unele caracteristici și prin raportare la cerințe de performanță/funcționale pentru alte caracteristici', id: 3 },
      ],

      standarde: [
        'SR EN ISO',
        'Evaluări tehnice europene [acolo unde este aplicabil]',
        'Specificații tehnice comune [acolo unde este aplicabil]',
        'Standarde internaționale',
        'Sisteme de referință tehnice instituite de organisme de standardizare europene [acolo unde este aplicabil]',
        'Alte norme la nivel național care reglementează aspecte tehnice/specificații tehnice naționale',
        'Conform descrierii tehnice menționate',
      ],

      fluxTypes: [
        {
          title: 'Strict',
          id: 0,
          desc: '<ul style="padding:0 0 0 1.2rem;margin:0;text-align:left"><li>Toți avizatorii trebuie să avizeze obligatoriu</li><li>Dacă cineva respinge, nevoia se întoarce la titular</li><li>Ordinea avizelor trebuie respectată</li><li>Aprobatorul nu poate aproba înainte de toate avizele</li></ul>',
        },
        {
          title: 'Flexibil',
          id: 1,
          desc: '<ul style="padding:0 0 0 1.2rem;margin:0;text-align:left"><li>Toți avizatorii trebuie să avizeze obligatoriu</li><li>Dacă cineva respinge, nevoia nu se întoarce</li><li>Ordinea avizelor trebuie respectată</li><li>Aprobatorul nu poate aproba înainte de toate avizele</li></ul>',
        },
        {
          title: 'Facultativ',
          id: 2,
          desc: '<ul style="padding:0 0 0 1.2rem;margin:0;text-align:left"><li>Se poate aproba oricând</li><li>Avizarea se poate face în orice ordine</li></ul>',
        },
      ],
    }
  },

  computed: {
    ...mapGetters(['getInstitution']),

    institutionName() {
      return this.getInstitution?.name || this.getUserInstitution?.(true)?.name || ''
    },
    departmentName() {
      return this.getUserDepartment?.(true)?.name || ''
    },
    userName() {
      return this.getUserName?.() || ''
    },
    currentDateTime() {
      return new Date().toLocaleString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    },

    canCreateProduct() {
      return this.PERMISIONS?.productsCreate || false
    },

    // Calcule automate
    vueCuTva() {
      if (!this.form.priceWoTva || this.form.cotaTva === null || this.form.cotaTva === '') return '0,00'
      const val = parseFloat(this.form.priceWoTva) * (1 + parseFloat(this.form.cotaTva) / 100)
      return isNaN(val) ? '0,00' : val.toFixed(2).replace('.', ',')
    },
    vteFaraTva() {
      if (!this.form.priceWoTva || !this.form.qty) return '0,00'
      const val = parseFloat(this.form.priceWoTva) * parseFloat(this.form.qty)
      return isNaN(val) ? '0,00' : val.toFixed(2).replace('.', ',')
    },
    vteCuTva() {
      if (!this.form.qty) return '0,00'
      const vue = parseFloat(this.form.priceWoTva || 0) * (1 + parseFloat(this.form.cotaTva || 0) / 100)
      const val = vue * parseFloat(this.form.qty)
      return isNaN(val) ? '0,00' : val.toFixed(2).replace('.', ',')
    },

    caracterNevoie() {
      const p = this.form.product
      if (!p) return ''
      if (p.cpvCategory?.isSocial) return p.cpvCategory.description || 'Social'
      const types = { 1: 'Produse', 2: 'Servicii', 3: 'Lucrări' }
      return types[p.cpvCategory?.cpvType] || ''
    },

    filteredApprovers() {
      return this.allUsers
    },

    filteredAvizatori() {
      return this.allUsers.filter(u =>
        u.uuid !== this.form.approver?.uuid &&
        !this.form.selectedAvizatori.some(a => a.uuid === u.uuid)
      )
    },

    filteredExternalAvizatori() {
      return this.externalAvizatori.filter(u =>
        u.uuid !== this.form.approver?.uuid &&
        !this.form.selectedAvizatori.some(a => a.id === u.id)
      )
    },
  },

  watch: {
    'form.modalitate'(val) {
      if (!val || val.id !== 1) {
        this.form.standarde = [false, false, false, false, false, false, false]
      }
    },
    'form.approveState'(val) {
      if (!val) {
        this.form.approver = null
        this.form.revisionState = false
        this.form.selectedAvizatori = []
      } else {
        this.loadUsers()
      }
    },
  },

  methods: {
    ...mapMutations(['setInstitution']),

    recalculate() {
      // Valorile se recalculează prin computed
    },

    // ── Produse catalog ───────────────────────────
    async onProductSearch(query) {
      this.searchQuery = query
      this.showAddToCatalog = false
      if (!query) return
      this.loadingProducts = true
      try {
        const res = await PRODUCTS_SIMPLE(1, 20, `search=${query}`)
        const prodData = await res.json()
        this.catalogProducts = prodData?.data?.result || []
        this.showAddToCatalog = !this.catalogProducts.length
      } catch { this.catalogProducts = [] }
      finally { this.loadingProducts = false }
    },

    async onProductSelected(product) {
      this.form.description = ''
      this.editorKey++
      this.descHistory = []
      this.aiFilled = { priceWoTva: false, tva: false, description: false }

      if (product?.status !== 'completed') return

      // Încarcă istoricul descrierilor
      try {
        const res = await NEEDS_DESCRIPTION(product.id)
        const descData = await res.json()
        if (Array.isArray(descData?.data?.result) && descData.data.result.length) {
          this.descHistory = descData.data.result
        }
      } catch { /* ignore */ }
    },

    openAddToCatalog() {
      this.$emit('open-add-to-catalog', this.searchQuery)
    },

    // ── Descriere history ─────────────────────────
    openDescHistory() {
      if (!this.form.product) return
      this.selectedDescIdx = -1
      this.showDescHistory = true
    },
    selectDesc(i) {
      this.selectedDescIdx = this.selectedDescIdx === i ? -1 : i
    },
    copyDesc() {
      const found = this.descHistory[this.selectedDescIdx]
      if (found?.technicalDescription) {
        stopWatcherDesc = true
        this.form.description = found.technicalDescription
        this.editorKey++
        this.aiFilled.description = false
        this.showDescHistory = false
        this.selectedDescIdx = -1
      }
    },

    onDescriptionInput(val) {
      if (stopWatcherDesc) { stopWatcherDesc = false; return }
      // Calcul caractere (strip HTML)
      const tmp = document.createElement('div')
      tmp.innerHTML = val || ''
      this.charCount = (tmp.textContent || tmp.innerText || '').length
    },

    // ── Files ─────────────────────────────────────
    onFileInput(e) {
      const newFiles = Array.from(e.target.files).map(f => f)
      this.files.push(...newFiles)
      e.target.value = ''
    },
    onFileDrop(e) {
      this.isDragging = false
      const newFiles = Array.from(e.dataTransfer.files)
      this.files.push(...newFiles)
    },
    removeFile(i) {
      this.files.splice(i, 1)
    },

    // ── Avizatori ─────────────────────────────────
    async loadUsers() {
      if (this.allUsers.length || this.loadingUsers) return
      this.loadingUsers = true
      try {
        const res = await USERS_ORIGIN()
        const originData = await res.json()
        const myUuid = this.getUuid?.()
        const users = originData?.data?.result?.filter(u => u.uuid !== myUuid) || []
        this.allUsers = users.flatMap(u =>
          (u.userRoles || [])
            .filter(r => r.role !== 'admin_institutie')
            .map(r => ({
              id: r.id,
              uuid: u.uuid,
              label: `${u.last_name} ${u.first_name} / ${u.id}${r.department?.name ? ` — ${r.department.name}` : ''} — ${this.changeRoleView?.(r.role) || r.role}`,
              departmentId: r.department?.id,
              role: r.role,
            }))
        )
        this.externalAvizatori = (originData?.data?.externalApproveBy || []).map(e => ({
          ...e,
          id: e.id,
          uuid: e.user?.uuid,
          label: `${this.readUserObject?.(e.user) || ''} — ${e.institution?.name || ''}${e.department ? ` — ${e.department.name}` : ''}`,
        }))
      } catch { /* ignore */ }
      finally { this.loadingUsers = false }
    },

    addAvizator(option) {
      if (!this.form.selectedAvizatori.some(a => a.uuid === option.uuid)) {
        this.form.selectedAvizatori.unshift(option)
      }
    },
    removeAvizator(i) {
      this.form.selectedAvizatori.splice(i, 1)
    },

    // ── AI Agent callbacks ────────────────────────
    onAiApplyPrice(val) {
      this.form.priceWoTva = val
      this.aiFilled.priceWoTva = true
    },
    onAiApplyTva(val) {
      this.form.cotaTva = val
      this.aiFilled.tva = true
    },
    onAiApplyDescription(val) {
      this.form.description = val
      this.editorKey++
      this.aiFilled.description = true
    },
    onAiPdfGenerated(file) {
      // Marchează fișierul ca generat de AI pentru afișare distinctă
      file._aiGenerated = true
      this.files.push(file)
    },

    // ── Validare ──────────────────────────────────
    validate() {
      const e = {}
      if (!this.form.product) e.product = true
      if (!this.form.qty || this.form.qty <= 0) e.qty = true
      if (this.form.cotaTva === null || this.form.cotaTva === '') e.cotaTva = true
      if (!this.form.priceWoTva || this.form.priceWoTva <= 0) e.priceWoTva = true
      if (!this.form.modalitate) e.modalitate = true
      if (this.form.modalitate?.id === 1 && !this.form.standarde.some(Boolean)) e.standarde = true
      if (this.form.approveState && !this.form.approver) e.approver = true
      if (this.form.revisionState && !this.form.fluxType) e.fluxType = true
      if (this.form.revisionState && !this.form.selectedAvizatori.length) e.avizatori = true
      this.errors = e
      return !Object.keys(e).length
    },

    // ── Salvare ───────────────────────────────────
    async handleSave() {
      if (!this.validate()) return
      this.isSaving = true
      try {
        const role = window.$getRoleAll?.()
        const formData = new FormData()

        formData.append('product', +this.form.product.id)
        formData.append('qty', +this.form.qty)
        formData.append('estimatedPriceWoTva', this.form.priceWoTva)
        formData.append('cotaTva', this.form.cotaTva)
        formData.append('needIsSocial', this.form.product.cpvCategory?.isSocial || false)
        formData.append('status', this.form.approveState ? 'pending' : 'generated')
        formData.append('modalitateaUtilizataDescriereaCaracteristicilor', this.form.modalitate.name)
        if (this.form.description) formData.append('technicalDescription', this.form.description)
        if (role?.institutionId !== undefined) formData.append('institution', +role.institutionId)
        if (role?.departmentId !== undefined) formData.append('department', +role.departmentId)

        const decodeToken = this.$jwt?.decode(this.$jwt?.getToken())
        if (decodeToken?.id) {
          formData.append('createdByUserId', +decodeToken.id)
          formData.append('lastInteractedUserId', +decodeToken.id)
        }
        formData.append('createdByUserRole', this.getUserRole?.(true) || '')

        if (this.form.approveState && this.form.approver) {
          formData.append('approvers', JSON.stringify([`${this.form.approver.uuid}*${this.form.approver.id}*${this.form.approver.label}`]))
        }

        if (this.form.revisionState && this.form.fluxType) {
          formData.append('avizoMode', this.form.fluxType.title)
          formData.append('requestedAvizo', true)
          formData.append('avizatorii', JSON.stringify(
            this.form.selectedAvizatori.map((av, i) => ({
              userUUID: av.uuid,
              userRole: av.id,
              approvalOrder: i,
              action: 'undefined',
              reason: '',
            }))
          ))
        }

        // Standarde caiet de sarcini
        if (this.form.modalitate?.id === 1) {
          const selectedStd = this.standarde.filter((_, i) => this.form.standarde[i])
          formData.append('caietulDeSarciniTrimiteri', selectedStd)
        }

        // Fișiere atașate (inclusiv PDF generat de AI)
        this.files.forEach(f => formData.append('files', f))

        const res = this.isEdit
          ? await NEEDS_MODIFY_FORMDATA(this.needId, formData)
          : await NEEDS_ADD(formData)

        const ok = res?.meta?.HttpStatusCode && String(res.meta.HttpStatusCode)[0] === '2'
        if (ok) {
          this.$toastr?.s(this.isEdit ? 'Necesitate modificată.' : 'Necesitate salvată.')
          this.$emit('saved')
          this.$emit('close')
        } else {
          const msg = this.isObject?.(res.response) ? res.response.message : res.response
          this.$toastr?.e(msg || 'Încercați mai târziu.')
        }
      } catch (e) {
        this.$toastr?.e(e)
      } finally {
        this.isSaving = false
      }
    },

    // ── Init ──────────────────────────────────────
    async initInstitution() {
      const instId = this.getUserInstitution?.(true)?.id
      if (!instId) return
      try {
        const res = await INSTITUTION(instId)
        const instData = await res.json()
        if (instData?.data?.result) {
          this.approveMode = instData.data.result.approveMode || false
          this.canAvizo = instData.data.result.avizoMode || false
          this.setInstitution(instData.data.result)
        }
      } catch { /* ignore */ }
    },

    // Populare date la editare
    populateForm() {
      if (!this.origin) return
      const o = this.origin
      this.form.product = o.product || null
      this.form.qty = o.qty || null
      this.form.cotaTva = o.cotaTva || null
      this.form.priceWoTva = o.estimatedPriceWoTva || null
      this.form.description = o.technicalDescription || ''
      const mod = this.modalitatiDesc.find(m => m.name === o.modalitateaUtilizataDescriereaCaracteristicilor)
      if (mod) this.form.modalitate = mod
      this.editorKey++
    },
  },

  async created() {
    await this.initInstitution()
    if (this.isEdit && this.origin) this.populateForm()
  },
}
</script>

<style scoped>
/* ── Backdrop ───────────────────────────────── */
.needs-modal-backdrop {
  position: fixed; inset: 0; z-index: 9000;
  background: rgba(0,0,0,0.45);
  display: flex; align-items: flex-start; justify-content: center;
  padding: 2rem 1rem;
  overflow-y: auto;
}

/* ── Modal ──────────────────────────────────── */
.needs-modal {
  background: #fff;
  border-radius: 12px;
  width: 100%;
  max-width: 900px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  display: flex; flex-direction: column;
  position: relative;
  transition: max-width 0.3s ease;
}
.needs-modal--wide { max-width: 1340px; }

/* ── Header ─────────────────────────────────── */
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #eee;
}
.modal-header__title { font-size: 1.25rem; font-weight: 700; color: #1a1a2e; }
.modal-header__actions { display: flex; align-items: center; gap: 0.75rem; }

.btn-ai-toggle {
  display: flex; align-items: center; gap: 0.4rem;
  background: #f0f4ff; color: #1565C0;
  border: 1.5px solid #c5d8fb;
  border-radius: 8px; padding: 0.45rem 0.85rem;
  font-size: 0.82rem; font-weight: 600; cursor: pointer;
  transition: all 0.2s; position: relative;
}
.btn-ai-toggle:hover, .btn-ai-toggle.active {
  background: linear-gradient(135deg, #1565C0, #1E88E5);
  color: #fff; border-color: transparent;
}
.ai-active-dot {
  position: absolute; top: -4px; right: -4px;
  width: 8px; height: 8px; border-radius: 50%;
  background: #27ae60; border: 2px solid #fff;
}

.modal-close {
  background: none; border: none; cursor: pointer;
  width: 32px; height: 32px; border-radius: 6px;
  color: #888; font-size: 1rem;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.modal-close:hover { background: #f5f5f5; color: #333; }

/* ── Body ───────────────────────────────────── */
.modal-body {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 0; flex: 1;
}

.modal-col {
  padding: 1.25rem 1.5rem;
}
.modal-col--left { border-right: 1px solid #f0f0f0; }

/* ── Info header ────────────────────────────── */
.info-header {
  background: #f8f9fb; border-radius: 8px;
  padding: 0.75rem 1rem; margin-bottom: 1rem;
  position: relative;
}
.info-row {
  display: flex; align-items: center; gap: 0.5rem;
  font-size: 0.82rem; color: #555; padding: 0.15rem 0;
}
.info-row i { color: #1565C0; width: 14px; text-align: center; flex-shrink: 0; }
.info-date {
  position: absolute; right: 0.75rem; bottom: 0.75rem;
  font-size: 0.75rem; color: #aaa;
}

/* ── Form elements ──────────────────────────── */
.form-group { display: flex; flex-direction: column; gap: 0.3rem; margin-bottom: 0.9rem; }
.form-group--error .form-label { color: #e53935; }
.form-group--desc { flex: 1; display: flex; flex-direction: column; }

.form-label {
  font-size: 0.78rem; font-weight: 600; color: #555;
  display: flex; align-items: center; gap: 0.4rem;
}
.required { color: #e53935; }

.form-input {
  width: 100%; padding: 0.55rem 0.75rem;
  border: 1.5px solid #e0e4ef; border-radius: 7px;
  font-size: 0.875rem; color: #1a1a2e;
  font-family: inherit; outline: none;
  transition: border-color 0.2s;
}
.form-input:focus { border-color: #1565C0; }
.form-input--readonly { background: #f8f9fb; color: #888; cursor: default; }
.form-input--computed { background: #f0f4ff; color: #1565C0; font-weight: 600; }
.form-input--ai-filled { border-color: #1565C0; background: #f0f7ff; }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }

.form-error { font-size: 0.73rem; color: #e53935; }
.form-warning { font-size: 0.73rem; color: #f57c00; display: flex; align-items: center; gap: 0.3rem; }
.form-ai-hint { font-size: 0.72rem; color: #1565C0; display: flex; align-items: center; gap: 0.25rem; }

/* v-select custom */
.v-select-custom { font-size: 0.875rem; }
.product-option { display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 0.5rem; }
.status-pending { font-size: 0.75rem; color: #f57c00; font-style: italic; }
.status-icon--pending { color: #f57c00; }
.status-icon--ok { color: #27ae60; }
.v-select-option-info { display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 0.5rem; }

/* Add to catalog footer */
.add-to-catalog { list-style: none; padding: 0.5rem; border-top: 1px solid #eee; }
.add-to-catalog__btn {
  display: flex; align-items: center; gap: 0.4rem; width: 100%;
  background: #e8f0fe; color: #1565C0;
  border: none; border-radius: 6px;
  padding: 0.5rem 0.75rem; font-size: 0.82rem; font-weight: 600;
  cursor: pointer; justify-content: center;
  transition: background 0.2s;
}
.add-to-catalog__btn:hover { background: #1565C0; color: #fff; }

/* ── Files ──────────────────────────────────── */
.files-area {
  border: 1.5px dashed #e0e4ef; border-radius: 8px;
  padding: 0.75rem; transition: border-color 0.2s;
}
.files-area--drag { border-color: #1565C0; background: #f0f4ff; }
.files-list { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 0.5rem; }
.file-item {
  display: flex; align-items: center; gap: 0.5rem;
  background: #f8f9fb; border-radius: 6px; padding: 0.4rem 0.6rem;
  font-size: 0.8rem;
}
.file-item--pdf i:first-child { color: #e53935; }
.file-item--ai { border-left: 3px solid #1565C0; }
.file-item__name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #333; }
.file-item__ai-badge {
  font-size: 0.68rem; background: #e8f0fe; color: #1565C0;
  padding: 0.1rem 0.4rem; border-radius: 10px; font-weight: 600;
  display: flex; align-items: center; gap: 0.2rem; white-space: nowrap;
}
.file-item__remove {
  background: none; border: none; cursor: pointer; color: #bbb;
  font-size: 0.8rem; padding: 0; line-height: 1;
}
.file-item__remove:hover { color: #e53935; }
.files-upload { display: flex; align-items: center; gap: 0.75rem; }
.btn-attach {
  display: flex; align-items: center; gap: 0.4rem;
  background: #fff; border: 1.5px solid #e0e4ef;
  border-radius: 6px; padding: 0.4rem 0.75rem;
  font-size: 0.8rem; color: #555; cursor: pointer;
  transition: all 0.2s;
}
.btn-attach:hover { border-color: #1565C0; color: #1565C0; }
.files-hint { font-size: 0.73rem; color: #aaa; display: flex; align-items: center; gap: 0.3rem; }

/* ── Flux aprobare ───────────────────────────── */
.section-divider { height: 1px; background: #f0f0f0; margin: 0.75rem 0; }
.section-divider--light { margin: 0.5rem 0; }
.toggle-row { display: flex; justify-content: flex-end; margin-bottom: 0.5rem; }
.toggle-label {
  display: flex; align-items: center; gap: 0.5rem;
  font-size: 0.85rem; color: #333; cursor: pointer;
}
.toggle-label input[type="checkbox"] { width: 15px; height: 15px; cursor: pointer; }

/* Avizatori */
.avizatori-list { margin-top: 0.75rem; }
.avizatori-list__label { font-size: 0.73rem; color: #aaa; margin-bottom: 0.4rem; display: flex; align-items: center; }
.avizator-item {
  display: flex; align-items: center; gap: 0.5rem;
  background: #f8f9fb; border: 1px solid #e0e4ef;
  border-radius: 6px; padding: 0.45rem 0.6rem;
  margin-bottom: 0.3rem; font-size: 0.82rem;
}
.drag-handle { color: #ccc; cursor: grab; font-size: 0.9rem; }
.avizator-item__nr { font-weight: 700; color: #1565C0; min-width: 1.2rem; }
.avizator-item__name { flex: 1; color: #333; }
.avizator-item__remove {
  background: none; border: none; cursor: pointer;
  color: #ccc; font-size: 0.8rem; padding: 0;
}
.avizator-item__remove:hover { color: #e53935; }

/* Caiet standarde */
.caiet-group .form-label small { display: block; font-size: 0.68rem; color: #aaa; font-weight: normal; margin-top: 0.1rem; }
.caiet-checkboxes { display: flex; flex-direction: column; gap: 0.4rem; }
.checkbox-label {
  display: flex; align-items: flex-start; gap: 0.5rem;
  font-size: 0.8rem; color: #555; cursor: pointer; line-height: 1.4;
}
.checkbox-label input { flex-shrink: 0; margin-top: 2px; }

/* ── Descriere tehnică ──────────────────────── */
.desc-label-row {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 0.3rem;
}
.desc-label-right { display: flex; align-items: center; gap: 0.5rem; }
.char-count { font-size: 0.73rem; color: #aaa; }
.char-count--warn { color: #f57c00; font-weight: 600; }

.btn-add-desc, .btn-search-desc {
  background: none; border: none; cursor: pointer;
  color: #1565C0; font-size: 0.9rem; padding: 0.1rem 0.2rem;
  border-radius: 4px; line-height: 1;
  transition: background 0.2s;
}
.btn-add-desc:hover, .btn-search-desc:hover { background: #e8f0fe; }
.btn-add-desc:disabled { opacity: 0.4; cursor: not-allowed; }

.editor-wrap { border-radius: 7px; overflow: hidden; transition: box-shadow 0.2s; }
.editor-wrap--ai-filled { box-shadow: 0 0 0 2px #1565C0; }

.ai-filled-badge {
  margin-top: 0.3rem; font-size: 0.72rem; color: #1565C0;
  display: flex; align-items: center; gap: 0.3rem;
  background: #e8f0fe; padding: 0.25rem 0.5rem; border-radius: 5px;
}

/* ── Modal descriere history ────────────────── */
.desc-history-backdrop {
  position: fixed; inset: 0; z-index: 9500;
  background: rgba(0,0,0,0.3);
  display: flex; align-items: center; justify-content: center;
}
.desc-history-modal {
  background: #fff; border-radius: 12px;
  width: 700px; max-width: 95vw;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  display: flex; flex-direction: column;
  max-height: 80vh;
}
.desc-history__title {
  font-size: 1.1rem; font-weight: 700; color: #1a1a2e;
  text-align: center; padding: 1.25rem 1.5rem 0.25rem;
}
.desc-history__subtitle {
  text-align: center; font-size: 0.85rem; color: #888;
  padding: 0 1.5rem 0.75rem;
}
.desc-history__body {
  display: flex; flex: 1; overflow: hidden;
  border-top: 1px solid #eee;
}
.desc-history__list {
  width: 160px; min-width: 160px;
  border-right: 1px solid #eee;
  overflow-y: auto; padding: 0.75rem;
  display: flex; flex-direction: column; gap: 0.3rem;
}
.desc-history__item {
  width: 100%; padding: 0.5rem 0.75rem;
  background: #f8f9fb; border: 1.5px solid #e0e4ef;
  border-radius: 6px; font-size: 0.82rem; color: #555;
  cursor: pointer; text-align: left;
  transition: all 0.2s;
}
.desc-history__item.active {
  background: #1565C0; color: #fff; border-color: #1565C0;
}
.desc-history__preview {
  flex: 1; padding: 1rem; overflow-y: auto; font-size: 0.85rem; color: #333; line-height: 1.6;
}
.desc-history__empty-preview { color: #bbb; text-align: center; margin-top: 2rem; }
.desc-history__empty {
  text-align: center; padding: 2.5rem;
  color: #aaa; font-size: 0.9rem;
  display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
}
.desc-history__empty i { font-size: 2rem; }
.desc-history__footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.9rem 1.5rem;
  border-top: 1px solid #eee;
}

/* ── Footer modal ───────────────────────────── */
.modal-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
}
.btn-back {
  background: #f0f0f0; color: #555; border: none;
  border-radius: 7px; padding: 0.6rem 1.5rem;
  font-size: 0.9rem; font-weight: 600; cursor: pointer;
  transition: background 0.2s;
}
.btn-back:hover { background: #e0e0e0; }
.btn-save {
  display: flex; align-items: center; gap: 0.4rem;
  background: linear-gradient(135deg, #1565C0, #1E88E5);
  color: #fff; border: none; border-radius: 7px;
  padding: 0.6rem 1.75rem; font-size: 0.9rem; font-weight: 700;
  cursor: pointer; transition: opacity 0.2s;
}
.btn-save:hover:not(:disabled) { opacity: 0.9; }
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Fade ───────────────────────────────────── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter, .fade-leave-to { opacity: 0; }
</style>
