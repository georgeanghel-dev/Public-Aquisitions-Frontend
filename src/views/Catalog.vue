<template>
  <div class="page" @click="closeAllDropdowns">

    <!-- Breadcrumb -->
    <div class="page__breadcrumb">
      <router-link to="/">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      </router-link>
      <span class="bc-sep">›</span><span>Acasă</span>
      <span class="bc-sep">›</span><span class="bc-cur">Catalog</span>
    </div>

    <!-- Titlu + Adaugă -->
    <div class="page__titlebar">
      <h1 class="page__title">Catalog produse/lucrări/servicii</h1>
      <button v-if="canCreate" class="btn-add" @click.stop="openAddForm">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Adaugă
      </button>
    </div>

    <!-- Tabel -->
    <div class="page__content">
      <div class="tbl-card">
        <div class="tbl-wrap" ref="tblWrapRef">
          <table class="tbl" ref="tableRef">
            <!-- ── THEAD ── -->
            <thead>
              <!-- Rând 1: Titluri coloane -->
              <tr class="tbl-head-row">
                <!-- Bloc sticky stânga — header -->
                <th class="th-fixed-left-block">
                  <table class="fixed-inner-table-left"><tr>
                    <th class="fix-th-left fix-th-left--nr">NR.</th>
                    <th class="fix-th-left fix-th-left--name th--sort" @click="sortBy('name')">DENUMIRE PRODUS <span class="sort-ico"><template v-if="sortIcon('name')==='up'">▲</template><template v-else-if="sortIcon('name')==='down'">▼</template><template v-else>⇅</template></span></th>
                  </tr></table>
                </th>
                <th class="th th--sort" @click="sortBy('cpvCategory.group')">DENUMIRE GRUP <span class="sort-ico"><template v-if="sortIcon('cpvCategory.group')==='up'">▲</template><template v-else-if="sortIcon('cpvCategory.group')==='down'">▼</template><template v-else>⇅</template></span></th>
                <th class="th th--sort" @click="sortBy('cpvCategory.class')">DENUMIRE CLASĂ <span class="sort-ico"><template v-if="sortIcon('cpvCategory.class')==='up'">▲</template><template v-else-if="sortIcon('cpvCategory.class')==='down'">▼</template><template v-else>⇅</template></span></th>
                <th class="th th--sort" @click="sortBy('cpvCategory.category')">DENUMIRE CATEGORIE <span class="sort-ico"><template v-if="sortIcon('cpvCategory.category')==='up'">▲</template><template v-else-if="sortIcon('cpvCategory.category')==='down'">▼</template><template v-else>⇅</template></span></th>
                <th class="th th--sort" @click="sortBy('cpvCategory.cpvCode')">COD CPV <span class="sort-ico"><template v-if="sortIcon('cpvCategory.cpvCode')==='up'">▲</template><template v-else-if="sortIcon('cpvCategory.cpvCode')==='down'">▼</template><template v-else>⇅</template></span></th>
                <th class="th th--sort" @click="sortBy('description')">DESCRIERE PRODUS <span class="sort-ico"><template v-if="sortIcon('description')==='up'">▲</template><template v-else-if="sortIcon('description')==='down'">▼</template><template v-else>⇅</template></span></th>
                <th class="th th--sort" @click="sortBy('measurementUnit.shortName')">UM <span class="sort-ico"><template v-if="sortIcon('measurementUnit.shortName')==='up'">▲</template><template v-else-if="sortIcon('measurementUnit.shortName')==='down'">▼</template><template v-else>⇅</template></span></th>
                <th class="th th--sort" @click="sortBy('createdAt')">DATA CREĂRII <span class="sort-ico"><template v-if="sortIcon('createdAt')==='up'">▲</template><template v-else-if="sortIcon('createdAt')==='down'">▼</template><template v-else>⇅</template></span></th>
                <!-- Bloc sticky dreapta — header -->
                <th class="th-fixed-block">
                  <table class="fixed-inner-table"><tr>
                    <th class="fix-th fix-th--validare"></th>
                    <th class="fix-th fix-th--stare"></th>
                    <th class="fix-th fix-th--actiuni"></th>
                  </tr></table>
                </th>
              </tr>

              <!-- Rând 2: Filtre -->
              <tr class="tbl-filter-row">
                <!-- Bloc sticky stânga — filtre -->
                <td class="tf-fixed-left-block">
                  <table class="fixed-inner-table-left"><tr>
                    <td class="fix-tf-left fix-tf-left--nr"></td>
                    <td class="fix-tf-left fix-tf-left--name">
                      <div class="f-input">
                        <svg class="f-ico" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        <input v-model="f.name" @input="debouncedLoad" placeholder="Caută..." />
                      </div>
                    </td>
                  </tr></table>
                </td>
                <td class="tf">
                  <div class="f-input">
                    <svg class="f-ico" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input v-model="f.group" @input="debouncedLoad" placeholder="Caută..." />
                  </div>
                </td>
                <td class="tf">
                  <div class="f-input">
                    <svg class="f-ico" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input v-model="f.class" @input="debouncedLoad" placeholder="Caută..." />
                  </div>
                </td>
                <td class="tf">
                  <div class="f-input">
                    <svg class="f-ico" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input v-model="f.category" @input="debouncedLoad" placeholder="Caută..." />
                  </div>
                </td>
                <td class="tf">
                  <div class="f-input">
                    <svg class="f-ico" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input v-model="f.cpvCode" @input="debouncedLoad" placeholder="Caută..." />
                  </div>
                </td>
                <td class="tf">
                  <div class="f-input">
                    <svg class="f-ico" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input v-model="f.description" @input="debouncedLoad" placeholder="Caută..." />
                  </div>
                </td>
                <td class="tf">
                  <div class="f-input">
                    <svg class="f-ico" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input v-model="f.mu" @input="debouncedLoad" placeholder="Caută..." />
                  </div>
                </td>
                <td class="tf">
                  <div class="f-input f-input--date">
                    <DatePickerRo v-model="f.dateFrom" placeholder="De la" @change="loadData" />
                    <span>—</span>
                    <DatePickerRo v-model="f.dateTo" placeholder="Până la" @change="loadData" />
                  </div>
                </td>
                <!-- Bloc sticky dreapta — filtre -->
                <td class="tf-fixed-block">
                  <table class="fixed-inner-table"><tr>
                    <td class="fix-tf fix-tf--validare">
                      <div class="f-dd-wrap" @click.stop="toggleDd('status')" :class="{'f-dd-wrap--active': f.status.length}" data-tooltip="Starea validării">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" :style="f.status.length ? 'color:#1565C0' : 'color:#9e9e9e'"><path d="M4 6h16l-6 7v5l-4-2v-3L4 6z"/></svg>
                        <div v-if="dd.status" class="f-dd-menu f-dd-menu--right" @click.stop>
                          <div class="f-dd-title">Filtrează după validare</div>
                          <label class="f-dd-opt" v-for="opt in statusOpts" :key="opt.value">
                            <input type="checkbox" :value="opt.value" v-model="f.status" @change="loadData" />
                            <svg v-if="opt.icon === 'svg-hourglass'" width="14" height="14" viewBox="0 0 24 24" fill="none" :stroke="opt.color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 1 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>
                            <svg v-else-if="opt.icon === 'svg-clipboard-check'" width="14" height="14" viewBox="0 0 24 24" fill="none" :stroke="opt.color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" ry="3"/><polyline points="9 12 11 14 15 10"/></svg>
                            <svg v-else-if="opt.icon === 'svg-times-circle'" width="14" height="14" viewBox="0 0 24 24" fill="none" :stroke="opt.color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                            <span>{{ opt.label }}</span>
                          </label>
                          <div class="f-dd-clear" @click="f.status=[]; loadData(); dd.status=false">Toate</div>
                        </div>
                      </div>
                    </td>
                    <td class="fix-tf fix-tf--stare">
                      <div class="f-dd-wrap" @click.stop="toggleDd('active')" :class="{'f-dd-wrap--active': f.isActive !== null}" data-tooltip="Starea poziției">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" :style="f.isActive !== null ? 'color:#1565C0' : 'color:#9e9e9e'"><path d="M4 6h16l-6 7v5l-4-2v-3L4 6z"/></svg>
                        <div v-if="dd.active" class="f-dd-menu f-dd-menu--right" @click.stop>
                          <div class="f-dd-title">Filtrează după stare</div>
                          <div class="f-dd-opt f-dd-opt--radio" @click="f.isActive=null; loadData(); dd.active=false"><span>Toate</span></div>
                          <div class="f-dd-opt f-dd-opt--radio" @click="f.isActive=true; loadData(); dd.active=false">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="green" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                            <span>Activat</span>
                          </div>
                          <div class="f-dd-opt f-dd-opt--radio" @click="f.isActive=false; loadData(); dd.active=false">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                            <span>Dezactivat</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="fix-tf fix-tf--actiuni">
                      <button class="btn-clear" @click="clearFilters" data-tooltip="Șterge filtrele">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </td>
                  </tr></table>
                </td>
              </tr>
            </thead>

            <!-- ── TBODY ── -->
            <tbody>
              <!-- Loading -->
              <tr v-if="loading">
                <td colspan="12" class="td-state">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1565C0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation:spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                </td>
              </tr>

              <!-- Empty -->
              <tr v-else-if="!rows.length">
                <td colspan="12" class="td-state">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#E0E0E0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
                  <span>Nu există înregistrări</span>
                </td>
              </tr>

              <!-- Rânduri date -->
              <tr v-else v-for="(row, i) in rows" :key="row.id" class="td-row" :class="{'td-row--alt': i % 2 !== 0}">
                <!-- Bloc sticky stânga — date -->
                <td class="td-fixed-left-block" :class="{'td-fixed-left-block--alt': i % 2 !== 0}">
                  <table class="fixed-inner-table-left"><tr>
                    <td class="fix-td-left fix-td-left--nr">{{ (page-1)*perPage + i + 1 }}</td>
                    <td class="fix-td-left fix-td-left--name"><div>{{ row.name || '—' }}</div></td>
                  </tr></table>
                </td>
                <td class="td"><div class="cell-clamp">{{ row.cpvCategory?.group || '—' }}</div></td>
                <td class="td"><div class="cell-clamp">{{ row.cpvCategory?.class || '—' }}</div></td>
                <td class="td"><div class="cell-clamp">{{ row.cpvCategory?.category || '—' }}</div></td>
                <td class="td td--cpv">
                  <span v-if="row.cpvCategory?.cpvCode" class="cpv-badge" :title="row.cpvCategory?.name">
                    {{ row.cpvCategory.cpvCode }}
                  </span>
                  <span v-else>—</span>
                </td>
                <td class="td td--desc"><div class="cell-clamp cell-clamp--3">{{ row.cpvCategory?.name || stripHtml(row.description) }}</div></td>
                <td class="td td--mu">
                  <span :title="row.measurementUnit?.description || ''">{{ row.measurementUnit?.shortName || '—' }}</span>
                </td>
                <td class="td td--date">{{ formatDate(row.createdAt) }}</td>

                <!-- Bloc sticky dreapta — date -->
                <td class="td-fixed-block" :class="{'td-fixed-block--alt': i % 2 !== 0, 'td-fixed-block--menu-open': activeMenu === row.id}">
                  <table class="fixed-inner-table"><tr>
                    <td class="fix-td fix-td--validare">
                      <span v-if="row.status === 'completed'" title="Validat">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#39f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" ry="3"/><polyline points="9 12 11 14 15 10"/></svg>
                      </span>
                      <span v-else-if="row.status === 'in_progres'" title="În curs de validare">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#39f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 1 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>
                      </span>
                      <span v-else-if="row.status === 'rejected'" title="Respins">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                      </span>
                      <span v-else style="color:#ccc">—</span>
                    </td>
                    <td class="fix-td fix-td--stare">
                      <span v-if="row.isActive === true" title="Activ">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="green" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      </span>
                      <span v-else title="Dezactivat">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      </span>
                    </td>
                    <td class="fix-td fix-td--actiuni">
                      <div class="kebab-wrap">
                        <div class="kebab" @click.stop="toggleMenu(row.id)">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="#9e9e9e"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
                        </div>
                        <div v-if="activeMenu === row.id" class="kebab-menu" @click.stop>
                          <button v-if="canEdit(row)" class="kebab-item" @click="editRow(row); activeMenu=null">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F57F17" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            Editează
                          </button>
                          <button v-if="canDisable && row.isActive === true" class="kebab-item" @click="toggleActive(row); activeMenu=null">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E53935" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                            Dezactivează
                          </button>
                          <button v-if="canEnable && row.isActive === false" class="kebab-item" @click="toggleActive(row); activeMenu=null">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="green" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                            Activează
                          </button>
                          <button v-if="canApprove(row)" class="kebab-item" @click="approveRow(row); activeMenu=null">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="green" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                            Aprobă
                          </button>
                          <button v-if="canDelete(row)" class="kebab-item kebab-item--danger" @click="deleteRow(row); activeMenu=null">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E53935" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                            Șterge
                          </button>
                          <div class="kebab-divider"></div>
                          <button class="kebab-item" @click="viewHistory(row); activeMenu=null">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1565C0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>
                            Istoric versiuni
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr></table>
                </td>
              </tr>
            </tbody>

          </table>
        </div>

        <!-- Footer -->
        <div class="tbl-footer">
          <span class="tbl-total">TOTAL AFIȘAT: {{ totalRecords }}</span>
          <div class="tbl-pagination">
            <span class="tbl-pp-label">Rânduri pe pagină:</span>
            <select class="tbl-pp-select" v-model="perPage" @change="page=1; loadData()">
              <option :value="10">10</option>
              <option :value="15">15</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
            </select>
            <span class="tbl-pages">{{ pageFrom }}–{{ pageTo }}</span>
            <div class="tbl-nav">
              <button class="nav-btn" @click="page--; loadData()" :disabled="page <= 1">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <button class="nav-btn" @click="page++; loadData()" :disabled="page >= totalPages">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>



    <!-- Form adaugare/editare -->
    <CatalogForm
      v-if="formOpen"
      :product="editProduct"
      @close="formOpen=false"
      @saved="formOpen=false; loadData()"
    />

    <!-- Istoric -->
    <CatalogHistory
      v-if="historyProduct"
      :product="historyProduct"
      @close="historyProduct=null"
    />

    <!-- Modal alert -->
    <Teleport to="body">
      <div v-if="alertModal.open" class="modal-overlay" @click.self="alertModal.open=false">
        <div class="modal-box">
          <div class="modal-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#E53935" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
          <p class="modal-msg">{{ alertModal.message }}</p>
          <button class="s-btn s-btn--primary" @click="alertModal.open=false">OK</button>
        </div>
      </div>
    </Teleport>

    <!-- Modal confirm -->
    <Teleport to="body">
      <div v-if="confirmModal.open" class="modal-overlay" @click.self="confirmModal.open=false">
        <div class="modal-box">
          <h3 class="modal-title">{{ confirmModal.title }}</h3>
          <p class="modal-msg" style="white-space:pre-line">{{ confirmModal.message }}</p>
          <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px">
            <button class="s-btn s-btn--secondary" @click="confirmModal.open=false">Anulează</button>
            <button class="s-btn s-btn--primary" @click="confirmModal.onConfirm?.()">Confirmă</button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import DatePickerRo from '@/components/DatePickerRo.vue'
import { PRODUCTS_PAGINATED, PRODUCTS_MODIFY, PRODUCTS_CAN_EDIT_CPV } from '@/api.js'
import CatalogForm from '@/components/CatalogForm.vue'
import CatalogHistory from '@/components/CatalogHistory.vue'

// ── State ───────────────────────────────────────────────────────────────────────
const rows         = ref([])
const totalRecords = ref(0)
const page         = ref(1)
const perPage      = ref(15)
const loading      = ref(false)

const formOpen      = ref(false)
const editProduct   = ref(null)
const historyProduct = ref(null)
const alertModal    = ref({ open: false, message: '' })
const confirmModal  = ref({ open: false, title: '', message: '', onConfirm: null })

// Kebab menu — Teleport la body
const activeMenu  = ref(null)
const tblWrapRef  = ref(null)

// Dropdown filtre
const dd = ref({ status: false, active: false })

// Sort
const sortField = ref('createdAt')
const sortDir   = ref(-1)

// Filtre
const f = ref({
  name: '', group: '', class: '', category: '',
  cpvCode: '', description: '', mu: '',
  dateFrom: '', dateTo: '',
  status: [], isActive: null,
})

const statusOpts = [
  { value: 'in_progres', label: 'În curs de validare', icon: 'svg-hourglass',       color: '#39f' },
  { value: 'completed',  label: 'Validat',              icon: 'svg-clipboard-check', color: '#39f' },
  { value: 'rejected',   label: 'Respins',              icon: 'svg-times-circle',    color: 'red'  },
]

// ── Computed ────────────────────────────────────────────────────────────────────
const role         = computed(() => window.$getRoleAll?.()?.role || '')
const canCreate    = computed(() => ['superadmin','angajat','supervisor','responsabil_achizitii','responsabil_buget'].includes(role.value))
const canEnable    = computed(() => role.value === 'superadmin')
const canDisable   = computed(() => role.value === 'superadmin')
const canConfirm   = computed(() => ['responsabil_achizitii','supervizor_achizitii','responsabil_achizitii_extern'].includes(role.value))
const totalPages   = computed(() => Math.max(1, Math.ceil(totalRecords.value / perPage.value)))
const pageFrom     = computed(() => totalRecords.value ? (page.value-1)*perPage.value + 1 : 0)
const pageTo       = computed(() => Math.min(page.value * perPage.value, totalRecords.value))

// ── Sort ────────────────────────────────────────────────────────────────────────
function sortBy(field) {
  if (sortField.value === field) sortDir.value = sortDir.value === 1 ? -1 : 1
  else { sortField.value = field; sortDir.value = -1 }
  page.value = 1; loadData()
}
function sortIcon(field) {
  if (sortField.value !== field) return 'none'
  return sortDir.value === 1 ? 'up' : 'down'
}

// ── Load ────────────────────────────────────────────────────────────────────────
let debounceTimer = null
function debouncedLoad() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { page.value = 1; loadData() }, 400)
}

async function loadData() {
  loading.value = true
  try {
    const params = []
    if (f.value.name)        params.push(`name=${encodeURIComponent(f.value.name)}`)
    if (f.value.group)       params.push(`cpvCategory.group=${encodeURIComponent(f.value.group)}`)
    if (f.value.class)       params.push(`cpvCategory.class=${encodeURIComponent(f.value.class)}`)
    if (f.value.category)    params.push(`cpvCategory.category=${encodeURIComponent(f.value.category)}`)
    if (f.value.cpvCode)     params.push(`cpvCategory.cpvCode=${encodeURIComponent(f.value.cpvCode)}`)
    if (f.value.description) params.push(`description=${encodeURIComponent(f.value.description)}`)
    if (f.value.mu)          params.push(`measurementUnit.shortName=${encodeURIComponent(f.value.mu)}`)
    if (f.value.dateFrom && f.value.dateTo) params.push(`createdAt=${f.value.dateFrom}|${f.value.dateTo}`)
    else if (f.value.dateFrom) params.push(`gte=createdAt,${f.value.dateFrom}`)
    else if (f.value.dateTo)   params.push(`lte=createdAt,${f.value.dateTo}`)
    if (f.value.status.length) params.push(`status=${f.value.status.join(',')}`)
    else params.push(`neq=status,rejected`)
    if (f.value.isActive === true)  params.push(`isActive=1`)
    else if (f.value.isActive === false) params.push(`isActive=0`)
    params.push(`orderFieldName=${sortField.value}`)
    params.push(`orderValue=${sortDir.value === 1 ? 'ASC' : 'DESC'}`)

    const res  = await PRODUCTS_PAGINATED(page.value, perPage.value, params.join('&'))
    const data = await res.json()
    rows.value         = Array.isArray(data?.data?.result) ? data.data.result : []
    totalRecords.value = Number.isInteger(data?.data?.recordsQuantity) ? data.data.recordsQuantity : 0
  } catch (e) {
    console.error('loadData:', e)
  } finally {
    loading.value = false
  }
}

// ── Dropdown filtre ─────────────────────────────────────────────────────────────
function toggleDd(key) {
  Object.keys(dd.value).forEach(k => { if (k !== key) dd.value[k] = false })
  dd.value[key] = !dd.value[key]
  activeMenu.value = null
}
function closeAllDropdowns() {
  Object.keys(dd.value).forEach(k => dd.value[k] = false)
  activeMenu.value = null
}
function clearFilters() {
  f.value = { name:'', group:'', class:'', category:'', cpvCode:'', description:'', mu:'', dateFrom:'', dateTo:'', status:[], isActive:null }
  page.value = 1; loadData()
}

// ── Kebab menu ──────────────────────────────────────────────────────────────────
function toggleMenu(id) {
  Object.keys(dd.value).forEach(k => dd.value[k] = false)
  activeMenu.value = activeMenu.value === id ? null : id
}

// ── Helpers ─────────────────────────────────────────────────────────────────────
function formatDate(d) {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('ro-RO') } catch { return d }
}
function stripHtml(html) {
  if (!html) return '—'
  return html.replace(/<b>/g,'').replace(/<[/]b>/g,'').replace(/<[^>]+>/g,' ').replace(/[ ]{2,}/g,' ').trim() || '—'
}

// ── Permissions ─────────────────────────────────────────────────────────────────
function canEdit(row)    { return ['superadmin','sef_institutie','admin_institutie'].includes(role.value) }
function canApprove(row) { return row && canConfirm.value && row.status === 'in_progres' }
function canDelete(row)  { return row && ['responsabil_achizitii','supervizor_achizitii'].includes(role.value) && !row.needsCount }

// ── Actions ─────────────────────────────────────────────────────────────────────
function openAddForm()     { editProduct.value = null; formOpen.value = true }
function editRow(row)      { editProduct.value = row; formOpen.value = true }
function viewHistory(row)  { historyProduct.value = row }
function approveRow(row)   { alertModal.value = { open: true, message: 'Funcționalitate de aprobare va fi implementată.' } }
function deleteRow(row)    { if (!row?.id || row.needsCount) return; alertModal.value = { open: true, message: 'Funcționalitate de ștergere va fi implementată.' } }

async function toggleActive(row) {
  if (!row?.id) return
  if (!row.isActive) {
    try { await PRODUCTS_MODIFY(row.id, { isActive: true }); row.isActive = true } catch { alertModal.value = { open: true, message: 'A apărut o eroare.' } }
    return
  }
  try {
    const res = await PRODUCTS_CAN_EDIT_CPV(row.id)
    const data = await res.json()
    const status = data?.data?.result
    if (status === 1) { alertModal.value = { open: true, message: 'Poziția nu poate fi dezactivată deoarece face parte dintr-un referat de necesitate.' }; return }
    if (status === 2) {
      confirmModal.value = { open: true, title: 'Dezactivare poziție de catalog', message: 'Există propuneri de nevoi active bazate pe această poziție.\nDupă dezactivare, unele propuneri vor fi anulate automat.\n\nDoriți să continuați?', onConfirm: async () => { confirmModal.value.open = false; await doDeactivate(row) } }
      return
    }
    if (status === 3) await doDeactivate(row)
  } catch { alertModal.value = { open: true, message: 'Nu s-a putut verifica. Încercați din nou.' } }
}
async function doDeactivate(row) {
  try { await PRODUCTS_MODIFY(row.id, { isActive: false }); row.isActive = false }
  catch { alertModal.value = { open: true, message: 'A apărut o eroare la dezactivare.' } }
}

// ── Lifecycle ───────────────────────────────────────────────────────────────────
onMounted(() => {
  loadData()
  document.addEventListener('click', closeAllDropdowns)

})
onBeforeUnmount(() => {
  clearTimeout(debounceTimer)
  document.removeEventListener('click', closeAllDropdowns)
})
</script>

<style scoped>
/* ── Page ── */
.page { display: flex; flex-direction: column; height: 100%; overflow: hidden; font-family: 'Roboto', sans-serif; }

.page__breadcrumb { background: #1565C0; padding: 9px 24px; display: flex; align-items: center; gap: 6px; font-size: 12px; color: rgba(255,255,255,0.8); flex-shrink: 0; }
.page__breadcrumb a { color: rgba(255,255,255,0.8); text-decoration: none; }
.bc-sep { color: rgba(255,255,255,0.5); }
.bc-cur { color: white; font-weight: 500; }

.page__titlebar { display: flex; align-items: center; justify-content: space-between; padding: 14px 24px; background: white; border-bottom: 1px solid #E0E0E0; flex-shrink: 0; }
.page__title { font-size: 1.125rem; font-weight: 600; color: #1a1a2e; margin: 0; }
.btn-add { display: flex; align-items: center; gap: 6px; background: #1565C0; color: white; border: none; border-radius: 6px; padding: 8px 16px; font-size: 0.875rem; font-weight: 500; font-family: 'Roboto', sans-serif; cursor: pointer; }
.btn-add:hover { background: #1976D2; }

.page__content { flex: 1; padding: 16px 24px; overflow: hidden; display: flex; flex-direction: column; }

/* ── Card ── */
.tbl-card { background: white; border: 1px solid #E0E0E0; border-radius: 8px; display: flex; flex-direction: column; flex: 1; overflow: hidden; }

/* ── Table wrap — scroll orizontal ── */
.tbl-wrap { flex: 1; overflow: auto; position: relative; }

/* ── Table ── */
.tbl { width: 100%; border-collapse: collapse; }

/* ── THEAD ── */
thead { position: sticky; top: 0; z-index: 100; background: white; isolation: isolate; }

.tbl-head-row th { background: #1565C0; }

.tbl-head-row { background: #1565C0; }
.th {
  background: #1565C0;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.65rem 0.75rem;
  white-space: nowrap;
  text-align: left;
  border-right: 1px solid #1565C0;
  user-select: none;
}
.th--sort { cursor: pointer; }
.th--sort:hover { background: #1251A3; }
.sort-ico { font-size: 10px; opacity: 0.7; margin-left: 4px; }

/* Coloane fixate — header */

/* ── Rând filtre ── */
.tbl-filter-row { background: #F5F7FA; border-bottom: 2px solid #E0E0E0; }
.tbl-filter-row td { background: #F5F7FA; }
.tf { padding: 5px 6px; border-right: 1px solid #E8ECF0; }

.f-input { display: flex; align-items: center; gap: 5px; background: white; border: 1px solid #E0E0E0; border-radius: 5px; padding: 4px 8px; }
.f-input input { border: none; outline: none; font-size: 0.8rem; color: #424242; background: transparent; width: 100%; font-family: 'Roboto', sans-serif; }
.f-ico { color: #9e9e9e; flex-shrink: 0; }
.f-input--date { gap: 3px; font-size: 0.75rem; }
.f-input--date span { color: #9e9e9e; flex-shrink: 0; }

/* Filtre coloane fixate */

/* Dropdown filtre */
.f-dd-wrap { position: relative; display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 5px; cursor: pointer; margin: 0 auto; transition: background 0.15s; }
.f-dd-wrap:hover { background: #E8ECF0; }
.f-dd-wrap--active svg { color: #1565C0 !important; }

.f-dd-menu {
  position: absolute; top: calc(100% + 4px); left: 0;
  background: white; border: 1px solid #E0E0E0; border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12); z-index: 9999;
  min-width: 200px; overflow: hidden;
}
.f-dd-menu--right { left: auto; right: 0; }
.f-dd-title { padding: 8px 12px; font-size: 0.75rem; font-weight: 700; color: #9e9e9e; text-transform: uppercase; background: #FAFAFA; border-bottom: 1px solid #F0F0F0; }
.f-dd-opt { display: flex; align-items: center; gap: 8px; padding: 8px 12px; font-size: 0.8rem; color: #333; cursor: pointer; transition: background 0.12s; }
.f-dd-opt:hover { background: #F5F7FA; }
.f-dd-opt input[type=checkbox] { cursor: pointer; accent-color: #1565C0; }
.f-dd-opt--radio { padding: 9px 12px; }
.f-dd-clear { padding: 7px 12px; font-size: 0.75rem; color: #1565C0; cursor: pointer; border-top: 1px solid #F0F0F0; text-align: center; }
.f-dd-clear:hover { background: #F0F7FF; }

/* Buton clear filtre */
.btn-clear { display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; border: 1px solid #E0E0E0; border-radius: 5px; background: white; cursor: pointer; color: #9e9e9e; margin: 0 auto; transition: all 0.15s; }
.btn-clear:hover { background: #FFEBEE; color: #E53935; border-color: #E53935; }

/* ── TBODY ── */
.td-state { text-align: center; padding: 48px 0; color: #9e9e9e; font-size: 0.875rem; }
.td-state svg { margin: 0 auto 8px; display: block; }

.td-row { border-bottom: 1px solid #E8ECF0; transition: background 0.1s; background: white; }
.td-row:hover { background: #F5F7FA; }
.td-row--alt { background: #FAFAFA; }
.td-row--alt:hover { background: #F0F4F8; }

.td { padding: 8px 10px; font-size: 0.8rem; color: #424242; vertical-align: top; border-right: none; height: 60px; max-height: 60px; }
.td--cpv { }
.td--desc { font-size: 0.7rem; color: #757575; max-width: 200px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; word-break: break-word; }
.td--mu { font-size: 0.8rem; }
.td--date { font-size: 0.75rem; white-space: nowrap; }
.td--clamp { max-width: 160px; }
.td--clamp > span, .td--clamp { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; max-width: 160px; }

.cpv-badge { display: inline-block; background: #E3F2FD; color: #1565C0; padding: 2px 7px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; cursor: default; white-space: nowrap; }

/* Coloane fixate — body */

/* Iconiță stare — centrată vertical în celulă */

/* ── Kebab trigger ── */
.kebab {
  display: flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; border-radius: 6px;
  cursor: pointer; margin: 0 auto;
  transition: background 0.15s;
}
.kebab:hover { background: #F0F0F0; }
.kebab:hover svg { fill: #424242; }

/* ── Kebab menu inline ── */
.kebab-wrap {
  position: relative;
  display: flex; align-items: center; justify-content: center;
}
.kebab-menu {
  position: absolute;
  top: calc(100% + 2px);
  right: 0;
  background: white; border: 1px solid #E0E0E0;
  border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.14);
  min-width: 180px; overflow: hidden;
  font-family: 'Roboto', sans-serif;
  z-index: 500;
}
.kebab-item {
  display: flex; align-items: center; gap: 9px;
  width: 100%; padding: 10px 14px; background: none;
  border: none; cursor: pointer; font-size: 13px;
  font-family: 'Roboto', sans-serif; color: #424242; text-align: left;
  transition: background 0.12s;
}
.kebab-item:hover { background: #F5F7FA; }
.kebab-item--danger { color: #E53935; }
.kebab-item--danger:hover { background: #FFEBEE; }
.kebab-divider { border-top: 1px solid #F0F0F0; margin: 2px 0; }

/* ── Footer ── */
.tbl-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px; border-top: 1px solid #E0E0E0;
  background: white; flex-shrink: 0;
}
.tbl-total { font-size: 0.8rem; color: #757575; }
.tbl-pagination { display: flex; align-items: center; gap: 10px; font-size: 0.8rem; color: #424242; }
.tbl-pp-label { color: #757575; }
.tbl-pp-select { border: 1px solid #E0E0E0; border-radius: 5px; padding: 3px 6px; font-size: 0.8rem; font-family: 'Roboto', sans-serif; cursor: pointer; }
.tbl-pages { color: #9e9e9e; }
.tbl-nav { display: flex; gap: 4px; }
.nav-btn { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border: 1px solid #E0E0E0; border-radius: 5px; background: white; cursor: pointer; transition: all 0.15s; }
.nav-btn:hover:not(:disabled) { background: #F0F7FF; border-color: #1565C0; }
.nav-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── Modals ── */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px; }
.modal-box { background: white; border-radius: 10px; padding: 28px 32px; max-width: 440px; width: 100%; text-align: center; box-shadow: 0 8px 32px rgba(0,0,0,0.18); }
.modal-icon { margin-bottom: 12px; }
.modal-title { font-size: 16px; font-weight: 600; color: #1a1a2e; margin: 0 0 10px; }
.modal-msg { font-size: 14px; color: #616161; line-height: 1.6; margin: 0 0 20px; }
.s-btn { border-radius: 6px; padding: 8px 18px; font-size: 13px; font-weight: 500; font-family: 'Roboto', sans-serif; cursor: pointer; border: none; }
.s-btn--primary { background: #1565C0; color: white; }
.s-btn--primary:hover { background: #1976D2; }
.s-btn--secondary { background: #F5F5F5; color: #424242; }
.s-btn--secondary:hover { background: #EEEEEE; }


/* ── Tooltip custom CSS ── */
[data-tooltip] {
  position: relative;
}
[data-tooltip]::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: #1a1a2e;
  color: white;
  font-size: 12px;
  font-weight: 400;
  font-family: 'Roboto', sans-serif;
  white-space: nowrap;
  padding: 5px 10px;
  border-radius: 5px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s;
  z-index: 99999;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}
[data-tooltip]::before {
  content: '';
  position: absolute;
  bottom: calc(100% + 3px);
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: #1a1a2e;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s;
  z-index: 99999;
}
[data-tooltip]:hover::after,
[data-tooltip]:hover::before {
  opacity: 1;
}


/* ── Bloc sticky stânga (NR + Denumire produs) ── */
.th-fixed-left-block,
.tf-fixed-left-block,
.td-fixed-left-block {
  position: sticky;
  left: 0;
  padding: 0 !important;
}

.th-fixed-left-block { z-index: 102; background: #1565C0; box-shadow: 4px 0 12px rgba(0,0,0,0.12); }
.tf-fixed-left-block { z-index: 102; background: #F5F7FA; box-shadow: 4px 0 8px rgba(0,0,0,0.08); }
.td-fixed-left-block { z-index: 10;  background: white;   box-shadow: 4px 0 8px rgba(0,0,0,0.06); }
.td-fixed-left-block--alt { background: #FAFAFA; }
.td-row:hover .td-fixed-left-block { background: #F5F7FA; }
.td-row--alt:hover .td-fixed-left-block { background: #F0F4F8; }

.fixed-inner-table-left {
  border-collapse: collapse;
  height: 100%;
  width: 272px; /* 52 + 220 */
}
.fixed-inner-table-left tr { height: 100%; }

/* Header stânga */
.fix-th-left { background: #1565C0; text-align: left; padding: 0.65rem 0.75rem; white-space: nowrap; color: white; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
.fix-th-left--nr   { width: 52px; text-align: center; border-right: 1px solid rgba(255,255,255,0.15); }
.fix-th-left--name { width: 220px; cursor: pointer; }
.fix-th-left--name:hover { background: #1251A3; }

/* Filtre stânga */
.fix-tf-left { background: #F5F7FA; padding: 5px 6px; border-right: 1px solid #E8ECF0; vertical-align: middle; }
.fix-tf-left--nr   { width: 52px; }
.fix-tf-left--name { width: 220px; }

/* Date stânga */
.fix-td-left { padding: 8px 10px; font-size: 0.8rem; color: #424242; vertical-align: top; border-right: 1px solid #F5F5F5; }
.fix-td-left--nr   { width: 52px; text-align: center; color: #9e9e9e; font-size: 0.75rem; }
.fix-td-left--name { width: 220px; font-weight: 500; color: #1a1a2e; }
.fix-td-left--name > div { overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; max-height: 2.8em; }

/* ── Bloc sticky dreapta ── */
.th-fixed-block,
.tf-fixed-block,
.td-fixed-block {
  position: sticky;
  right: 0;
  padding: 0 !important;
  z-index: 20;
}

.th-fixed-block { z-index: 102; background: #1565C0; box-shadow: -4px 0 12px rgba(0,0,0,0.15); }
.tf-fixed-block { z-index: 102; background: #F5F7FA; box-shadow: -4px 0 8px rgba(0,0,0,0.08); }
.td-fixed-block { z-index: 10;  background: white;   box-shadow: -4px 0 8px rgba(0,0,0,0.06); overflow: visible !important; }
.td-fixed-block--menu-open { z-index: 9999 !important; }
.td-fixed-block--alt { background: #FAFAFA; }
.td-row:hover .td-fixed-block { background: #F5F7FA; }
.td-row--alt:hover .td-fixed-block { background: #F0F4F8; }

/* Tabel interior pentru blocul sticky */
.fixed-inner-table {
  border-collapse: collapse;
  height: 100%;
  width: 174px; /* 60 + 60 + 54 */
}
.fixed-inner-table tr { height: 100%; }

/* Celule header sticky */
.fix-th { background: #1565C0; text-align: center; border-left: 1px solid rgba(255,255,255,0.15); }
.fix-th--validare { width: 60px; }
.fix-th--stare    { width: 60px; }
.fix-th--actiuni  { width: 54px; }

/* Celule filtre sticky */
.fix-tf { background: #F5F7FA; text-align: center; padding: 5px 4px; border-left: 1px solid #E8ECF0; vertical-align: middle; }
.fix-tf--validare { width: 60px; }
.fix-tf--stare    { width: 60px; }
.fix-tf--actiuni  { width: 54px; }

/* Celule date sticky */
.fix-td { text-align: center; padding: 8px 4px; border-left: 1px solid #F0F0F0; vertical-align: middle; }
.fix-td span { display: flex; align-items: center; justify-content: center; }
.fix-td--validare { width: 60px; }
.fix-td--stare    { width: 60px; }
.fix-td--actiuni  { width: 54px; overflow: visible; position: relative; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
