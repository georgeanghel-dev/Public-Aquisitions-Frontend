<template>
  <div class="page">
    <div class="page-header">
      <div class="breadcrumb">
        <span class="breadcrumb-link" @click="$router.push('/')">Acasă</span>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-link" @click="$router.push(`/atribuire/procedura/${procedureType}`)">Atribuire referate</span>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">{{ centralization ? `${centralization.identifier} — ${centralization.name}` : '' }}</span>
      </div>
      <div class="page-title-row">
        <h1 class="page__title">
          {{ procedureName }} / {{ centralization ? `${centralization.identifier} — ${centralization.name}` : '' }}
        </h1>
        <div class="titlebar-actions">
          <button v-if="procedureType !== 'achizitie_directa'" class="btn btn-secondary btn-sm" @click="openProcedureDocumentModal">
            <i class="fas fa-plus-circle"></i> Atribuirea prin procedură
          </button>
          <button class="btn btn-primary btn-sm" @click="openActionsModal" :disabled="!checkedIds.length && !allSelected">
            <i class="fas fa-plus-circle"></i> Acțiuni achiziții
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-state"><span class="spinner-lg"></span><p>Se încarcă...</p></div>

    <div v-else class="table-container">
      <div class="filters-row">
        <input v-model="filters.name" class="filter-input" placeholder="Caută denumire..." />
        <input v-model="filters.dept" class="filter-input" placeholder="Departament..." />
        <button class="btn btn-ghost btn-sm" @click="clearFilters"><i class="fas fa-times"></i></button>
      </div>

      <div class="table-wrap">
        <div class="data-table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th class="chk-col">
                <input type="checkbox" :checked="allSelected" @change="toggleSelectAll" />
              </th>
              <th>Nr.</th>
              <th>Denumire</th>
              <th>Anul de încadrare</th>
              <th>Structură organizatorică</th>
              <th>Inițiator</th>
              <th>Cod CPV (dominant)</th>
              <th class="num-cell">Val. estimată (fără TVA)</th>
              <th class="num-cell">Val. totală estimată</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!filteredRows.length">
              <td colspan="11" class="empty-cell">Nu există referate asociate.</td>
            </tr>
            <tr v-for="(row, i) in paginatedRows" :key="row.id" class="tr-data">
              <td class="chk-col">
                <input
                  type="checkbox"
                  :checked="checkedIds.includes(row.id)"
                  :disabled="row.nryear < currentYear || isReferenceFinished(row)"
                  :title="row.nryear < currentYear ? 'Referatul nu se mai încadrează în anul curent.' : ''"
                  @change="toggleCheck(row)"
                />
              </td>
              <td>{{ pageFrom + i + 1 }}</td>
              <td>{{ row.name || '-' }}</td>
              <td>{{ row.nryear || '-' }}</td>
              <td>{{ row.department?.name || '-' }}</td>
              <td>{{ formatUser(row.createdByUser) }}</td>
              <td class="cpv-cell">{{ row.need?.product?.cpvCategory?.cpvCode || '-' }}</td>
              <td class="num-cell">{{ formatPrice(row.totalValueWithoutTva) }}</td>
              <td class="num-cell">{{ formatPrice(row.sumnr) }}</td>
              <td>
                <span :class="['status-icon', `status-${getReferenceStatus(row)}`]" :title="statusTooltip[getReferenceStatus(row)]">
                  <i :class="statusIconMap[getReferenceStatus(row)]"></i>
                </span>
              </td>
              <td class="actions-cell">
                <button class="action-btn" title="Previzualizare PDF" @click="viewPdf(row)">
                  <i class="far fa-file-pdf" style="color:#e53935;font-size:1rem;"></i>
                </button>
                <button v-if="row.procedureDocument?.length" class="action-btn" title="Documente procedură" @click="updateProcedureDoc(row)">
                  <i class="fas fa-file-plus" style="color:#337ab7;font-size:1rem;"></i>
                </button>
                <button v-if="row.procedureDocument?.length && row.procedureDocument[0]?.status === 'draft'" class="action-btn" title="Finalizează procedura" @click="closeProcedureDoc(row)">
                  <i class="fas fa-badge-check" style="color:green;font-size:1rem;"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
        </div><!-- /data-table-scroll -->


      <div class="pagination-row">
        <span class="pagination-info">Total: {{ filteredRows.length }}</span>
        <div class="pagination-controls">
          <span class="page-size-label">Rânduri pe pagină: {{ pageSize }}</span>
          <span class="page-range">{{ filteredRows.length ? pageFrom + 1 : 0 }}–{{ Math.min(pageFrom + pageSize, filteredRows.length) }}</span>
          <button class="page-btn" :disabled="pageFrom === 0" @click="prevPage"><i class="fas fa-chevron-left"></i></button>
          <button class="page-btn" :disabled="pageFrom + pageSize >= filteredRows.length" @click="nextPage"><i class="fas fa-chevron-right"></i></button>
        </div>
      </div>
    </div>

    <!-- Modal Acțiuni achiziții -->
    <div v-if="actionsModal.open" class="modal-overlay" @click.self="actionsModal.open = false">
      <div class="modal-box">
        <div class="modal-header">
          <h3 class="modal-title">Acțiuni achiziții</h3>
          <button class="modal-close" @click="actionsModal.open = false">✕</button>
        </div>
        <div class="form-group">
          <label class="form-label">Tipul comenzii</label>
          <select v-model="actionsModal.cmdType" class="form-select">
            <option value="">— Selectează —</option>
            <option value="cmd1">Achiziție din catalogul S.E.A.P</option>
            <option value="cmd2">Achiziție prin invitație de participare</option>
            <option value="cmd3">Achiziție în baza ofertelor</option>
            <option v-if="!centralization?.procedureType?.socialOnly" value="cmd4">Achiziție în baza angajamentului legal</option>
          </select>
        </div>

        <!-- CMD1 — din catalog SEAP -->
        <div v-if="actionsModal.cmdType === 'cmd1'" class="cmd-section">
          <p class="cmd-label">Achiziție din catalogul S.E.A.P</p>
          <div class="cmd-btns">
            <button v-if="!centralization?.procedureType?.socialOnly" class="btn btn-cmd" @click="openAcquisitionForm('cmd1')">CMD1</button>
            <button v-else class="btn btn-cmd" @click="openAcquisitionForm('cmd1_a2')">CMD1_A2</button>
            <button class="btn btn-cmd" @click="openAcquisitionForm('cmd31')">CMD31</button>
          </div>
          <div class="cmd-btns" style="margin-top:8px;">
            <button v-if="!centralization?.procedureType?.socialOnly" class="btn btn-cmd" @click="openAcquisitionForm('crt1')">CTR1</button>
            <button v-else class="btn btn-cmd" @click="openAcquisitionForm('crt1_a2')">CTR1_A2</button>
            <button class="btn btn-cmd" @click="openAcquisitionForm('crt31')">CTR31</button>
          </div>
        </div>

        <!-- CMD2 — prin invitație -->
        <div v-if="actionsModal.cmdType === 'cmd2'" class="cmd-section">
          <div v-if="!centralization?.announcement?.length">
            <button class="btn btn-cmd" @click="openAnnouncementForm">ANUNȚ</button>
          </div>
          <div v-else class="cmd-btns">
            <button v-if="!centralization?.procedureType?.socialOnly" class="btn btn-cmd" @click="openAcquisitionForm('cmd2')">CMD2</button>
            <button v-else class="btn btn-cmd" @click="openAcquisitionForm('cmd2_a2')">CMD2_A2</button>
            <button v-if="!centralization?.procedureType?.socialOnly" class="btn btn-cmd" @click="openAcquisitionForm('crt2')">CRT2</button>
            <button v-else class="btn btn-cmd" @click="openAcquisitionForm('crt2_a2')">CRT2_A2</button>
          </div>
        </div>

        <!-- CMD3 — în baza ofertelor -->
        <div v-if="actionsModal.cmdType === 'cmd3'" class="cmd-section">
          <div v-if="!centralization?.verbalProcess?.length">
            <button class="btn btn-cmd" @click="openVerbalProcessForm">PV</button>
          </div>
          <div v-else class="cmd-btns">
            <button v-if="!centralization?.procedureType?.socialOnly" class="btn btn-cmd" @click="openAcquisitionForm('cmd3')">CMD3</button>
            <button v-else class="btn btn-cmd" @click="openAcquisitionForm('cmd3_a2')">CMD3_A2</button>
            <button v-if="!centralization?.procedureType?.socialOnly" class="btn btn-cmd" @click="openAcquisitionForm('crt3')">CRT3</button>
            <button v-else class="btn btn-cmd" @click="openAcquisitionForm('crt3_a2')">CRT3_A2</button>
          </div>
        </div>

        <!-- CMD4 — angajament legal -->
        <div v-if="actionsModal.cmdType === 'cmd4'" class="cmd-section">
          <button class="btn btn-cmd" @click="openAcquisitionForm('cmd4')">CMD4</button>
        </div>

        <div class="modal-actions">
          <button class="btn btn-secondary" @click="actionsModal.open = false">Anulează</button>
        </div>
      </div>
    </div>

    <!-- Modal Comandă fermă / Contract -->
    <div v-if="acquisitionForm.open" class="modal-overlay" @click.self="acquisitionForm.open = false">
      <div class="modal-box modal-wide">
        <div class="modal-header">
          <h3 class="modal-title">{{ acquisitionTitle[acquisitionForm.type] }}</h3>
          <button class="modal-close" @click="acquisitionForm.open = false">✕</button>
        </div>
        <div class="edit-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">{{ acquisitionNumberTitle[acquisitionForm.type] }} <span class="required">*</span></label>
              <input type="text" v-model="acquisitionForm.data.acqNumber" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">{{ acquisitionDateTitle[acquisitionForm.type] }} <span class="required">*</span></label>
              <input type="date" v-model="acquisitionForm.data.acquisitionDate" class="form-input" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">CUI furnizor <span class="required">*</span></label>
              <input type="text" v-model="acquisitionForm.data.cui" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Nume furnizor <span class="required">*</span></label>
              <input type="text" v-model="acquisitionForm.data.supplierName" class="form-input" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Valoarea totală efectivă, fără TVA <span class="required">*</span></label>
              <input type="number" v-model="acquisitionForm.data.totalValueWithoutTva" class="form-input" min="0" step="0.01" />
            </div>
            <div class="form-group">
              <label class="form-label">Cotă TVA <span class="required">*</span></label>
              <input type="number" v-model="acquisitionForm.data.tvaValue" class="form-input" min="0" step="0.01" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Criteriul de atribuire</label>
              <select v-model="acquisitionForm.data.attributionCriteria" class="form-select">
                <option value="">— Selectează —</option>
                <option>Prețul cel mai scăzut</option>
                <option>Cel mai bun raport calitate-preț</option>
                <option>Cel mai bun raport calitate-cost</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Valoare totală, cu TVA</label>
              <input type="number" v-model="acquisitionForm.data.totalValueWithTva" class="form-input" min="0" step="0.01" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Adresa de livrare</label>
            <textarea v-model="acquisitionForm.data.deliveryAddress" class="modal-textarea" rows="3"></textarea>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="acquisitionForm.open = false">Anulează</button>
          <button class="btn btn-primary" @click="saveAcquisition" :disabled="saving">
            <span v-if="saving" class="spinner spinner-white"></span> Salvează
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Anunț -->
    <div v-if="announcementForm.open" class="modal-overlay" @click.self="announcementForm.open = false">
      <div class="modal-box modal-wide">
        <div class="modal-header">
          <h3 class="modal-title">Anunț</h3>
          <button class="modal-close" @click="announcementForm.open = false">✕</button>
        </div>
        <div class="edit-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Numărul anunțului <span class="required">*</span></label>
              <input type="text" v-model="announcementForm.data.announcementNumber" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Criteriul de atribuire <span class="required">*</span></label>
              <select v-model="announcementForm.data.attributionCriteria" class="form-select">
                <option value="">— Selectează —</option>
                <option>Prețul cel mai scăzut</option>
                <option>Cel mai bun raport calitate-preț</option>
                <option>Cel mai bun raport calitate-cost</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Data anunțului <span class="required">*</span></label>
              <input type="date" v-model="announcementForm.data.announcementDate" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Data limită transmitere oferte <span class="required">*</span></label>
              <input type="date" v-model="announcementForm.data.expireDate" class="form-input" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Limba de redactare a ofertei</label>
              <input type="text" v-model="announcementForm.data.language" class="form-input" placeholder="română" />
            </div>
            <div class="form-group">
              <label class="form-label">Sursa de finanțare a contractului</label>
              <input type="text" v-model="announcementForm.data.financingSource" class="form-input" placeholder="buget" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Perioada de valabilitate a ofertelor (zile)</label>
            <input type="number" v-model="announcementForm.data.validityPeriod" class="form-input" min="0" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Detalii propunerea tehnică</label>
              <textarea v-model="announcementForm.data.technicalDetails" class="modal-textarea" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Detalii propunerea financiară</label>
              <textarea v-model="announcementForm.data.financialDetails" class="modal-textarea" rows="3"></textarea>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Se acceptă actualizarea prețului contractului</label>
              <div class="radio-group">
                <label><input type="radio" v-model="announcementForm.data.priceUpdate" :value="true" /> DA</label>
                <label><input type="radio" v-model="announcementForm.data.priceUpdate" :value="false" /> NU</label>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Se acceptă oferte alternative</label>
              <div class="radio-group">
                <label><input type="radio" v-model="announcementForm.data.alternativeOffers" :value="true" /> DA</label>
                <label><input type="radio" v-model="announcementForm.data.alternativeOffers" :value="false" /> NU</label>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="announcementForm.open = false">Anulează</button>
          <button class="btn btn-primary" @click="saveAnnouncement" :disabled="saving">
            <span v-if="saving" class="spinner spinner-white"></span> Salvează
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Proces Verbal -->
    <div v-if="verbalProcessForm.open" class="modal-overlay" @click.self="verbalProcessForm.open = false">
      <div class="modal-box modal-wide">
        <div class="modal-header">
          <h3 class="modal-title">Proces verbal de evaluare al ofertelor</h3>
          <button class="modal-close" @click="verbalProcessForm.open = false">✕</button>
        </div>
        <div class="edit-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Data procesului verbal <span class="required">*</span></label>
              <input type="date" v-model="verbalProcessForm.data.verbalProcessDate" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Criteriul de atribuire <span class="required">*</span></label>
              <select v-model="verbalProcessForm.data.attributionCriteria" class="form-select">
                <option value="">— Selectează —</option>
                <option>Prețul cel mai scăzut</option>
                <option>Cel mai bun raport calitate-preț</option>
                <option>Cel mai bun raport calitate-cost</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Modalitatea de solicitare / obținere oferte <span class="required">*</span></label>
              <select v-model="verbalProcessForm.data.requestModality" class="form-select">
                <option value="">— Selectează —</option>
                <option>email</option>
                <option>fax</option>
                <option>online</option>
                <option>fizic</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Modalitatea de primire / obținere oferte <span class="required">*</span></label>
              <select v-model="verbalProcessForm.data.receiveModality" class="form-select">
                <option value="">— Selectează —</option>
                <option>email</option>
                <option>fax</option>
                <option>online</option>
                <option>fizic</option>
              </select>
            </div>
          </div>

          <!-- Membrii responsabili -->
          <div class="form-group">
            <label class="form-label">Responsabil procedură (Membru 1) <span class="required">*</span></label>
            <input type="text" class="form-input form-input--readonly" :value="currentUserLabel" readonly />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Responsabil procedură (Membru 2)</label>
              <select v-model="verbalProcessForm.data.member2" class="form-select">
                <option value="">— Selectează —</option>
                <option v-for="u in verbalProcessForm.users" :key="u.id" :value="u">{{ u.label }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Responsabil procedură (Membru 3)</label>
              <select v-model="verbalProcessForm.data.member3" class="form-select">
                <option value="">— Selectează —</option>
                <option v-for="u in verbalProcessForm.users" :key="u.id" :value="u">{{ u.label }}</option>
              </select>
            </div>
          </div>

          <!-- Oferte furnizori -->
          <div class="offers-section">
            <div v-for="(offer, idx) in verbalProcessForm.data.offers" :key="idx" class="offer-card">
              <div class="offer-header">
                <span class="offer-label">Oferta {{ idx + 1 }}</span>
                <button v-if="idx > 0" class="btn-remove" @click="removeOffer(idx)">✕</button>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">CUI furnizor</label>
                  <input type="text" v-model="offer.cui" class="form-input" />
                </div>
                <div class="form-group">
                  <label class="form-label">Nume furnizor</label>
                  <input type="text" v-model="offer.name" class="form-input" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Valoare totală fără TVA</label>
                  <input type="number" v-model="offer.totalValueWithoutTva" class="form-input" min="0" step="0.01" />
                </div>
                <div class="form-group">
                  <label class="form-label">Cotă TVA</label>
                  <input type="number" v-model="offer.tvaValue" class="form-input" min="0" step="0.01" />
                </div>
                <div class="form-group">
                  <label class="form-label">Valoare totală cu TVA</label>
                  <input type="number" v-model="offer.totalValueWithTva" class="form-input" min="0" step="0.01" />
                </div>
              </div>
            </div>
            <button class="btn btn-ghost btn-sm" @click="addOffer" style="margin-top:0.5rem;">
              <i class="fas fa-plus"></i> Adaugă ofertă
            </button>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="verbalProcessForm.open = false">Anulează</button>
          <button class="btn btn-primary" @click="saveVerbalProcess" :disabled="saving">
            <span v-if="saving" class="spinner spinner-white"></span> Salvează
          </button>
        </div>
      </div>
    </div>

    <!-- Modal confirmare finalizare procedură -->
    <div v-if="closeProcModal.open" class="modal-overlay" @click.self="closeProcModal.open = false">
      <div class="modal-box">
        <h3 class="modal-title">Finalizare procedură</h3>
        <p>Doriți să finalizați procedura?</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeProcModal.open = false">Anulează</button>
          <button class="btn btn-primary" @click="doCloseProcedureDoc" :disabled="saving">
            <span v-if="saving" class="spinner spinner-white"></span> Finalizează
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import {
  PAAP_CENTRALIZATION_GET_REFS,
  ACQUISITIONS_ADD,
  ANNOUNCEMENT_ADD,
  VERBAL_PROCESS_ADD,
  PROCEDURE_DOCUMENTS_CREATE,
  PROCEDURE_DOCUMENTS_ADD,
  PROCEDURE_DOCUMENTS_CLOSE,
  GET_PAAP_CENTRALIZATION
} from '@/api.js'

const ACQ_TITLE = {
  cmd1: 'COMANDĂ FERMĂ 1', cmd1_a2: 'COMANDĂ FERMĂ 1', cmd31: 'COMANDĂ FERMĂ ART.31',
  crt1: 'CONTRACT 1', crt1_a2: 'CONTRACT 1', crt31: 'CONTRACT ART.31',
  cmd3: 'COMANDĂ FERMĂ 3', cmd3_a2: 'COMANDĂ FERMĂ 3', cmd4: 'COMANDĂ FERMĂ 4',
  cmd2: 'COMANDĂ FERMĂ 2', cmd2_a2: 'COMANDĂ FERMĂ 2',
  crt3: 'CONTRACT 3', crt2: 'CONTRACT 2', crt3_a2: 'CONTRACT 3', crt2_a2: 'CONTRACT 2',
}
const ACQ_NUM_TITLE = {
  cmd1: 'Număr achiziție S.E.A.P', cmd1_a2: 'Număr achiziție S.E.A.P',
  cmd3: 'Număr proces verbal', cmd3_a2: 'Număr proces verbal',
  cmd31: 'Număr achiziție S.E.A.P/Ofertă', crt1: 'Număr achiziție S.E.A.P',
  crt1_a2: 'Număr achiziție S.E.A.P', crt31: 'Număr achiziție S.E.A.P/Ofertă',
  cmd4: 'Număr document fiscal', cmd2: 'Număr PV de evaluare a ofertelor',
  cmd2_a2: 'Număr PV de evaluare a ofertelor', crt3: 'Număr proces verbal',
  crt3_a2: 'Număr proces verbal', crt2: 'Număr proces verbal', crt2_a2: 'Număr proces verbal',
}
const ACQ_DATE_TITLE = {
  cmd1: 'Data achiziție', cmd1_a2: 'Data achiziție', cmd3: 'Data proces verbal',
  cmd3_a2: 'Data proces verbal', cmd31: 'Data achiziție/Ofertei',
  crt1: 'Data achiziție', crt1_a2: 'Data achiziție', crt31: 'Data achiziție/Ofertei',
  cmd4: 'Data documentului fiscal', cmd2: 'Data PV de evaluare a ofertelor',
  cmd2_a2: 'Data PV de evaluare a ofertelor', crt3: 'Data proces verbal',
  crt2: 'Data proces verbal', crt3_a2: 'Data proces verbal', crt2_a2: 'Data proces verbal',
}

export default {
  name: 'AssignmentsNeedReferences',
  data() {
    return {
      rows: [],
      centralization: null,
      loading: false,
      saving: false,
      checkedIds: [],
      allSelected: false,
      filters: { name: '', dept: '' },
      pageFrom: 0,
      pageSize: 15,
      acquisitionTitle: ACQ_TITLE,
      acquisitionNumberTitle: ACQ_NUM_TITLE,
      acquisitionDateTitle: ACQ_DATE_TITLE,
      statusIconMap: {
        draft: 'far fa-clock',
        closed: 'fas fa-badge-check',
        generated: 'fas fa-pencil',
      },
      statusTooltip: { draft: 'Draft', closed: 'Finalizat', generated: 'Generat' },
      actionsModal: { open: false, cmdType: '' },
      acquisitionForm: { open: false, type: '', data: {} },
      announcementForm: { open: false, data: {} },
      verbalProcessForm: { open: false, data: { offers: [{}], verbalProcessDate: '', attributionCriteria: '', requestModality: '', receiveModality: '', member2: '', member3: '' }, users: [] },
      closeProcModal: { open: false, row: null },
    }
  },
  computed: {
    procedureType() { return this.$route?.params?.procedureType || '' },
    centralizationId() { return this.$route?.params?.centralization || '' },
    procedureName() { return this.$store?.getters?.procedureTypes?.[this.procedureType]?.name || '' },
    currentYear() { return new Date().getFullYear() },
    currentUserLabel() {
      const rd = window.$getRoleAll?.() || {}
      return `${rd.last_name || ''} ${rd.first_name || ''} / ${rd.id || ''} — ${rd.role || ''}`.trim()
    },
    filteredRows() {
      let r = [...this.rows]
      if (this.filters.name) r = r.filter(x => x.name?.toLowerCase().includes(this.filters.name.toLowerCase()))
      if (this.filters.dept) r = r.filter(x => x.department?.name?.toLowerCase().includes(this.filters.dept.toLowerCase()))
      return r
    },
    paginatedRows() { return this.filteredRows.slice(this.pageFrom, this.pageFrom + this.pageSize) },
    selectedRefs() { return this.rows.filter(r => this.checkedIds.includes(r.id)) }
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        const [cRes, rRes] = await Promise.all([
          GET_PAAP_CENTRALIZATION(this.centralizationId),
          PAAP_CENTRALIZATION_GET_REFS(1, 500, this.centralizationId)
        ])
        const cData = await cRes.json()
        const rData = await rRes.json()
        this.centralization = cData?.data?.result || cData?.data || null
        this.rows = Array.isArray(rData?.data?.result) ? rData.data.result : []
      } catch(e) { console.error(e) }
      this.loading = false
    },
    getReferenceStatus(row) {
      if (this.isReferenceFinished(row)) return 'closed'
      if (row.procedureDocument?.length) return row.procedureDocument[0].status || 'draft'
      return 'draft'
    },
    isReferenceFinished(row) {
      return row.acquisitionProduct?.some(a => a.status === 'draft' || a.status === 'completed')
    },
    toggleCheck(row) {
      if (this.checkedIds.includes(row.id)) {
        this.checkedIds = this.checkedIds.filter(id => id !== row.id)
      } else {
        this.checkedIds.push(row.id)
      }
    },
    toggleSelectAll() {
      this.allSelected = !this.allSelected
      if (this.allSelected) {
        this.checkedIds = this.filteredRows
          .filter(r => r.nryear >= this.currentYear && !this.isReferenceFinished(r))
          .map(r => r.id)
      } else {
        this.checkedIds = []
      }
    },
    openActionsModal() {
      if (!this.checkedIds.length && !this.allSelected && !this.centralization?.imported) {
        alert('Nu a fost selectat niciun referat.')
        return
      }
      this.actionsModal = { open: true, cmdType: '' }
    },
    openAcquisitionForm(type) {
      this.actionsModal.open = false
      this.acquisitionForm = { open: true, type, data: { acqNumber: '', acquisitionDate: '', cui: '', supplierName: '', totalValueWithoutTva: 0, tvaValue: 0, totalValueWithTva: 0, attributionCriteria: '', deliveryAddress: '' } }
    },
    openAnnouncementForm() {
      this.actionsModal.open = false
      this.announcementForm = { open: true, data: { announcementNumber: '', announcementDate: '', expireDate: '', attributionCriteria: '', language: 'română', financingSource: 'buget', validityPeriod: '', technicalDetails: '', financialDetails: '', priceUpdate: false, alternativeOffers: false } }
    },
    openVerbalProcessForm() {
      this.actionsModal.open = false
      this.verbalProcessForm.open = true
      this.verbalProcessForm.data = { verbalProcessDate: new Date().toISOString().slice(0,10), attributionCriteria: '', requestModality: '', receiveModality: '', member2: '', member3: '', offers: [{ cui: '', name: '', totalValueWithoutTva: 0, tvaValue: 0, totalValueWithTva: 0 }] }
    },
    async openProcedureDocumentModal() {
      if (!this.checkedIds.length && !this.allSelected) { alert('Nu a fost selectat niciun referat.'); return }
      alert('Funcționalitate upload documente — în implementare.')
    },
    addOffer() { this.verbalProcessForm.data.offers.push({ cui: '', name: '', totalValueWithoutTva: 0, tvaValue: 0, totalValueWithTva: 0 }) },
    removeOffer(idx) { this.verbalProcessForm.data.offers.splice(idx, 1) },
    async saveAcquisition() {
      const f = this.acquisitionForm.data
      if (!f.acqNumber || !f.acquisitionDate || !f.cui || !f.supplierName || !f.totalValueWithoutTva) {
        alert('Completați toate câmpurile obligatorii.'); return
      }
      this.saving = true
      try {
        const res = await ACQUISITIONS_ADD({
          acqNumber: f.acqNumber,
          acquisitionDate: new Date(f.acquisitionDate).toISOString(),
          institutionProviderCui: f.cui,
          institutionProviderName: f.supplierName,
          totalValueWithoutTva: +f.totalValueWithoutTva,
          tvaValue: +f.tvaValue,
          totalValueWithTva: +f.totalValueWithTva,
          attributionCriteria: f.attributionCriteria,
          deliveryAddress: f.deliveryAddress,
          acqType: this.acquisitionForm.type,
          needReferences: this.allSelected ? 'all' : this.selectedRefs.map(r => r.id),
          paapCentralization: { id: this.centralizationId }
        })
        const data = await res.json()
        if (String(data?.meta?.HttpStatusCode)?.[0] === '2') {
          this.acquisitionForm.open = false
          this.$router.push(`/atribuire/procedura/${this.procedureType}/${this.centralizationId}/achizitii`)
        } else { alert(data?.response || 'Salvarea a eșuat.') }
      } catch(e) { console.error(e) }
      this.saving = false
    },
    async saveAnnouncement() {
      const f = this.announcementForm.data
      if (!f.announcementNumber || !f.announcementDate || !f.expireDate || !f.attributionCriteria) {
        alert('Completați câmpurile obligatorii.'); return
      }
      this.saving = true
      try {
        const res = await ANNOUNCEMENT_ADD({
          ...f,
          announcementDate: new Date(f.announcementDate).toISOString(),
          expireDate: new Date(f.expireDate).toISOString(),
          needReferences: this.allSelected ? 'all' : this.selectedRefs.map(r => r.id),
          paapCentralization: { id: this.centralizationId }
        })
        const data = await res.json()
        if (String(data?.meta?.HttpStatusCode)?.[0] === '2') {
          this.announcementForm.open = false
          this.$router.push(`/atribuire/procedura/${this.procedureType}/${this.centralizationId}/anunt`)
        } else { alert(data?.response || 'Salvarea a eșuat.') }
      } catch(e) { console.error(e) }
      this.saving = false
    },
    async saveVerbalProcess() {
      const f = this.verbalProcessForm.data
      if (!f.verbalProcessDate || !f.attributionCriteria || !f.requestModality || !f.receiveModality) {
        alert('Completați câmpurile obligatorii.'); return
      }
      if (!f.offers.length) { alert('Trebuie adăugat cel puțin un furnizor.'); return }
      this.saving = true
      try {
        const res = await VERBAL_PROCESS_ADD({
          verbalProcessDate: new Date(f.verbalProcessDate).toISOString(),
          attributionCriteria: f.attributionCriteria,
          requestModality: f.requestModality,
          receiveModality: f.receiveModality,
          memberRole: [window.$getRoleAll?.()?.id, f.member2?.id, f.member3?.id].filter(Boolean),
          verbalProcessInstitutionProvider: f.offers,
          needReferences: this.allSelected ? 'all' : this.selectedRefs.map(r => r.id),
          paapCentralization: { id: this.centralizationId }
        })
        const data = await res.json()
        if (String(data?.meta?.HttpStatusCode)?.[0] === '2') {
          this.verbalProcessForm.open = false
          this.$router.push(`/atribuire/procedura/${this.procedureType}/${this.centralizationId}/proces-verbal`)
        } else { alert(data?.response || 'Salvarea a eșuat.') }
      } catch(e) { console.error(e) }
      this.saving = false
    },
    updateProcedureDoc(row) { alert('Adăugare documente — în implementare.') },
    closeProcedureDoc(row) { this.closeProcModal = { open: true, row } },
    async doCloseProcedureDoc() {
      const item = this.closeProcModal.row?.procedureDocument?.[0]
      if (!item?.id) return
      this.saving = true
      try {
        await PROCEDURE_DOCUMENTS_CLOSE(item.id)
        this.closeProcModal.open = false
        await this.loadData()
      } catch(e) { console.error(e) }
      this.saving = false
    },
    viewPdf(row) { window.open(`/api/referat-necesitate/${row.id}/pdf`, '_blank') },
    clearFilters() { this.filters = { name: '', dept: '' }; this.pageFrom = 0 },
    prevPage() { if (this.pageFrom > 0) this.pageFrom -= this.pageSize },
    nextPage() { if (this.pageFrom + this.pageSize < this.filteredRows.length) this.pageFrom += this.pageSize },
    formatPrice(val) { if (!val && val !== 0) return '—'; return Number(val).toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
    formatUser(u) { if (!u) return '—'; return `${u.last_name || ''} ${u.first_name || ''} — ${u.id || ''}`.trim() },
  },
  created() { this.loadData() }
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; min-height: 100%; font-family: 'Roboto', sans-serif; }
.page-header { padding: 1rem 1.5rem 0.5rem; background: white; border-bottom: 1px solid #e0e8f0; }
.breadcrumb { font-size: 0.8rem; color: #888; margin-bottom: 0.5rem; }
.breadcrumb-link { cursor: pointer; color: #1565C0; }
.breadcrumb-link:hover { text-decoration: underline; }
.breadcrumb-sep { margin: 0 0.3rem; }
.breadcrumb-current { color: #555; }
.page-title-row { display: flex; align-items: flex-start; justify-content: space-between; padding-bottom: 0.75rem; gap: 1rem; }
.page__title { font-size: 1.2rem; font-weight: 700; color: #1a2f4e; margin: 0; flex: 1; }
.titlebar-actions { display: flex; gap: 0.5rem; flex-shrink: 0; }
.loading-state { display: flex; flex-direction: column; align-items: center; padding: 4rem; color: #888; gap: 1rem; }
.spinner-lg { width: 36px; height: 36px; border: 3px solid #e0e8f8; border-top-color: #1565C0; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; }
.table-container { flex: 1; padding: 1rem 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; }
.filters-row { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.filter-input { padding: 0.4rem 0.75rem; border: 1.5px solid #ddd; border-radius: 6px; font-size: 0.85rem; font-family: inherit; min-width: 160px; }
.filter-input:focus { outline: none; border-color: #1565C0; }
.table-wrap { overflow-x: auto; background: white; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.data-table-scroll { flex: 1; overflow-y: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; min-width: 1000px; }
.data-table th { background: #1565C0; color: white; padding: 0.55rem 0.65rem; text-align: left; font-size: 0.72rem; font-weight: 600; white-space: nowrap; }
.data-table td { padding: 0.45rem 0.65rem; border-bottom: 1px solid #f0f0f0; vertical-align: middle; }
.data-table tr:last-child td { border-bottom: none; }
.data-table tr.tr-data:hover td { background: #f5f8ff; }
.chk-col { width: 36px; text-align: center; }
.num-cell { text-align: right; font-variant-numeric: tabular-nums; }
.cpv-cell { font-family: monospace; font-size: 0.75rem; color: #1565C0; }
.empty-cell { text-align: center; color: #aaa; padding: 2rem; font-style: italic; }
.status-icon i { font-size: 1.1rem; }
.status-icon.status-draft i { color: #f2da07; }
.status-icon.status-closed i { color: green; }
.status-icon.status-generated i { color: #569a36; }
.actions-cell { display: flex; gap: 4px; align-items: center; justify-content: flex-end; }
.action-btn { background: none; border: none; cursor: pointer; padding: 4px 5px; border-radius: 4px; transition: background 0.15s; }
.action-btn:hover { background: #f0f4ff; }
.pagination-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; color: #555; position: sticky; bottom: 0; z-index: 2; background: white; padding: 0.5rem 0.75rem; border-top: 1px solid #e8e8e8; }
.pagination-controls { display: flex; align-items: center; gap: 0.75rem; }
.page-btn { background: white; border: 1px solid #ddd; border-radius: 4px; padding: 4px 10px; cursor: pointer; }
.page-btn:disabled { opacity: 0.4; cursor: default; }
.page-btn:not(:disabled):hover { background: #f0f4ff; border-color: #1565C0; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
.modal-box { background: white; border-radius: 10px; padding: 1.5rem; max-width: 520px; width: 100%; box-shadow: 0 8px 32px rgba(0,0,0,0.18); max-height: 90vh; overflow-y: auto; }
.modal-wide { max-width: 800px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.modal-title { font-size: 1rem; font-weight: 700; color: #1a2f4e; margin: 0; }
.modal-close { background: none; border: none; cursor: pointer; font-size: 1rem; color: #888; }
.modal-close:hover { color: #333; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem; }
.modal-textarea { width: 100%; border: 1.5px solid #ddd; border-radius: 6px; padding: 0.5rem 0.75rem; font-size: 0.875rem; font-family: inherit; resize: vertical; box-sizing: border-box; }
.modal-textarea:focus { outline: none; border-color: #1565C0; }
.edit-form { display: flex; flex-direction: column; gap: 0.75rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.form-group { display: flex; flex-direction: column; gap: 4px; }
.form-label { font-size: 0.78rem; font-weight: 500; color: #444; }
.required { color: #e53935; }
.form-input, .form-select { border: 1.5px solid #ddd; border-radius: 6px; padding: 0.45rem 0.75rem; font-size: 0.875rem; font-family: inherit; width: 100%; box-sizing: border-box; }
.form-input:focus, .form-select:focus { outline: none; border-color: #1565C0; }
.form-input--readonly { background: #f8f9fc; color: #666; }
.radio-group { display: flex; gap: 1rem; align-items: center; }
.cmd-section { background: #f5f8ff; border-radius: 8px; padding: 1rem; margin: 0.75rem 0; }
.cmd-label { font-weight: 600; font-size: 0.85rem; color: #1a2f4e; margin-bottom: 0.5rem; }
.cmd-btns { display: flex; gap: 0.5rem; flex-wrap: wrap; border: 1px solid #ddd; border-radius: 6px; padding: 0.75rem; justify-content: space-around; }
.btn-cmd { background: #1565C0; color: white; border: none; border-radius: 6px; padding: 0.5rem 1.5rem; font-weight: 600; cursor: pointer; font-family: inherit; }
.btn-cmd:hover { background: #1251a3; }
.offers-section { display: flex; flex-direction: column; gap: 0.75rem; }
.offer-card { background: #f5f8ff; border-radius: 8px; padding: 1rem; }
.offer-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
.offer-label { font-weight: 600; font-size: 0.85rem; color: #1a2f4e; }
.btn-remove { background: none; border: none; cursor: pointer; color: #e53935; font-size: 1rem; }
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 0.45rem 1rem; border-radius: 6px; border: none; cursor: pointer; font-size: 0.875rem; font-weight: 500; font-family: inherit; transition: background 0.15s; }
.btn-sm { padding: 0.35rem 0.75rem; font-size: 0.82rem; }
.btn-primary { background: #1565C0; color: white; }
.btn-primary:hover:not(:disabled) { background: #1251a3; }
.btn-primary:disabled { opacity: 0.5; cursor: default; }
.btn-secondary { background: #f5f5f5; color: #333; border: 1px solid #ddd; }
.btn-secondary:hover { background: #e8e8e8; }
.btn-ghost { background: transparent; color: #888; border: 1px solid #ddd; }
.btn-ghost:hover { background: #f5f5f5; }
.spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; }
.spinner-white { border-color: rgba(255,255,255,0.3); border-top-color: white; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
