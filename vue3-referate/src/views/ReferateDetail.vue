<template>
  <div class="page-container">

    <div class="page-banner">
      <div class="breadcrumb">
        <span class="breadcrumb-link" @click="$router.push(`/${navigation}/referate`)">Acasă</span>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-link" @click="$router.push(`/${navigation}/referate`)">Referate necesitate</span>
        <span class="breadcrumb-sep">/</span>
        <span>{{ reference.name || 'Referat' }}</span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <span class="spinner-lg"></span>
      <p>Se încarcă referatul...</p>
    </div>

    <div v-else-if="!reference.id" class="access-denied">
      <span class="access-icon">⚠️</span>
      <p>Referatul nu a fost găsit sau nu ai acces.</p>
    </div>

    <div v-else class="detail-layout">

      <!-- Sidebar stânga — Cuprins secțiuni + acțiuni -->
      <div class="detail-sidebar">

        <!-- Info referat -->
        <div class="sidebar-info">
          <div class="sidebar-status">
            <i :class="statusIcon.icon" :style="statusIcon.css"></i>
            <span class="sidebar-status-label">{{ statusLabels[reference.needReferateStatus] || '-' }}</span>
          </div>
          <div class="sidebar-name">{{ reference.name }}</div>
          <div class="sidebar-meta">Anul: {{ reference.nryear }}</div>
          <div class="sidebar-meta">{{ reference.department?.name }}</div>
        </div>

        <!-- Pas 1/2 indicator -->
        <div class="step-indicator" v-if="isOwner">
          <div :class="['step-dot', !viewFinally ? 'step-dot--active' : 'step-dot--done']">1</div>
          <div class="step-line"></div>
          <div :class="['step-dot', viewFinally ? 'step-dot--active' : '']">2</div>
          <span class="step-label">{{ viewFinally ? 'Pasul 2/2 — Finalizare' : 'Pasul 1/2 — Completare' }}</span>
        </div>

        <!-- Cuprins secțiuni — validare vizuală -->
        <div class="sections-nav">
          <div
            v-for="sec in visibleSections"
            :key="sec.id"
            :class="['section-nav-item',
              activeSectionId === sec.id ? 'section-nav-item--active' : '',
              sec.valide === false ? 'section-nav-item--invalid' : '',
              sec.valide === true  ? 'section-nav-item--valid'   : ''
            ]"
            @click="scrollToSection(sec.id)"
          >
            <span :class="['section-nav-icon',
              sec.valide === false ? 'icon-invalid' : '',
              sec.valide === true  ? 'icon-valid'   : ''
            ]">
              {{ sec.valide === false ? '✕' : sec.valide === true ? '✓' : '○' }}
            </span>
            <span class="section-nav-label">{{ sec.shortName }}</span>
          </div>
        </div>

        <!-- Butoane acțiune -->
        <div class="sidebar-actions" v-if="isOwner && !isReadonly">

          <!-- Trimite spre completare — apare înainte de Înainte -->
          <button
            v-if="canSendToComplete"
            class="btn btn-warning btn-block"
            :disabled="saving || reference.needReferateStatus === 'completion'"
            :title="sendToCompleteTooltip"
            @click="sendToComplete"
          >
            <i class="fas fa-paper-plane"></i>
            Trimite spre completare
          </button>

          <!-- Înainte / Finalizează / Salvează și Trimite -->
          <button
            v-if="!viewFinally"
            class="btn btn-primary btn-block"
            :disabled="saving"
            @click="nextStep"
          >
            <span v-if="saving" class="spinner spinner-white"></span>
            Înainte
          </button>

          <button
            v-else
            class="btn btn-primary btn-block"
            :disabled="saving || generatingPdf"
            @click="nextStep"
          >
            <span v-if="saving || generatingPdf" class="spinner spinner-white"></span>
            {{ isFinished ? 'Salvează și Trimite' : 'Finalizează' }}
          </button>

          <!-- Înapoi (din pasul 2) -->
          <button
            v-if="viewFinally"
            class="btn btn-secondary btn-block"
            @click="previousStep"
          >
            Înapoi
          </button>
        </div>

        <!-- Buton Salvează completare (supervizor_achizitii / responsabil_buget) -->
        <div class="sidebar-actions" v-if="canSaveCompletion">
          <button class="btn btn-primary btn-block" :disabled="saving" @click="saveCompletion">
            <span v-if="saving" class="spinner spinner-white"></span>
            Salvează
          </button>
        </div>
      </div>

      <!-- Conținut principal -->
      <div class="detail-main" ref="mainContent">

        <!-- Pasul 2: Preview PDF + confirmare -->
        <div v-if="viewFinally" class="finally-view">
          <div class="finally-header">
            <h2>Pasul 2 — Verificați documentul generat</h2>
            <p>Verificați PDF-ul de mai jos. Dacă totul este corect, apăsați "Finalizează" pentru a trimite spre semnare.</p>
          </div>
          <div class="pdf-preview-placeholder">
            <i class="fas fa-file-pdf" style="font-size:4rem;color:#e53935;"></i>
            <p>PDF generat — {{ reference.name }}</p>
            <span class="pdf-generating" v-if="generatingPdf">
              <span class="spinner"></span> Se generează PDF...
            </span>
          </div>
        </div>

        <!-- Pasul 1: Formularul complet -->
        <div v-else>

          <!-- ══ SECȚIUNEA 7 — Informații referat (header, read-only) ══ -->
          <div class="section-card section-info" id="section-info">
            <div class="section-header">
              <h3 class="section-title">Informații referat</h3>
            </div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Denumirea referat:</span>
                <span>{{ reference.name }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Utilizatorul:</span>
                <span>{{ formatName(reference.createdByUser) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Instituția:</span>
                <span>{{ reference.institution?.name }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Data creării:</span>
                <span>{{ formatDate(reference.createdAt) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Departamentul:</span>
                <span>{{ reference.department?.name }}</span>
              </div>
            </div>
          </div>

          <!-- ══ SECȚIUNEA 13 — Modalitate centralizare PAAP (supervizor_achizitii) ══ -->
          <div
            v-if="showSection13"
            class="section-card"
            id="section-13"
            :class="{ 'section-card--invalid': valideSections[13] === false, 'section-card--valid': valideSections[13] === true }"
          >
            <div class="section-header">
              <span class="section-valide-icon">
                {{ valideSections[13] === false ? '✕' : valideSections[13] === true ? '✓' : '○' }}
              </span>
              <h3 class="section-title">Modalitatea de centralizare în PAAP</h3>
              <span class="section-badge section-badge--paap">PAAP</span>
            </div>
            <div class="section-body">
              <!-- Tip centralizare -->
              <div class="form-group">
                <label class="form-label">Tipul de centralizare <span class="required">*</span></label>
                <select
                  v-model="formData.modalitateDeCentralizareType"
                  class="form-select"
                  :disabled="!canSetModalitateDeCentralizare"
                  @change="onCentralizareTypeChange"
                >
                  <option value="">— Selectează —</option>
                  <option
                    v-for="opt in centralizareTypes"
                    :key="opt.key"
                    :value="opt"
                  >{{ opt.label }}</option>
                </select>
              </div>
              <!-- Valoarea centralizare — dependent de tip -->
              <div class="form-group" v-if="centralizareOptions.length > 0">
                <label class="form-label">Modalitatea de centralizare <span class="required">*</span></label>
                <select
                  v-model="formData.modalitateDeCentralizare"
                  class="form-select"
                  :disabled="!canSetModalitateDeCentralizare"
                >
                  <option value="">— Selectează —</option>
                  <option
                    v-for="opt in centralizareOptions"
                    :key="opt.key"
                    :value="opt"
                  >{{ opt.label }}</option>
                </select>
              </div>
              <p v-if="!canSetModalitateDeCentralizare" class="section-note">
                Această secțiune este completată de Supervizorul de achiziții.
              </p>
            </div>
          </div>

          <!-- ══ SECȚIUNEA 14 — Clasificație bugetară (responsabil_buget) ══ -->
          <div
            v-if="showSection14"
            class="section-card"
            id="section-14"
            :class="{ 'section-card--invalid': valideSections[14] === false, 'section-card--valid': valideSections[14] === true }"
          >
            <div class="section-header">
              <span class="section-valide-icon">
                {{ valideSections[14] === false ? '✕' : valideSections[14] === true ? '✓' : '○' }}
              </span>
              <h3 class="section-title">Clasificație bugetară</h3>
              <span class="section-badge section-badge--budget">BUGET</span>
            </div>
            <div class="section-body">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Clasificație funcțională <span class="required">*</span></label>
                  <!-- TODO: Înlocuiește cu vue-select cu opțiuni din BUGETARE.get filtrat după 'functional' -->
                  <select v-model="formData.budgetClassificationFunctional" class="form-select" :disabled="!canSetBudgetClassification">
                    <option value="">— Selectează —</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Clasificație economică <span class="required">*</span></label>
                  <!-- TODO: Înlocuiește cu vue-select cu opțiuni din BUGETARE.get filtrat după 'economic' -->
                  <select v-model="formData.budgetClassificationEconomic" class="form-select" :disabled="!canSetBudgetClassification">
                    <option value="">— Selectează —</option>
                  </select>
                </div>
              </div>
              <p v-if="!canSetBudgetClassification" class="section-note">
                Această secțiune este completată de Responsabilul de buget.
              </p>
            </div>
          </div>

          <!-- ══ SECȚIUNEA 0 — Descrierea produselor/serviciilor/lucrărilor ══ -->
          <div class="section-card" id="section-0"
            :class="{ 'section-card--invalid': valideSections[0] === false, 'section-card--valid': valideSections[0] === true }">
            <div class="section-header">
              <span class="section-valide-icon">{{ getSectionIcon(0) }}</span>
              <h3 class="section-title">Descrierea {{ achizitionCategory[1] || 'itemilor' }}</h3>
            </div>
            <div class="section-body">
              <!-- Tabel produse — date din need, read-only -->
              <div class="products-table-wrap">
                <table class="products-table">
                  <thead>
                    <tr>
                      <th>Denumire propunere</th>
                      <th>Solicitant / Id</th>
                      <th>Data creării</th>
                      <th>Cod CPV</th>
                      <th>U.M.</th>
                      <th>Cantitate</th>
                      <th>Val. unit. fără TVA</th>
                      <th>Val. unit. cu TVA</th>
                      <th>Val. totală fără TVA</th>
                      <th>Val. totală cu TVA</th>
                      <th>Descriere tehnică</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in productsTableData" :key="item.id">
                      <td>{{ item.name }}</td>
                      <td>{{ item.requestor }}</td>
                      <td>{{ item.date }}</td>
                      <td class="cpv-cell">{{ item.cpv }}</td>
                      <td>{{ item.mu }}</td>
                      <td>{{ item.qty }}</td>
                      <td class="num-cell">{{ item.priceUnit }}</td>
                      <td class="num-cell">{{ item.priceUnitTva }}</td>
                      <td class="num-cell">{{ item.priceTotal }}</td>
                      <td class="num-cell">{{ item.priceTotalTva }}</td>
                      <td class="desc-cell" v-html="item.technicalDescription || '—'"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- ══ SECȚIUNEA 1 — Obiectul referatului ══ -->
          <div class="section-card" id="section-1">
            <div class="section-header">
              <h3 class="section-title">Obiectul referatului de necesitate</h3>
            </div>
            <div class="section-body">
              <!-- Destinația achiziției — checkbox-uri -->
              <div class="form-group">
                <label class="form-label">Destinaţia achiziţiei <span class="required">*</span></label>
                <div class="checkbox-group">
                  <label class="checkbox-item">
                    <input type="checkbox" :value="'one'" v-model="formData.achizitionDestination" :disabled="isReadonly" />
                    Realizarea unui interes public
                  </label>
                  <label class="checkbox-item">
                    <input type="checkbox" :value="'two'" v-model="formData.achizitionDestination" :disabled="isReadonly" />
                    Asigurarea funcționării autorității contractante
                  </label>
                </div>
              </div>
              <!-- Tipul contractului — checkbox-uri -->
              <div class="form-group">
                <label class="form-label">Tipul contractului <span class="required">*</span></label>
                <div class="checkbox-group">
                  <label class="checkbox-item">
                    <input type="checkbox" :value="'one'" v-model="formData.achizitionType" :disabled="isReadonly" />
                    Contract
                  </label>
                  <label class="checkbox-item">
                    <input type="checkbox" :value="'two'" v-model="formData.achizitionType" :disabled="isReadonly" />
                    Factură
                  </label>
                  <label class="checkbox-item">
                    <input type="checkbox" :value="'three'" v-model="formData.achizitionType" :disabled="isReadonly" />
                    Acord-Cadru
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- ══ SECȚIUNEA 2 — Contribuția la obiective ══ -->
          <div class="section-card section-collapsible" id="section-2"
            :class="{ 'section-card--invalid': valideSections[2] === false }">
            <div class="section-header section-header--clickable" @click="toggleSection('S2')">
              <span class="section-valide-icon">{{ getSectionIcon(2) }}</span>
              <h3 class="section-title">Contribuția achiziției la îndeplinirea obiectivelor</h3>
              <span class="section-chevron">{{ openSections.S2 ? '▲' : '▼' }}</span>
            </div>
            <div v-show="openSections.S2" class="section-body">
              <!-- Obiectivele autorității contractante -->
              <div class="form-group">
                <label class="form-label">Obiectivele autorităţii contractante</label>
                <!-- TODO: multi-select cu ANNUAL_INSTITUTION_OBJECTIVES filtrat după nryear -->
                <p class="field-note">Se completează cu obiectivele anuale ale instituției pentru anul {{ reference.nryear }}.</p>
              </div>
              <!-- Obiectivele proiectului -->
              <div class="form-group">
                <label class="form-label">Obiectivele proiectului</label>
                <textarea v-model="formData.obiectiveleProiectului" class="form-textarea" rows="3" :readonly="isReadonly"
                  placeholder="Introduceți obiectivele proiectului..."></textarea>
              </div>
              <!-- Obiectivele din strategie -->
              <div class="form-group">
                <label class="form-label">Obiectivele din strategia locală/regională/naţională</label>
                <textarea v-model="formData.obiectiveleDinStrategia" class="form-textarea" rows="3" :readonly="isReadonly"
                  placeholder="Introduceți obiectivele din strategie..."></textarea>
              </div>
              <!-- Beneficii -->
              <div class="form-group">
                <label class="form-label">Beneficiile obținute după satisfacerea necesității</label>
                <textarea v-model="formData.beneficiiDupaSatisfacerea" class="form-textarea" rows="3" :readonly="isReadonly"
                  placeholder="Introduceți beneficiile așteptate..."></textarea>
              </div>
            </div>
          </div>

          <!-- ══ SECȚIUNEA 3 — Fundamentarea necesității ══ -->
          <div class="section-card section-collapsible" id="section-3"
            :class="{ 'section-card--invalid': valideSections[3] === false }">
            <div class="section-header section-header--clickable" @click="toggleSection('S3')">
              <span class="section-valide-icon">{{ getSectionIcon(3) }}</span>
              <h3 class="section-title">Fundamentarea necesității</h3>
              <span class="section-chevron">{{ openSections.S3 ? '▲' : '▼' }}</span>
            </div>
            <div v-show="openSections.S3" class="section-body">
              <div class="form-group">
                <label class="form-label">Fundamentarea necesității <span class="required">*</span></label>
                <textarea v-model="formData.fundamentNeed" class="form-textarea" rows="5" :readonly="isReadonly"
                  placeholder="Introduceți fundamentarea necesității..."></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Necesitatea identificată</label>
                <textarea v-model="formData.identifiedNeed" class="form-textarea" rows="4" :readonly="isReadonly"
                  placeholder="Descrieți necesitatea identificată..."></textarea>
              </div>
            </div>
          </div>

          <!-- ══ SECȚIUNEA 4 — Nevoia în contextul legislației ══ -->
          <div class="section-card section-collapsible" id="section-4"
            :class="{ 'section-card--invalid': valideSections[4] === false }">
            <div class="section-header section-header--clickable" @click="toggleSection('S4')">
              <span class="section-valide-icon">{{ getSectionIcon(4) }}</span>
              <h3 class="section-title">Nevoia în contextul legislației</h3>
              <span class="section-chevron">{{ openSections.S4 ? '▲' : '▼' }}</span>
            </div>
            <div v-show="openSections.S4" class="section-body">
              <!-- Coduri CPV + legislație -->
              <div class="form-group">
                <label class="form-label">Cod CPV dominant</label>
                <div class="cpv-list">
                  <div v-for="cpv in cpvCodes" :key="cpv.cpvCode" class="cpv-item">
                    <span class="cpv-badge">{{ cpv._label || 'Produs' }}</span>
                    <span class="cpv-code-val">{{ cpv.cpvCode }}</span>
                    <span class="cpv-name">{{ cpv.name }}</span>
                    <span class="cpv-qty">{{ cpv.qty }} {{ cpv.mu }}</span>
                  </div>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Justificarea alegerii modalității de satisfacere a necesității</label>
                <textarea v-model="formData.justificationChoice" class="form-textarea" rows="4" :readonly="isReadonly"></textarea>
              </div>
            </div>
          </div>

          <!-- ══ SECȚIUNEA 5 — Valoarea estimată ══ -->
          <div class="section-card section-collapsible" id="section-5"
            :class="{ 'section-card--invalid': valideSections[5] === false }">
            <div class="section-header section-header--clickable" @click="toggleSection('S5')">
              <span class="section-valide-icon">{{ getSectionIcon(5) }}</span>
              <h3 class="section-title">Valoarea estimată a {{ achizitionCategory[1] || 'itemilor' }}</h3>
              <span class="section-chevron">{{ openSections.S5 ? '▲' : '▼' }}</span>
            </div>
            <div v-show="openSections.S5" class="section-body">
              <!-- Tabel valori unitare per produs -->
              <p class="field-note">
                Valorile sunt preluate automat din propunerile de nevoi incluse în referat.
                Valoarea totală estimată: <strong>{{ formatPrice(reference.sumnr) }} LEI</strong>
              </p>
              <div class="form-group">
                <label class="form-label">Documentele suport pentru stabilirea valorii estimate</label>
                <textarea v-model="formData.docSoportDesc" class="form-textarea" rows="3" :readonly="isReadonly"></textarea>
              </div>
            </div>
          </div>

          <!-- ══ SECȚIUNEA 6 — Calendarul achizițiilor ══ -->
          <div class="section-card section-collapsible" id="section-6"
            :class="{ 'section-card--invalid': valideSections[6] === false }">
            <div class="section-header section-header--clickable" @click="toggleSection('S6')">
              <span class="section-valide-icon">{{ getSectionIcon(6) }}</span>
              <h3 class="section-title">Calendarul achizițiilor</h3>
              <span class="section-chevron">{{ openSections.S6 ? '▲' : '▼' }}</span>
            </div>
            <div v-show="openSections.S6" class="section-body">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Semnarea contractului <span class="required">*</span></label>
                  <input type="date" v-model="formData.calendar.signContract" class="form-input" :readonly="isReadonly"
                    :min="calendarMinDate" :max="calendarMaxDate" />
                </div>
                <div class="form-group" v-if="showSignFirstContract">
                  <label class="form-label">Semnarea primului contract subsecvent</label>
                  <input type="date" v-model="formData.calendar.signFirstContract" class="form-input" :readonly="isReadonly" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Finalizarea implementării contractului <span class="required">*</span></label>
                  <input type="date" v-model="formData.calendar.finishContract" class="form-input" :readonly="isReadonly" />
                </div>
                <div class="form-group">
                  <label class="form-label">Realizarea evaluării obligațiilor contractuale <span class="required">*</span></label>
                  <input type="date" v-model="formData.calendar.fulfillmentOfObligations" class="form-input" :readonly="isReadonly" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Realizarea evaluării finale <span class="required">*</span></label>
                <input type="date" v-model="formData.calendar.release" class="form-input" :readonly="isReadonly" />
              </div>
            </div>
          </div>

          <!-- ══ SECȚIUNEA — Perspectiva financiară ══ -->
          <div class="section-card section-collapsible" id="section-perspectives">
            <div class="section-header section-header--clickable" @click="toggleSection('SP')">
              <h3 class="section-title">Perspectiva financiară</h3>
              <span class="section-chevron">{{ openSections.SP ? '▲' : '▼' }}</span>
            </div>
            <div v-show="openSections.SP" class="section-body">
              <div class="form-group">
                <label class="form-label">Fondurile alocate pentru satisfacerea necesității</label>
                <input type="text" v-model="formData.fonduri" class="form-input" :readonly="isReadonly" />
              </div>
              <div class="form-group">
                <label class="form-label">Sursa de finanțare</label>
                <!-- TODO: dropdown din FINANCING.get -->
                <input type="text" v-model="formData.sursaDeFinantare" class="form-input" :readonly="isReadonly" />
              </div>
              <div class="form-group">
                <label class="form-label">Perspectiva pe termen lung</label>
                <textarea v-model="formData.longPerspective" class="form-textarea" rows="3" :readonly="isReadonly"></textarea>
              </div>
            </div>
          </div>

          <!-- ══ SECȚIUNEA — Factori cheie ══ -->
          <div class="section-card section-collapsible" id="section-factors"
            v-if="formData.activeSections.S12">
            <div class="section-header section-header--clickable" @click="toggleSection('SF')">
              <h3 class="section-title">Factori cheie pentru succesul procesului</h3>
              <span class="section-chevron">{{ openSections.SF ? '▲' : '▼' }}</span>
            </div>
            <div v-show="openSections.SF" class="section-body">
              <div class="form-group">
                <label class="form-label">Factori cheie</label>
                <textarea v-model="formData.factorsSub1" class="form-textarea" rows="3" :readonly="isReadonly"></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Modalitate de măsurare</label>
                <textarea v-model="formData.factorsSub2" class="form-textarea" rows="3" :readonly="isReadonly"></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Indicator de performanță</label>
                <textarea v-model="formData.factorsSub3" class="form-textarea" rows="3" :readonly="isReadonly"></textarea>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  REFERENCE_ONCE,
  REFERENCE_MODIFY,
  REFERENCE_CHANGE_STATUS,
  REFERENCE_SAVE_PDF,
  REFERENCE_REQUEST_COMPLETE_CENTRALIZATION,
  REFERENCE_COMPLETE_CENTRALIZATION,
  ANNUAL_INSTITUTION_OBJECTIVES,
  BUGETARE,
} from '@/api.js'
import PermisionsMixin from '@/mixins/referencesPermMixin.js'

const STATUS_ICONS = {
  draft:                { icon: 'far fa-clock',          css: 'color:#f2da07;font-size:1.1rem;', tooltip: 'Draft' },
  signature_waiting:    { icon: 'fas fa-clock',          css: 'color:#f2da07;font-size:1.1rem;', tooltip: 'Așteptare semnare' },
  in_progress_signature:{ icon: 'fas fa-pen-nib',        css: 'color:#F2994A;font-size:1.1rem;', tooltip: 'În curs de aprobare' },
  rejected:             { icon: 'fas fa-times-circle',   css: 'color:#ec4a4a;font-size:1.1rem;', tooltip: 'Respins' },
  approved:             { icon: 'fas fa-clipboard-check',css: 'color:#569a36;font-size:1.1rem;', tooltip: 'Aprobat' },
  completion:           { icon: 'fas fa-pencil',         css: 'color:#F2994A;font-size:1.1rem;', tooltip: 'Trimis spre completare' },
  completed:            { icon: 'fas fa-pencil',         css: 'color:#569a36;font-size:1.1rem;', tooltip: 'Completat' },
  cancelled:            { icon: 'fas fa-ban',            css: 'color:#aaa;font-size:1.1rem;',    tooltip: 'Anulat' }
}

const STATUS_LABELS = {
  draft: 'Draft',
  signature_waiting: 'Așteptare semnare',
  in_progress_signature: 'În curs de aprobare',
  rejected: 'Respins',
  approved: 'Aprobat',
  completion: 'Trimis spre completare',
  completed: 'Completat',
  cancelled: 'Anulat'
}

export default {
  name: 'ReferateDetail',
  mixins: [PermisionsMixin],

  data() {
    return {
      reference: {},
      loading: false,
      saving: false,
      generatingPdf: false,
      viewFinally: false,
      statusLabels: STATUS_LABELS,
      formData: {
        fundamentNeed: '',
        identifiedNeed: '',
        longPerspective: '',
        justificationChoice: '',
        achizitionDestination: [],
        achizitionType: [],
        obiectiveleProiectului: '',
        obiectiveleDinStrategia: '',
        beneficiiDupaSatisfacerea: '',
        docSoportDesc: '',
        fonduri: '',
        sursaDeFinantare: '',
        factorsSub1: '',
        factorsSub2: '',
        factorsSub3: '',
        calendar: {
          signContract: null,
          signFirstContract: null,
          finishContract: null,
          fulfillmentOfObligations: null,
          release: null,
        },
        activeSections: { S8: false, S10: false, S11: false, S12: false },
        modalitateDeCentralizareType: null,
        modalitateDeCentralizare: null,
        budgetClassificationFunctional: '',
        budgetClassificationEconomic: '',
      },
      valideSections: {},
      openSections: { S2: true, S3: true, S4: true, S5: true, S6: true, SP: false, SF: false },
      activeSectionId: null,
      centralizareTypes: [],
      centralizareOptions: [],
      cpvCodes: [],
      productsTableData: [],
    }
  },

  computed: {
    navigation() {
      return this.$route?.path?.split('/')[1] || 'planificare'
    },

    referenceId() {
      return +this.$route?.params?.id
    },

    userRole() {
      return this.$store?.getters?.userRole?.role || ''
    },

    userRoleId() {
      return this.$store?.getters?.userRole?.id || null
    },

    // Proprietarul referatului — cel care l-a creat
    isOwner() {
      return this.reference.createdByUserRole === this.userRoleId
    },

    isReadonly() {
      // Readonly dacă: nu e owner, sau status nu permite editare
      if (!this.isOwner) return true
      const editableStatuses = ['draft', 'rejected', 'completion', 'completed']
      return !editableStatuses.includes(this.reference.needReferateStatus)
    },

    isFinished() {
      return ['approved', 'rejected', 'cancelled'].includes(this.reference.needReferateStatus)
    },

    statusIcon() {
      return STATUS_ICONS[this.reference.needReferateStatus] || STATUS_ICONS.draft
    },

    achizitionCategory() {
      const map = { 1: ['Produse','produselor','produs'], 2: ['Servicii','serviciilor','serviciu'], 3: ['Lucrări','lucrărilor','lucrare'] }
      const cpvType = this.reference?.need?.product?.cpvCategory?.cpvType
      return map[cpvType] || ['Itemi', 'itemilor', 'item']
    },

    // Secțiunea 13 — vizibilă dacă: există date salvate SAU ești supervizor_achizitii
    // Supervizorul o vede și o poate edita indiferent de status (până la signature_waiting)
    showSection13() {
      if (this.formData.modalitateDeCentralizare) return true
      if (this.userRole === 'supervizor_achizitii') return true
      return false
    },

    // Secțiunea 14 — vizibilă dacă: există date salvate SAU ești responsabil_buget
    // Responsabilul o vede și o poate edita indiferent de status (până la signature_waiting)
    showSection14() {
      if (this.formData.budgetClassificationFunctional) return true
      if (this.userRole === 'responsabil_buget') return true
      return false
    },

    canSetModalitateDeCentralizare() {
      // Supervizorul poate modifica secțiunea 13 oricând (indiferent de status)
      // atâta timp cât e în rolul corect și instituția corespunde
      // ȘI cpvType == 1 (Produse) — pentru Servicii/Lucrări tipul este forțat Cod CPV
      const userRole = this.$store?.getters?.userRole
      return userRole?.institutionId == this.reference.institution?.id
        && this.userRole === 'supervizor_achizitii'
        && this.cpvType == 1
    },

    canSetBudgetClassification() {
      // Responsabilul de buget poate modifica secțiunea 14 oricând
      // atâta timp cât e în rolul corect și instituția corespunde
      const userRole = this.$store?.getters?.userRole
      return userRole?.institutionId == this.reference.institution?.id
        && this.userRole === 'responsabil_buget'
    },

    // Ambii supervizor_achizitii și responsabil_buget au PERMISIONS.complete
    // Pot salva secțiunile lor oricând, chiar și după 'completed'
    // Referatul devine cu adevărat blocat abia după ce autorul apasă Înainte → signature_waiting
    canSaveCompletion() {
      return this.PERMISIONS.complete === true &&
        ['completion','completed','draft','rejected'].includes(this.reference.needReferateStatus) &&
        (this.canSetModalitateDeCentralizare || this.canSetBudgetClassification)
    },

    // "Trimite spre completare" — disponibil pentru owner înainte de pasul 2
    canSendToComplete() {
      return this.isOwner &&
        !['completion', 'approved', 'cancelled', 'in_progress_signature', 'signature_waiting'].includes(this.reference.needReferateStatus)
    },

    sendToCompleteTooltip() {
      return this.reference.needReferateStatus === 'completion'
        ? 'Referatul a fost deja trimis spre completare'
        : 'Supervizorul de achiziție va stabili modalitate de centralizare și Responsabilul de buget va stabili clasificația bugetară.'
    },

    // Calendar — data minimă
    calendarMinDate() {
      const year = this.reference.nryear || new Date().getFullYear()
      return `${year}-01-01`
    },

    calendarMaxDate() {
      const year = this.reference.nryear || new Date().getFullYear()
      return `${year}-12-31`
    },

    // Tipul contractului Acord-Cadru → afișează câmp semnare prim contract
    showSignFirstContract() {
      return this.formData.achizitionType?.includes('three')
    },

    // cpvType din nevoia dominantă — 1=Produse, 2=Servicii, 3=Lucrări
    cpvType() {
      return this.reference?.need?.dominantNeed?.product?.cpvCategory?.cpvType
        || this.reference?.need?.product?.cpvCategory?.cpvType
        || 0
    },

    visibleSections() {
      return [
        { id: 'section-info', shortName: 'Informații referat', valide: null },
        { id: 'section-0',  shortName: `Descrierea ${this.achizitionCategory[1] || 'itemilor'}`, valide: this.valideSections[0] },
        { id: 'section-1',  shortName: 'Obiectul referatului', valide: this.valideSections[1] },
        { id: 'section-2',  shortName: 'Contribuția la obiective', valide: this.valideSections[2] },
        { id: 'section-3',  shortName: 'Fundamentarea necesității', valide: this.valideSections[3] },
        { id: 'section-4',  shortName: 'Nevoia în legislație', valide: this.valideSections[4] },
        { id: 'section-5',  shortName: 'Valoarea estimată', valide: this.valideSections[5] },
        { id: 'section-6',  shortName: 'Calendarul achizițiilor', valide: this.valideSections[6] },
        { id: 'section-perspectives', shortName: 'Perspectiva financiară', valide: null },
        ...(this.showSection13 ? [{ id: 'section-13', shortName: 'Centralizare PAAP', valide: this.valideSections[13] }] : []),
        ...(this.showSection14 ? [{ id: 'section-14', shortName: 'Clasificație bugetară', valide: this.valideSections[14] }] : []),
      ]
    }
  },

  methods: {
    // ── Load ──────────────────────────────────────────────────────
    async loadReference() {
      this.loading = true
      try {
        const res = await REFERENCE_ONCE(this.referenceId)
        const data = await res.json()
        if (data?.data?.result) {
          this.reference = data.data.result
          this.populateForm(data.data.result)
          this.initCentralizareTypes()
        }
      } catch(e) { console.error(e) }
      this.loading = false
    },

    // Populează formData din datele referatului
    populateForm(ref) {
      const d = ref.data || ref
      this.formData.fundamentNeed = d.fundamentareaNecesitatii || ''
      this.formData.identifiedNeed = d.necesitateaIdentificata || ''
      this.formData.longPerspective = d.s11PerspectivaPeTermenLung || ''
      this.formData.justificationChoice = d.justificareaAlegeriiModalitatiiDeSatisfacere || ''
      this.formData.obiectiveleProiectului = d.obiectiveleProiectului?.[0] || ''
      this.formData.obiectiveleDinStrategia = d.obiectiveleDinStrategia?.[0] || ''
      this.formData.beneficiiDupaSatisfacerea = d.beneficiiDupaSatisfacerea?.[0] || ''
      this.formData.modalitateDeCentralizare = d.modalitateDeCentralizare || null
      this.formData.modalitateDeCentralizareType = d.modalitateDeCentralizareType || null
      if (d.calendar) Object.assign(this.formData.calendar, d.calendar)
      if (d.activeSections) Object.assign(this.formData.activeSections, d.activeSections)

      // CPV codes pentru legislație
      this.cpvCodes = [ref.need?.product?.cpvCategory].filter(Boolean).map(c => ({
        ...c,
        _label: { 1:'Produse', 2:'Servicii', 3:'Lucrări' }[c.cpvType] || '-',
        qty: ref.need?.qty || '-',
        mu: ref.need?.product?.measurementUnit?.shortName || '-'
      }))

      // Tabel produse
      this.buildProductsTable(ref)
    },

    buildProductsTable(ref) {
      const needs = ref.complexIncludedNeeds ? [...ref.complexIncludedNeeds] : (ref.need ? [ref.need] : [])
      this.productsTableData = needs.map(n => ({
        id: n.id,
        name: n.product?.name || '-',
        requestor: `${n.createdByUser?.last_name || ''} ${n.createdByUser?.first_name || ''} / ${n.createdByUser?.id || '-'}`,
        date: this.formatDateTime(n.createdAt),
        cpv: n.product?.cpvCategory?.cpvCode || '-',
        mu: n.product?.measurementUnit?.shortName || '-',
        qty: n.qty || '-',
        priceUnit: this.formatPrice(n.priceUnit),
        priceUnitTva: this.formatPrice(n.priceUnitWithTva),
        priceTotal: this.formatPrice(n.priceTotal),
        priceTotalTva: this.formatPrice(n.priceTotalWithTva),
        technicalDescription: n.technicalDescription || '',
      }))
    },

    // ── Centralizare types ────────────────────────────────────────
    // cpvType == 1 (Produse) → Grup, Clasă, Categorie
    // cpvType == 2 sau 3 (Servicii/Lucrări) → Cod CPV (forțat, fără alegere)
    initCentralizareTypes() {
      const cpvType = this.reference?.need?.dominantNeed?.product?.cpvCategory?.cpvType
        || this.reference?.need?.product?.cpvCategory?.cpvType

      if (cpvType === 1) {
        this.centralizareTypes = [
          { label: 'Grup',      key: 'group' },
          { label: 'Clasă',     key: 'class' },
          { label: 'Categorie', key: 'category' },
        ]
      } else {
        // Servicii sau Lucrări — forțat la Cod CPV, fără selecție de tip
        this.centralizareTypes = [{ label: 'Cod CPV', key: 'cpvCode' }]
        // Auto-selectăm dacă e singurul tip
        if (!this.formData.modalitateDeCentralizareType) {
          this.formData.modalitateDeCentralizareType = this.centralizareTypes[0]
          this.onCentralizareTypeChange()
        }
      }
    },

    // La schimbarea tipului de centralizare — generează opțiunile
    onCentralizareTypeChange() {
      this.centralizareOptions = []
      this.formData.modalitateDeCentralizare = null
      const x = this.formData.modalitateDeCentralizareType
      if (!x) return

      const needs = this.reference.complexIncludedNeeds
        ? [...this.reference.complexIncludedNeeds]
        : (this.reference.need ? [this.reference.need] : [])

      const uniqueKeys = new Set()

      for (const need of needs) {
        const cpvCat = need.product?.cpvCategory
        if (!cpvCat) continue
        let keyVal, label

        if (x.key === 'cpvCode') {
          keyVal = cpvCat.cpvCode
          label = cpvCat.name
        } else {
          keyVal = cpvCat[x.key + 'Code']
          label = cpvCat[x.key]
        }

        if (!keyVal || uniqueKeys.has(keyVal)) continue
        uniqueKeys.add(keyVal)
        this.centralizareOptions.push({ key: keyVal, label })
      }

      // Auto-select dacă există exact o opțiune
      if (this.centralizareOptions.length === 1) {
        this.formData.modalitateDeCentralizare = this.centralizareOptions[0]
      }
    },

    // ── Pasul 1 → Pasul 2 (Înainte) ──────────────────────────────
    async nextStep() {
      if (this.viewFinally) {
        // Pasul 2 → Finalizează / Salvează și Trimite
        await this.finalizeReference()
      } else {
        // Pasul 1 → validare + generare PDF + trece la pasul 2
        if (!this.validateStep1()) return
        this.saving = true
        try {
          await this.syncUpdates()
          this.viewFinally = true
          await this.generatePdf()
        } catch(e) { console.error(e) }
        this.saving = false
      }
    },

    previousStep() {
      this.viewFinally = false
    },

    validateStep1() {
      // Verifică câmpurile obligatorii (toate secțiunile exceptând 13 și 14)
      if (!this.formData.achizitionDestination?.length) {
        alert('Completați destinația achiziției.')
        return false
      }
      if (!this.formData.achizitionType?.length) {
        alert('Completați tipul contractului.')
        return false
      }
      return true
    },

    async generatePdf() {
      this.generatingPdf = true
      try {
        const res = await REFERENCE_SAVE_PDF(this.referenceId)
        const data = await res.json()
        if (!data?.meta?.HttpStatusCode || String(data.meta.HttpStatusCode)[0] !== '2') {
          console.error('Generarea PDF a eșuat')
        }
      } catch(e) { console.error(e) }
      this.generatingPdf = false
    },

    async finalizeReference() {
      this.saving = true
      try {
        if (this.isFinished) {
          // Referat deja finalizat (approved/rejected/cancelled) → salvează modificările + trimite spre semnare
          await REFERENCE_CHANGE_STATUS(this.referenceId, { status: 'signature_waiting' })
          await REFERENCE_SAVE_PDF(this.referenceId)
          this.$router.push(`/${this.navigation}/referate`)
        } else {
          // Referat nou → schimbă statusul la signature_waiting
          const res = await REFERENCE_CHANGE_STATUS(this.referenceId, { status: 'signature_waiting' })
          const data = await res.json()
          if (data?.meta?.HttpStatusCode && String(data.meta.HttpStatusCode)[0] === '2') {
            this.$router.push(`/${this.navigation}/referate`)
          } else {
            console.error(data?.response || 'Finalizarea a eșuat')
          }
        }
      } catch(e) { console.error(e) }
      this.saving = false
    },

    // ── Trimite spre completare ───────────────────────────────────
    async sendToComplete() {
      if (this.reference.needReferateStatus === 'completion') return
      if (!this.validateStep1()) return

      this.saving = true
      try {
        const sendData = this.getChangedData()
        const res = await REFERENCE_REQUEST_COMPLETE_CENTRALIZATION(this.referenceId, sendData)
        const data = await res.json()
        if (data?.meta?.HttpStatusCode && String(data.meta.HttpStatusCode)[0] === '2') {
          this.$router.push(`/${this.navigation}/referate`)
        } else {
          console.error(data?.response || 'Salvarea a eșuat')
        }
      } catch(e) { console.error(e) }
      this.saving = false
    },

    // ── Salvare completare (supervizor_achizitii / responsabil_buget) ─
    async saveCompletion() {
      if (this.canSetModalitateDeCentralizare) {
        if (!this.formData.modalitateDeCentralizare || !this.formData.modalitateDeCentralizareType) {
          alert('Completați modalitatea de centralizare în PAAP.')
          return
        }
      }
      if (this.canSetBudgetClassification) {
        if (!this.formData.budgetClassificationFunctional || !this.formData.budgetClassificationEconomic) {
          alert('Completați ambele clasificații bugetare.')
          return
        }
      }
      this.saving = true
      try {
        const sendData = {}
        if (this.canSetModalitateDeCentralizare) {
          sendData.modalitateDeCentralizare = this.formData.modalitateDeCentralizare
          sendData.modalitateDeCentralizareType = this.formData.modalitateDeCentralizareType
        }
        if (this.canSetBudgetClassification) {
          sendData.budgetClassification = [
            this.formData.budgetClassificationFunctional,
            this.formData.budgetClassificationEconomic
          ]
        }
        const res = await REFERENCE_COMPLETE_CENTRALIZATION(this.referenceId, sendData)
        const data = await res.json()
        if (data?.meta?.HttpStatusCode && String(data.meta.HttpStatusCode)[0] === '2') {
          this.$router.push(`/${this.navigation}/referate`)
        } else {
          console.error(data?.response || 'Salvarea a eșuat')
        }
      } catch(e) { console.error(e) }
      this.saving = false
    },

    // ── Sync / save updates ───────────────────────────────────────
    async syncUpdates() {
      const sendData = this.getChangedData()
      if (!Object.keys(sendData).length) return
      const res = await REFERENCE_MODIFY(this.referenceId, sendData)
      const data = await res.json()
      if (!data?.meta?.HttpStatusCode || String(data.meta.HttpStatusCode)[0] !== '2') {
        throw new Error(data?.response || 'Salvarea a eșuat')
      }
    },

    getChangedData() {
      const fd = this.formData
      return {
        fundamentareaNecesitatii: fd.fundamentNeed,
        necesitateaIdentificata: fd.identifiedNeed,
        s11PerspectivaPeTermenLung: fd.longPerspective,
        justificareaAlegeriiModalitatiiDeSatisfacere: fd.justificationChoice,
        obiectiveleProiectului: fd.obiectiveleProiectului ? [fd.obiectiveleProiectului] : ['Nu este cazul'],
        obiectiveleDinStrategia: fd.obiectiveleDinStrategia ? [fd.obiectiveleDinStrategia] : ['Nu este cazul'],
        beneficiiDupaSatisfacerea: fd.beneficiiDupaSatisfacerea ? [fd.beneficiiDupaSatisfacerea] : ['Nu este cazul'],
        needReferateAchizitionDestination: fd.achizitionDestination?.[0] || '',
        needReferateAchizitionType: fd.achizitionType?.[0] || '',
        'calendar:signContract': fd.calendar.signContract,
        'calendar:finishContract': fd.calendar.finishContract,
        'calendar:fulfillmentOfObligations': fd.calendar.fulfillmentOfObligations,
        'calendar:release': fd.calendar.release,
        ...(fd.calendar.signFirstContract ? { 'calendar:signFirstContract': fd.calendar.signFirstContract } : {}),
      }
    },

    // ── UI Helpers ────────────────────────────────────────────────
    toggleSection(key) {
      this.openSections[key] = !this.openSections[key]
    },

    scrollToSection(id) {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      this.activeSectionId = id
    },

    getSectionIcon(sectionId) {
      const v = this.valideSections[sectionId]
      return v === false ? '✕' : v === true ? '✓' : '○'
    },

    formatName(user) {
      if (!user) return '-'
      return `${user.last_name || ''} ${user.first_name || ''}`.trim() || '-'
    },

    formatDate(d) {
      if (!d) return '-'
      const dt = new Date(d)
      return `${String(dt.getDate()).padStart(2,'0')}.${String(dt.getMonth()+1).padStart(2,'0')}.${dt.getFullYear()}`
    },

    formatDateTime(d) {
      if (!d) return '-'
      const dt = new Date(d)
      return `${String(dt.getDate()).padStart(2,'0')}.${String(dt.getMonth()+1).padStart(2,'0')}.${dt.getFullYear()} ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`
    },

    formatPrice(val) {
      if (val === undefined || val === null || val === '') return '-'
      return Number(val).toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }
  },

  created() {
    if (this.referenceId) this.loadReference()
  }
}
</script>

<style scoped>
.page-container { display: flex; flex-direction: column; min-height: 100%; font-family: 'Roboto', sans-serif; }
.page-banner { background: #1565C0; color: white; padding: 0.6rem 1.5rem; flex-shrink: 0; }
.breadcrumb { font-size: 0.85rem; }
.breadcrumb-link { cursor: pointer; opacity: 0.85; }
.breadcrumb-link:hover { opacity: 1; text-decoration: underline; }
.breadcrumb-sep { margin: 0 0.4rem; opacity: 0.6; }

.loading-state { display: flex; flex-direction: column; align-items: center; padding: 4rem; color: #888; gap: 1rem; }
.spinner-lg { width: 36px; height: 36px; border: 3px solid #e0e8f8; border-top-color: #1565C0; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; }
.access-denied { display: flex; flex-direction: column; align-items: center; padding: 4rem; color: #aaa; }
.access-icon { font-size: 4rem; margin-bottom: 1rem; }

/* Layout 2 coloane */
.detail-layout { display: flex; flex: 1; overflow: hidden; }

/* Sidebar stânga */
.detail-sidebar {
  width: 260px; min-width: 260px; background: white; border-right: 1px solid #e8eaf0;
  display: flex; flex-direction: column; overflow-y: auto; padding: 1rem;
  gap: 1rem;
}

.sidebar-info { background: #f8f9fc; border-radius: 8px; padding: 0.85rem; }
.sidebar-status { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
.sidebar-status-label { font-size: 0.82rem; font-weight: 500; color: #555; }
.sidebar-name { font-size: 0.875rem; font-weight: 600; color: #1a2f4e; margin-bottom: 4px; word-break: break-word; }
.sidebar-meta { font-size: 0.78rem; color: #888; }

.step-indicator { display: flex; align-items: center; gap: 6px; padding: 0.5rem 0; }
.step-dot { width: 22px; height: 22px; border-radius: 50%; background: #e0e0e0; color: #999; font-size: 0.72rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.step-dot--active { background: #1565C0; color: white; }
.step-dot--done { background: #43a047; color: white; }
.step-line { flex: 1; height: 2px; background: #e0e0e0; }
.step-label { font-size: 0.72rem; color: #666; white-space: nowrap; }

.sections-nav { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.section-nav-item { display: flex; align-items: center; gap: 6px; padding: 5px 8px; border-radius: 4px; cursor: pointer; font-size: 0.78rem; color: #555; transition: background 0.12s; }
.section-nav-item:hover { background: #f0f4ff; color: #1565C0; }
.section-nav-item--active { background: #e3f2fd; color: #1565C0; }
.section-nav-item--invalid { color: #e53935; }
.section-nav-item--valid { color: #2e7d32; }
.section-nav-icon { width: 14px; text-align: center; font-size: 0.72rem; flex-shrink: 0; }
.icon-invalid { color: #e53935; }
.icon-valid { color: #43a047; }

.sidebar-actions { display: flex; flex-direction: column; gap: 8px; }
.btn-block { width: 100%; justify-content: center; }

/* Conținut principal */
.detail-main { flex: 1; overflow-y: auto; padding: 1.25rem 1.5rem; background: #f5f7fa; display: flex; flex-direction: column; gap: 1rem; }

/* Carduri secțiuni */
.section-card { background: white; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); overflow: hidden; border-left: 4px solid #e0e0e0; }
.section-card--invalid { border-left-color: #e53935; }
.section-card--valid   { border-left-color: #43a047; }
.section-info { border-left-color: #1565C0; }

.section-header { display: flex; align-items: center; gap: 8px; padding: 0.85rem 1.1rem; background: #fafbfc; border-bottom: 1px solid #f0f0f0; }
.section-header--clickable { cursor: pointer; user-select: none; }
.section-header--clickable:hover { background: #f0f4ff; }
.section-title { margin: 0; font-size: 0.9rem; font-weight: 600; color: #1a2f4e; flex: 1; }
.section-valide-icon { font-size: 0.85rem; width: 16px; text-align: center; flex-shrink: 0; }
.section-chevron { font-size: 0.7rem; color: #aaa; }
.section-badge { font-size: 0.68rem; font-weight: 700; padding: 2px 7px; border-radius: 10px; }
.section-badge--paap { background: #e3f2fd; color: #1565C0; }
.section-badge--budget { background: #e8f5e9; color: #2e7d32; }

.section-body { padding: 1rem 1.1rem; }
.section-note { font-size: 0.8rem; color: #888; font-style: italic; margin: 0; }

/* Info grid */
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem 1rem; }
.info-item { display: flex; gap: 6px; font-size: 0.875rem; }
.info-label { font-weight: 500; color: #555; white-space: nowrap; }

/* Form elements */
.form-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 1rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-label { font-size: 0.82rem; font-weight: 500; color: #444; }
.required { color: #e53935; margin-left: 2px; }
.form-input, .form-select, .form-textarea {
  border: 1.5px solid #ddd; border-radius: 6px; padding: 0.5rem 0.75rem;
  font-size: 0.875rem; font-family: 'Roboto', sans-serif; color: #333; background: white;
}
.form-input:focus, .form-select:focus, .form-textarea:focus { outline: none; border-color: #1565C0; box-shadow: 0 0 0 3px rgba(21,101,192,0.08); }
.form-input[readonly], .form-textarea[readonly] { background: #f8f9fc; color: #555; }
.form-textarea { resize: vertical; }
.form-select:disabled { background: #f8f9fc; color: #aaa; }
.field-note { font-size: 0.8rem; color: #888; font-style: italic; margin: 0 0 0.5rem; }

/* Checkboxes */
.checkbox-group { display: flex; flex-direction: column; gap: 6px; }
.checkbox-item { display: flex; align-items: center; gap: 8px; font-size: 0.875rem; color: #333; cursor: pointer; }

/* CPV list */
.cpv-list { display: flex; flex-direction: column; gap: 6px; }
.cpv-item { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; padding: 6px 10px; background: #f8f9fc; border-radius: 6px; }
.cpv-badge { background: #E3F2FD; color: #1565C0; padding: 2px 7px; border-radius: 10px; font-size: 0.72rem; font-weight: 600; }
.cpv-code-val { font-family: monospace; font-weight: 600; color: #1565C0; }
.cpv-name { flex: 1; color: #555; }
.cpv-qty { color: #888; font-size: 0.78rem; }

/* Products table */
.products-table-wrap { overflow-x: auto; }
.products-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; min-width: 800px; }
.products-table th { background: #1565C0; color: white; padding: 0.5rem 0.6rem; text-align: left; font-size: 0.72rem; font-weight: 600; white-space: nowrap; }
.products-table td { padding: 0.45rem 0.6rem; border-bottom: 1px solid #f0f0f0; }
.products-table tr:nth-child(even) { background: #fafbfd; }
.num-cell { text-align: right; font-variant-numeric: tabular-nums; }
.cpv-cell { font-family: monospace; color: #1565C0; }
.desc-cell { max-width: 280px; font-size: 0.78rem; color: #424242; line-height: 1.5; }

/* Finally view */
.finally-view { background: white; border-radius: 8px; padding: 2rem; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.finally-header h2 { font-size: 1.1rem; color: #1a2f4e; margin: 0 0 0.5rem; }
.finally-header p { font-size: 0.875rem; color: #666; margin: 0 0 1.5rem; }
.pdf-preview-placeholder { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 3rem; background: #fafbfc; border-radius: 8px; border: 2px dashed #e0e0e0; }
.pdf-preview-placeholder p { margin: 0; font-size: 0.875rem; color: #555; }
.pdf-generating { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: #888; }

/* Buttons */
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 0.5rem 1rem; border-radius: 6px; border: none; cursor: pointer; font-size: 0.875rem; font-weight: 500; font-family: 'Roboto', sans-serif; transition: background 0.15s; }
.btn-primary { background: #1565C0; color: white; }
.btn-primary:hover:not(:disabled) { background: #1251a3; }
.btn-primary:disabled { opacity: 0.5; cursor: default; }
.btn-secondary { background: #f5f5f5; color: #333; border: 1px solid #ddd; }
.btn-secondary:hover { background: #e8e8e8; }
.btn-warning { background: #fb8c00; color: white; }
.btn-warning:hover:not(:disabled) { background: #e65100; }
.btn-warning:disabled { opacity: 0.5; cursor: default; }

.spinner { width: 14px; height: 14px; border: 2px solid rgba(0,0,0,0.15); border-top-color: #333; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; }
.spinner-white { border-color: rgba(255,255,255,0.3); border-top-color: white; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
