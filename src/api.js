// ============================================================
// API — Achiziții Publice
// Toate apelurile către backend
// BASE_URL se setează din variabila de mediu VITE_API_URL
// ============================================================

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/'

function getRoleToSend() {
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token') || ''
    if (!token) return '{}'
    const payload = JSON.parse(atob(token.split('.')[1]))
    const roles = payload?.userRoles
    if (!roles || !roles.length) return '{}'
    const activeRoleId = localStorage.getItem('activeRoleId')
    const role = (activeRoleId && roles.find(r => String(r.id) === String(activeRoleId))) || roles[0]
    return JSON.stringify({
      id: role.id,
      institutionId: role.institutionId ?? null,
      departmentId: role.departmentId ?? null,
      role: role.role
    })
  } catch { return '{}' }
}

function headerTypeDefault() {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token') || ''
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
    'conectx-userid-role': getRoleToSend()
  }
}

// ── Auth ──
export const LOGIN = (username, password) =>
  fetch(`${BASE_URL}auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: String(username), password: String(password) })
  }).then(r => r.json())

export const REQUEST_PASSWORD_RESET = (email) =>
  fetch(`${BASE_URL}auth/reset-password/${encodeURIComponent(email)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  })

export const ACTIVATE_ACCOUNT = (data) =>
  fetch(`${BASE_URL}auth/activate-account`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

export const PASSWORD_RESTORE = (data) =>
  fetch(`${BASE_URL}auth/restore-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

export const CHECK_PASSWORD_TOKEN = (data) =>
  fetch(`${BASE_URL}auth/check-password-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

// ── Products / Catalog ──
export const PRODUCTS_PAGINATED = (pageNumber = 1, recordsPerPage = 15, ...search) =>
  fetch(`${BASE_URL}products/?recordsPerPage=${recordsPerPage}&pageNumber=${pageNumber}` +
    (search.slice(-1)[0] ? `&${search.slice(-1)}` : ''), { headers: headerTypeDefault() })

export const PRODUCTS_ADD = (data) =>
  fetch(`${BASE_URL}products/`, { method: 'POST', headers: headerTypeDefault(), body: JSON.stringify(data) })

export const PRODUCTS_MODIFY = (id, data) =>
  fetch(`${BASE_URL}products/${id}`, { method: 'PATCH', headers: headerTypeDefault(), body: JSON.stringify(data) })

export const PRODUCTS_CAN_EDIT_CPV = (id) =>
  fetch(`${BASE_URL}products/canpatch/${id}`, { headers: headerTypeDefault() })

export const PRODUCTS_ONCE = (id) =>
  fetch(`${BASE_URL}products/${id}`, { headers: headerTypeDefault() })

export const PRODUCT_VERSIONS = (id) =>
  fetch(`${BASE_URL}products/${id}/versions`, { headers: headerTypeDefault() })

// ── CPV Categories ──
export const CPV_CATEGORY_PAGINATED = (pageNumber = 1, recordsPerPage = 50, cpvType, ...search) =>
  fetch(`${BASE_URL}cpv-categories/?recordsPerPage=${recordsPerPage}&pageNumber=${pageNumber}` +
    (cpvType ? `&cpvType=${cpvType}` : '') +
    (search.slice(-1)[0] ? `&${search.slice(-1)}` : ''), { headers: headerTypeDefault() })

// ── Institutions ──
export const INSTITUTIONS_PAGINATED = (pageNumber = 1, recordsPerPage = 15, ...search) =>
  fetch(`${BASE_URL}institutions/?recordsPerPage=${recordsPerPage}&pageNumber=${pageNumber}` +
    (search.slice(-1)[0] ? `&${search.slice(-1)}` : ''), { headers: headerTypeDefault() })

export const INSTITUTION_ADD = (data) =>
  fetch(`${BASE_URL}institutions/`, { method: 'POST', headers: headerTypeDefault(), body: JSON.stringify(data) })

export const INSTITUTION_MODIFY = (id, data) =>
  fetch(`${BASE_URL}institutions/${id}`, { method: 'PATCH', headers: headerTypeDefault(), body: JSON.stringify(data) })

export const INSTITUTION_DELETE = (id) =>
  fetch(`${BASE_URL}institutions/${id}`, { method: 'DELETE', headers: headerTypeDefault() })

export const INSTITUTION_UPLOAD = (id, formData) =>
  fetch(`${BASE_URL}institutions/upload/${id}`, { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }, body: formData })

export const INSTITUTION_DOWNLOAD = (id) =>
  fetch(`${BASE_URL}institutions/download/${id}`, { headers: headerTypeDefault() }).then(r => r.blob())

export const INSTITUTION_INFO = (data) =>
  fetch(`${BASE_URL}institutions/sync`, { method: 'PATCH', headers: headerTypeDefault(), body: JSON.stringify(data) })

export const INSTITUTION_ONCE = (id) =>
  fetch(`${BASE_URL}institutions/${id}`, { headers: headerTypeDefault() })

// ── Departments ──
export const DEPARTMENTS_PAGINATED = (pageNumber = 1, recordsPerPage = 15, ...search) =>
  fetch(`${BASE_URL}departments/?recordsPerPage=${recordsPerPage}&pageNumber=${pageNumber}` +
    (search.slice(-1)[0] ? `&${search.slice(-1)}` : ''), { headers: headerTypeDefault() })

export const DEPARTMENT_DELETE = (id) =>
  fetch(`${BASE_URL}departments/${id}`, { method: 'DELETE', headers: headerTypeDefault() })

export const IMPORT_DEPARTMENTS = (query) =>
  fetch(`${BASE_URL}departments/import${query || ''}`, { headers: headerTypeDefault() })

export const SAVE_DEPARTMENTS = (data) =>
  fetch(`${BASE_URL}departments/save`, { method: 'POST', headers: headerTypeDefault(), body: JSON.stringify(data) })

// ── Users ──
export const USERS_PAGINATED = (pageNumber = 1, recordsPerPage = 15, ...search) =>
  fetch(`${BASE_URL}users/?recordsPerPage=${recordsPerPage}&pageNumber=${pageNumber}` +
    (search.slice(-1)[0] ? `&${search.slice(-1)}` : ''), { headers: headerTypeDefault() })

export const USER_MODIFY = (id, data) =>
  fetch(`${BASE_URL}users/${id}`, { method: 'PATCH', headers: headerTypeDefault(), body: JSON.stringify(data) })

export const USER_DELETE = (id) =>
  fetch(`${BASE_URL}users/${id}`, { method: 'DELETE', headers: headerTypeDefault() })

export const IMPORT_USERS = (query) =>
  fetch(`${BASE_URL}users/import${query || ''}`, { headers: headerTypeDefault() })

export const SAVE_USERS = (data) =>
  fetch(`${BASE_URL}users/save`, { method: 'POST', headers: headerTypeDefault(), body: JSON.stringify(data) })

export const USER_SYNC = (data) =>
  fetch(`${BASE_URL}users/sync`, { method: 'POST', headers: headerTypeDefault(), body: JSON.stringify(data) })

export const RESEND_ACTIVATE_ACCOUNT = (uuid) =>
  fetch(`${BASE_URL}users/resend-activation/${uuid}`, { method: 'PATCH', headers: headerTypeDefault() })

// ── Roles ──
export const USER_ROLES_PAGINATED = (pageNumber = 1, recordsPerPage = 15, ...search) =>
  fetch(`${BASE_URL}user-roles/?recordsPerPage=${recordsPerPage}&pageNumber=${pageNumber}` +
    (search.slice(-1)[0] ? `&${search.slice(-1)}` : ''), { headers: headerTypeDefault() })

export const USER_ROLE_ADD = (data) =>
  fetch(`${BASE_URL}user-roles/`, { method: 'POST', headers: headerTypeDefault(), body: JSON.stringify(data) })

export const USER_ROLE_DELETE = (id) =>
  fetch(`${BASE_URL}user-roles/${id}`, { method: 'DELETE', headers: headerTypeDefault() })

// ── Nomenclatoare ──
const nomenclatorFactory = (endpoint) => ({
  get: (pageNumber = 1, recordsPerPage = 500, ...search) =>
    fetch(`${BASE_URL}${endpoint}/?recordsPerPage=${recordsPerPage}&pageNumber=${pageNumber}` +
      (search.slice(-1)[0] ? `&${search.slice(-1)}` : ''), { headers: headerTypeDefault() }),
  add: (data) =>
    fetch(`${BASE_URL}${endpoint}/`, { method: 'POST', headers: headerTypeDefault(), body: JSON.stringify(data) }),
  modify: (id, data) =>
    fetch(`${BASE_URL}${endpoint}/${id}`, { method: 'PATCH', headers: headerTypeDefault(), body: JSON.stringify(data) }),
  edit: (id, data) =>
    fetch(`${BASE_URL}${endpoint}/${id}`, { method: 'PATCH', headers: headerTypeDefault(), body: JSON.stringify(data) }),
  delete: (id) =>
    fetch(`${BASE_URL}${endpoint}/${id}`, { method: 'DELETE', headers: headerTypeDefault() })
})

export const BUDGET_CLASSIFICATION    = nomenclatorFactory('budget-clasification')
export const CPV_CATEGORIES           = nomenclatorFactory('cpv-categories')
export const REGISTRU_PRAGURI         = nomenclatorFactory('registrul-pragurilor')
export const MEASUREMENT_UNITS        = nomenclatorFactory('measurement-units')
export const FINANCING_SOURCES        = nomenclatorFactory('projectfinsource')
export const CONTRACT_TYPES           = nomenclatorFactory('contracttypes')
export const PROCEDURE_TYPES          = nomenclatorFactory('procedure-types')
export const ORG_STRUCTURE_TYPES      = nomenclatorFactory('organizational-structure-type')
export const INSTITUTION_TYPE         = nomenclatorFactory('institution-type')
export const CREDIT_ORDERER_TYPE      = nomenclatorFactory('credit-orderer-type')
export const ACQUISITION_CONFIG       = nomenclatorFactory('acquisition-config')

// ── Needs / Propuneri ──
export const NEEDS_PAGINATED = (pageNumber = 1, recordsPerPage = 15, ...search) =>
  fetch(`${BASE_URL}needs/?recordsPerPage=${recordsPerPage}&pageNumber=${pageNumber}` +
    (search.slice(-1)[0] ? `&${search.slice(-1)}` : ''), { headers: headerTypeDefault() })

export const NEED_ADD = (data) =>
  fetch(`${BASE_URL}needs/`, { method: 'POST', headers: headerTypeDefault(), body: JSON.stringify(data) })

export const NEED_MODIFY = (id, data) =>
  fetch(`${BASE_URL}needs/${id}`, { method: 'PATCH', headers: headerTypeDefault(), body: JSON.stringify(data) })

export const NEED_DELETE = (id) =>
  fetch(`${BASE_URL}needs/${id}`, { method: 'DELETE', headers: headerTypeDefault() })

// ── Aliases și exporturi lipsă ──

export const BUGETARE = BUDGET_CLASSIFICATION
export const CONTRACT = CONTRACT_TYPES
export const FINANCING = FINANCING_SOURCES
export const ORGANIZATIONAL_STRUCTURE_TYPE = ORG_STRUCTURE_TYPES
export const REGISTRU_PAGINATED = (p=1,r=15,...s) => REGISTRU_PRAGURI.get(p,r,...s)
export const REGISTRU_ADD = (data) => REGISTRU_PRAGURI.add(data)
export const REGISTRU_MODIFY = (id,data) => REGISTRU_PRAGURI.modify(id,data)
export const REGISTRU_DELETE = (id) => REGISTRU_PRAGURI.delete(id)
export const PROCEDURE_TYPE_PAGINATED = (p=1,r=15,...s) => PROCEDURE_TYPES.get(p,r,...s)
export const PROCEDURE_TYPE_ADD = (data) => PROCEDURE_TYPES.add(data)
export const PROCEDURE_TYPE_MODIFY = (id,data) => PROCEDURE_TYPES.modify(id,data)
export const PROCEDURE_TYPE_DELETE = (id) => PROCEDURE_TYPES.delete(id)
export const CPV_CATEGORY_ADD = (data) => CPV_CATEGORIES.add(data)
export const CPV_CATEGORY_MODIFY = (id,data) => CPV_CATEGORIES.modify(id,data)
export const CPV_CATEGORY_DELETE = (id) => CPV_CATEGORIES.delete(id)
export const USERS_ROLES_PAGINATED = (pageNumber = 1, recordsPerPage = 15, ...search) =>
  fetch(`${BASE_URL}user-roles/institution?recordsPerPage=${recordsPerPage}&pageNumber=${pageNumber}` +
    (search.slice(-1)[0] ? `&${search.slice(-1)}` : ''), { headers: headerTypeDefault() })
export const USERS_CHECK_ROLE = (id) =>
  fetch(`${BASE_URL}users/check-role/${id}`, { headers: headerTypeDefault() })
export const USERS_ONCE = (id) =>
  fetch(`${BASE_URL}users/${id}`, { headers: headerTypeDefault() })
export const CURRENCY = () =>
  fetch(`${BASE_URL}currency/`, { headers: headerTypeDefault() })
export const ANNUAL_INSTITUTION_OBJECTIVES = {
  get: (p=1,r=15,...s) => fetch(`${BASE_URL}annual-objectives/?recordsPerPage=${r}&pageNumber=${p}` + (s.slice(-1)[0] ? `&${s.slice(-1)}` : ''), { headers: headerTypeDefault() }),
  add: (data) => fetch(`${BASE_URL}annual-objectives/`, { method: 'POST', headers: headerTypeDefault(), body: JSON.stringify(data) }),
  modify: (id,data) => fetch(`${BASE_URL}annual-objectives/${id}`, { method: 'PATCH', headers: headerTypeDefault(), body: JSON.stringify(data) }),
  delete: (id) => fetch(`${BASE_URL}annual-objectives/${id}`, { method: 'DELETE', headers: headerTypeDefault() })
}
export const INSTITUTION_OBJECTIVES = {
  get: (p=1,r=15,...s) => fetch(`${BASE_URL}institution-objectives/?recordsPerPage=${r}&pageNumber=${p}` + (s.slice(-1)[0] ? `&${s.slice(-1)}` : ''), { headers: headerTypeDefault() }),
  add: (data) => fetch(`${BASE_URL}institution-objectives/`, { method: 'POST', headers: headerTypeDefault(), body: JSON.stringify(data) }),
  modify: (id,data) => fetch(`${BASE_URL}institution-objectives/${id}`, { method: 'PATCH', headers: headerTypeDefault(), body: JSON.stringify(data) }),
  delete: (id) => fetch(`${BASE_URL}institution-objectives/${id}`, { method: 'DELETE', headers: headerTypeDefault() })
}

// ── User roles aliases ──
export const USERS_ROLES = (uuid) =>
  fetch(`${BASE_URL}user-roles/institution?eq=user.uuid,${uuid}&recordsPerPage=100&pageNumber=1`, { headers: headerTypeDefault() })
export const USERS_ADD_ROLE = USER_ROLE_ADD
export const USERS_DELETE_ROLE = USER_ROLE_DELETE

export const VERIFY_DELETE_ROLE = (id) =>
  fetch(`${BASE_URL}user-roles/verify-delete-role/${id}`, { headers: headerTypeDefault() })

export const ACTIVATE_ROLE = (id) =>
  fetch(`${BASE_URL}user-roles/activate/${id}`, { method: 'PATCH', headers: headerTypeDefault() })

export const EDIT_ROLE = (id, data) =>
  fetch(`${BASE_URL}user-roles/${id}`, { method: 'PATCH', headers: headerTypeDefault(), body: JSON.stringify(data) })

export const RESEND_ROLE = (id) =>
  fetch(`${BASE_URL}user-roles/resendemail/${id}`, { method: 'POST', headers: headerTypeDefault() })

// ── Measurement Units aliases ──
export const MEASUREMENT_UNIT_PAGINATED = (p=1,r=15,...s) => MEASUREMENT_UNITS.get(p,r,...s)
export const MEASUREMENT_UNIT_ADD = (data) => MEASUREMENT_UNITS.add(data)
export const MEASUREMENT_UNIT_MODIFY = (id,data) => MEASUREMENT_UNITS.modify(id,data)
export const MEASUREMENT_UNIT_DELETE = (id) => MEASUREMENT_UNITS.delete(id)

// ── Already exported: CPV_CATEGORY_PAGINATED, CPV_CATEGORY_ADD, CPV_CATEGORY_MODIFY, CPV_CATEGORY_DELETE ──

export const ACQUISITION_TYPES = {
  get: (p=1,r=15,...s) => fetch(`${BASE_URL}acquisition-types/?recordsPerPage=${r}&pageNumber=${p}` + (s.slice(-1)[0] ? `&${s.slice(-1)}` : ''), { headers: headerTypeDefault() }),
  add: (data) => fetch(`${BASE_URL}acquisition-types/`, { method: 'POST', headers: headerTypeDefault(), body: JSON.stringify(data) }),
  modify: (id,data) => fetch(`${BASE_URL}acquisition-types/${id}`, { method: 'PATCH', headers: headerTypeDefault(), body: JSON.stringify(data) }),
  delete: (id) => fetch(`${BASE_URL}acquisition-types/${id}`, { method: 'DELETE', headers: headerTypeDefault() })
}

// ── Needs / Propuneri de nevoi — exporturi complete ──

export const NEEDS_MODIFY_FORMDATA = (id, data) =>
  fetch(`${BASE_URL}needs/${id}`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }, body: data })

export const NEED_CANCEL = (id) =>
  fetch(`${BASE_URL}needs/cancel/${id}`, { method: 'PATCH', headers: headerTypeDefault() })

export const NEEDS_CONEXE = (p=1,r=15,...s) =>
  fetch(`${BASE_URL}needs/conexe/?recordsPerPage=${r}&pageNumber=${p}` + (s.slice(-1)[0] ? `&${s.slice(-1)}` : ''), { headers: headerTypeDefault() })

export const NEEDS_FROM_CONEXED = (id) =>
  fetch(`${BASE_URL}needs/from-conexed/${id}`, { headers: headerTypeDefault() })

export const NEEDS_AVIZO = (p=1,r=15,...s) =>
  fetch(`${BASE_URL}needs/avizo/?recordsPerPage=${r}&pageNumber=${p}` + (s.slice(-1)[0] ? `&${s.slice(-1)}` : ''), { headers: headerTypeDefault() })

export const NEEDS_AVIZO_MODIFY = (id, data) =>
  fetch(`${BASE_URL}needs/avizo/${id}`, { method: 'PATCH', headers: headerTypeDefault(), body: JSON.stringify(data) })

export const NEEDS_CANCEL_AVIZO = (id) =>
  fetch(`${BASE_URL}needs/cancel-avizo/${id}`, { method: 'PATCH', headers: headerTypeDefault() })

export const NEEDS_AVIZO_TYPE = () =>
  fetch(`${BASE_URL}needs/avizo-type/`, { headers: headerTypeDefault() })

export const REFERENCE_ADD = (data) =>
  fetch(`${BASE_URL}references/`, { method: 'POST', headers: headerTypeDefault(), body: JSON.stringify(data) })

export const NEEDS_REMOVE_CONNECTED = (id) =>
  fetch(`${BASE_URL}needs/remove-connected/${id}`, { method: 'PATCH', headers: headerTypeDefault() })

export const PRODUCTS_SIMPLE = (p=1,r=50,...s) =>
  fetch(`${BASE_URL}products/simple/?recordsPerPage=${r}&pageNumber=${p}` + (s.slice(-1)[0] ? `&${s.slice(-1)}` : ''), { headers: headerTypeDefault() })

// NEEDS_ADD — trimite FormData (cu fișiere atașate) — diferit de NEED_ADD care trimite JSON
export const NEEDS_ADD = (data) =>
  fetch(`${BASE_URL}needs/`, { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }, body: data })

export const NEEDS_DESCRIPTION = (id) =>
  fetch(`${BASE_URL}needs/description/${id}`, { headers: headerTypeDefault() })

export const USERS_ORIGIN = () =>
  fetch(`${BASE_URL}users/origin/`, { headers: headerTypeDefault() })

// ── INSTITUTION alias (folosit în Needs.vue, NeedsAddModal.vue) ──
export const INSTITUTION = INSTITUTION_ONCE

// ── References / Referate de necesitate ──
export const REFERENCE_ONCE = (id) =>
  fetch(`${BASE_URL}references/${id}`, { headers: headerTypeDefault() })

export const REFERENCE_MODIFY = (id, data) =>
  fetch(`${BASE_URL}references/${id}`, { method: 'PATCH', headers: headerTypeDefault(), body: JSON.stringify(data) })

export const REFERENCE_CHANGE_STATUS = (id, data) =>
  fetch(`${BASE_URL}references/status/${id}`, { method: 'PATCH', headers: headerTypeDefault(), body: JSON.stringify(data) })

export const REFERENCE_SAVE_PDF = (id) =>
  fetch(`${BASE_URL}references/save-pdf/${id}`, { method: 'POST', headers: headerTypeDefault() })

export const REFERENCE_REQUEST_COMPLETE_CENTRALIZATION = (id, data) =>
  fetch(`${BASE_URL}references/request-complete/${id}`, { method: 'PATCH', headers: headerTypeDefault(), body: JSON.stringify(data) })

export const REFERENCE_COMPLETE_CENTRALIZATION = (id, data) =>
  fetch(`${BASE_URL}references/complete/${id}`, { method: 'PATCH', headers: headerTypeDefault(), body: JSON.stringify(data) })

// ── PAAP ──
export const PAAP_GET = (pageNumber = 1, recordsPerPage = 500, ...search) =>
  fetch(`${BASE_URL}paap?recordsPerPage=${recordsPerPage}&pageNumber=${pageNumber}` +
    (search.slice(-1)[0] ? `&${search.slice(-1)}` : ''), { headers: headerTypeDefault() })

export const PAAP_GET_ONE = (id) =>
  fetch(`${BASE_URL}paap/${id}`, { headers: headerTypeDefault() })

export const PAAP_GET_PDF = (id) =>
  fetch(`${BASE_URL}paap/pdf/${id}`, { headers: headerTypeDefault() })

export const PAAP_REQUEST_APPROVE = (id) =>
  fetch(`${BASE_URL}paap/approve/${id}`, { method: 'PATCH', headers: headerTypeDefault() })

export const PAAP_APPROVE = (id, data) =>
  fetch(`${BASE_URL}paap/status/${id}`, { method: 'PATCH', headers: headerTypeDefault(), body: JSON.stringify(data) })

export const PAAP_CHECK_APPROVED = (id) =>
  fetch(`${BASE_URL}paap/check-approved/${id}`, { method: 'PATCH', headers: headerTypeDefault() })

export const PAAP_DELETE = (id) =>
  fetch(`${BASE_URL}paap/${id}`, { method: 'DELETE', headers: headerTypeDefault() })

export const PAAP_IMPORT = (formData) =>
  fetch(`${BASE_URL}paap/import`, { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }, body: formData })

// ── PAAP Centralizare ──
export const PAAP_CENTRALIZATION_GET_PAGINATED = (pageNumber = 1, recordsPerPage = 500, filter = '') =>
  fetch(`${BASE_URL}paap-centralization?recordsPerPage=${recordsPerPage}&pageNumber=${pageNumber}${filter ? `&${filter}` : ''}`,
    { headers: headerTypeDefault() })

export const PAAP_CENTRALIZATION_GET_REFS = (pageNumber = 1, recordsPerPage = 100, centralizationId) =>
  fetch(`${BASE_URL}paap-centralization/reference/${centralizationId}?recordsPerPage=${recordsPerPage}&pageNumber=${pageNumber}`,
    { headers: headerTypeDefault() })

export const PAAP_CENTRALIZATION_EDIT = (id, data) =>
  fetch(`${BASE_URL}paap-centralization/${id}`, { method: 'PATCH', headers: headerTypeDefault(), body: JSON.stringify(data) })

// ── Atribuire ──
export const GET_PAAP_CENTRALIZATION = (id) =>
  fetch(`${BASE_URL}paap-centralization/${id}`, { headers: headerTypeDefault() })

export const PROCEDURE_TYPE_MENU = () =>
  fetch(`${BASE_URL}procedure-types/menu`, { headers: headerTypeDefault() })

export const ACQUISITIONS_GET = (pageNumber = 1, recordsPerPage = 15, filter = '') =>
  fetch(`${BASE_URL}acquisitions/?recordsPerPage=${recordsPerPage}&pageNumber=${pageNumber}${filter ? `&${filter}` : ''}`, { headers: headerTypeDefault() })

export const ACQUISITIONS_GET_ONE = (id) =>
  fetch(`${BASE_URL}acquisitions/${id}`, { headers: headerTypeDefault() })

export const ACQUISITIONS_ADD = (data) =>
  fetch(`${BASE_URL}acquisitions/`, { method: 'POST', headers: headerTypeDefault(), body: JSON.stringify(data) })

export const ACQUISITIONS_EDIT = (id, data) =>
  fetch(`${BASE_URL}acquisitions/${id}`, { method: 'PATCH', headers: headerTypeDefault(), body: JSON.stringify(data) })

export const ACQUISITIONS_DELETE = (id) =>
  fetch(`${BASE_URL}acquisitions/${id}`, { method: 'DELETE', headers: headerTypeDefault() })

export const ACQUISITIONS_GENERATE = (id) =>
  fetch(`${BASE_URL}acquisitions/generate/${id}`, { method: 'PATCH', headers: headerTypeDefault() })

export const ACQUISITIONS_GET_PDF = (id) =>
  fetch(`${BASE_URL}acquisitions/pdf/${id}`, { headers: headerTypeDefault() })

export const ACQUISITIONS_REQUEST_APPROVE = (id) =>
  fetch(`${BASE_URL}acquisitions/request-approve/${id}`, { method: 'PATCH', headers: headerTypeDefault() })

export const ACQUISITIONS_APPROVE = (id, data) =>
  fetch(`${BASE_URL}acquisitions/approve/${id}`, { method: 'PATCH', headers: headerTypeDefault(), body: JSON.stringify(data) })

export const ACQUISITIONS_CLOSE = (id, data) =>
  fetch(`${BASE_URL}acquisitions/close/${id}`, { method: 'PATCH', headers: headerTypeDefault(), body: JSON.stringify(data) })

export const ACQUISITIONS_CHECK_APPROVED = (id) =>
  fetch(`${BASE_URL}acquisitions/check-approved/${id}`, { method: 'PATCH', headers: headerTypeDefault() })

export const VERBAL_PROCESS_GET = (pageNumber = 1, recordsPerPage = 15, filter = '') =>
  fetch(`${BASE_URL}verbal-process/?recordsPerPage=${recordsPerPage}&pageNumber=${pageNumber}${filter ? `&${filter}` : ''}`, { headers: headerTypeDefault() })

export const VERBAL_PROCESS_ADD = (data) =>
  fetch(`${BASE_URL}verbal-process/`, { method: 'POST', headers: headerTypeDefault(), body: JSON.stringify(data) })

export const VERBAL_PROCESS_EDIT = (id, data) =>
  fetch(`${BASE_URL}verbal-process/${id}`, { method: 'PATCH', headers: headerTypeDefault(), body: JSON.stringify(data) })

export const VERBAL_PROCESS_DELETE = (id) =>
  fetch(`${BASE_URL}verbal-process/${id}`, { method: 'DELETE', headers: headerTypeDefault() })

export const VERBAL_PROCESS_GET_PDF = (id) =>
  fetch(`${BASE_URL}verbal-process/pdf/${id}`, { headers: headerTypeDefault() })

export const VERBAL_PROCESS_REQUEST_APPROVE = (id) =>
  fetch(`${BASE_URL}verbal-process/request-approve/${id}`, { method: 'PATCH', headers: headerTypeDefault() })

export const VERBAL_PROCESS_APPROVE = (id, data) =>
  fetch(`${BASE_URL}verbal-process/approve/${id}`, { method: 'PATCH', headers: headerTypeDefault(), body: JSON.stringify(data) })

export const VERBAL_PROCESS_CHECK_APPROVED = (id) =>
  fetch(`${BASE_URL}verbal-process/check-approved/${id}`, { method: 'PATCH', headers: headerTypeDefault() })

export const ANNOUNCEMENT_GET = (pageNumber = 1, recordsPerPage = 15, filter = '') =>
  fetch(`${BASE_URL}announcements/?recordsPerPage=${recordsPerPage}&pageNumber=${pageNumber}${filter ? `&${filter}` : ''}`, { headers: headerTypeDefault() })

export const ANNOUNCEMENT_ADD = (data) =>
  fetch(`${BASE_URL}announcements/`, { method: 'POST', headers: headerTypeDefault(), body: JSON.stringify(data) })

export const ANNOUNCEMENT_EDIT = (id, data) =>
  fetch(`${BASE_URL}announcements/${id}`, { method: 'PATCH', headers: headerTypeDefault(), body: JSON.stringify(data) })

export const ANNOUNCEMENT_DELETE = (id) =>
  fetch(`${BASE_URL}announcements/${id}`, { method: 'DELETE', headers: headerTypeDefault() })

export const ANNOUNCEMENT_GET_PDF = (id) =>
  fetch(`${BASE_URL}announcements/pdf/${id}`, { headers: headerTypeDefault() })

export const ANNOUNCEMENT_REQUEST_APPROVE = (id) =>
  fetch(`${BASE_URL}announcements/request-approve/${id}`, { method: 'PATCH', headers: headerTypeDefault() })

export const ANNOUNCEMENT_APPROVE = (id, data) =>
  fetch(`${BASE_URL}announcements/approve/${id}`, { method: 'PATCH', headers: headerTypeDefault(), body: JSON.stringify(data) })

export const ANNOUNCEMENT_CHECK_APPROVED = (id) =>
  fetch(`${BASE_URL}announcements/check-approved/${id}`, { method: 'PATCH', headers: headerTypeDefault() })

export const ASSIGNMENTS_REFERENCE_PAGINATED = (pageNumber = 1, recordsPerPage = 15, filter = '') =>
  fetch(`${BASE_URL}referat-necesitate/assignment?recordsPerPage=${recordsPerPage}&pageNumber=${pageNumber}${filter ? `&${filter}` : ''}`, { headers: headerTypeDefault() })

export const PROCEDURE_DOCUMENTS_CREATE = (data) =>
  fetch(`${BASE_URL}procedure-document`, { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }, body: data })

export const PROCEDURE_DOCUMENTS_ADD = (id, data) =>
  fetch(`${BASE_URL}procedure-document/${id}/documents`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }, body: data })

export const PROCEDURE_DOCUMENTS_CLOSE = (id) =>
  fetch(`${BASE_URL}procedure-document/close/${id}`, { method: 'PATCH', headers: headerTypeDefault() })

// ── AI Proxy ──────────────────────────────────────────────────────────────────
// Apelul merge la backend NestJS (src/ai/ai.controller.ts) care face
// proxy către api.anthropic.com — evită blocarea CORS din browser.
// Backend-ul are nevoie de ANTHROPIC_API_KEY în fișierul .env
export const AI_MESSAGES = (body) =>
  fetch(`${BASE_URL}ai/messages`, {
    method: 'POST',
    headers: headerTypeDefault(),
    body: JSON.stringify(body),
  })
