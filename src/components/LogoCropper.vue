<template>
  <div class="logo-cropper">
    <!-- Stare: vizualizare imagine existenta -->
    <div v-if="!editing" class="logo-view">
      <div class="logo-preview-box" @click="isSuperadmin && startEdit()">
        <img v-if="modelValue" :src="modelValue" alt="Logo" class="logo-img" />
        <div v-else class="logo-placeholder">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#E0E0E0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        </div>
        <div v-if="isSuperadmin" class="logo-overlay">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          {{ modelValue ? 'Schimbă poza' : 'Adaugă poză' }}
        </div>
      </div>
      <div v-if="isSuperadmin" class="logo-hint">Max 2MB · .jpg, .jpeg, .png</div>
    </div>

    <!-- Stare: editare cu cropper -->
    <div v-else class="logo-edit">
      <div class="cropper-box">
        <Cropper
          ref="cropperRef"
          class="cropper"
          :src="rawImage"
          image-restriction="stencil"
          :stencil-props="{ movable: false, scalable: false, aspectRatio: 1 }"
          :canvas="true"
          :debounce="false"
          :min-width="100"
          :min-height="100"
          @change="onCropChange"
        />
      </div>

      <!-- Controale -->
      <div class="cropper-controls">
        <button class="ctrl-btn" title="Rotire stânga" @click="rotate(-90)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4"/></svg>
        </button>
        <button class="ctrl-btn" title="Rotire dreapta" @click="rotate(90)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.49-4"/></svg>
        </button>
        <button class="ctrl-btn" title="Reset" @click="resetCrop">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>
        </button>
        <input type="range" class="zoom-slider" min="0" max="1" step="0.01" v-model.number="zoom" @input="onZoom" />
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
      </div>

      <!-- Butoane actiune -->
      <div class="cropper-actions">
        <button class="btn-save" @click="saveCrop">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          Salvează poza
        </button>
        <button class="btn-change" @click="triggerFile">Schimbă poza</button>
        <button class="btn-cancel" @click="cancelEdit">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="cropper-hint">
        După selectarea pozei dvs. puteți să o mutați, rotiți sau micșorați/măriți.<br/>
        Dimensiunea maximă este de 2Mb. Extensii permise: .jpg, .jpeg, .png
      </div>
    </div>

    <input ref="fileInput" type="file" accept=".jpg,.jpeg,.png" style="display:none" @change="onFileChange" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

const props = defineProps({
  modelValue: { type: String, default: '' },
  isSuperadmin: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue', 'save'])

const editing    = ref(false)
const rawImage   = ref('')
const croppedB64 = ref('')
const zoom       = ref(0)
const cropperRef = ref(null)
const fileInput  = ref(null)

function startEdit() {
  if (props.modelValue) rawImage.value = props.modelValue
  editing.value = true
}

function triggerFile() {
  fileInput.value?.click()
}

function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  const allowed = ['image/png','image/jpg','image/jpeg']
  if (!allowed.includes(file.type)) { alert('Extensie nepermisă'); return }
  if (file.size > 2 * 1024 * 1024) { alert('Dimensiune maximă 2MB depășită'); return }
  const reader = new FileReader()
  reader.onload = ev => {
    rawImage.value = ev.target.result
    editing.value = true
    zoom.value = 0
  }
  reader.readAsDataURL(file)
  e.target.value = ''
}

function onCropChange({ canvas }) {
  croppedB64.value = canvas?.toDataURL() || ''

  // Actualizam zoom din cropper
  const c = cropperRef.value
  if (c) {
    const { coordinates, imageSize, sizeRestrictions } = c
    if (!coordinates || !imageSize) return
    if (imageSize.height > imageSize.width) {
      zoom.value = (imageSize.height - coordinates.height) / (imageSize.height - (sizeRestrictions?.minHeight || 100))
    } else {
      zoom.value = (imageSize.width - coordinates.width) / (imageSize.width - (sizeRestrictions?.minWidth || 100))
    }
  }
}

function onZoom() {
  const c = cropperRef.value
  if (!c) return
  const { imageSize, sizeRestrictions } = c
  if (!imageSize) return
  if (imageSize.height < imageSize.width) {
    const minH = sizeRestrictions?.minHeight || 100
    const imgH = imageSize.height
    const oldZoom = zoom.value
    c.zoom((imgH - oldZoom * (imgH - minH)) / (imgH - zoom.value * (imgH - minH)) || 1)
  } else {
    const minW = sizeRestrictions?.minWidth || 100
    const imgW = imageSize.width
    c.zoom((imgW - zoom.value * (imgW - minW)) / (imgW - zoom.value * (imgW - minW)) || 1)
  }
}

function rotate(deg) { cropperRef.value?.rotate(deg) }
function resetCrop() {
  cropperRef.value?.refresh()
  cropperRef.value?.reset()
  zoom.value = 0
}

function saveCrop() {
  if (!croppedB64.value) return
  emit('update:modelValue', croppedB64.value)
  emit('save', croppedB64.value)
  editing.value = false
}

function cancelEdit() {
  editing.value = false
  rawImage.value = ''
  zoom.value = 0
}
</script>

<style scoped>
.logo-cropper { display: flex; flex-direction: column; gap: 8px; }

/* View mode */
.logo-preview-box {
  width: 180px; height: 180px;
  border: 2px dashed #E0E0E0; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden; position: relative; cursor: pointer;
  background: #FAFAFA; transition: border-color 0.2s;
}
.logo-preview-box:hover { border-color: #1565C0; }
.logo-img { width: 100%; height: 100%; object-fit: contain; }
.logo-placeholder { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; }
.logo-overlay {
  position: absolute; inset: 0;
  background: rgba(21,101,192,0.7);
  color: white; font-size: 13px; font-weight: 500;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
  opacity: 0; transition: opacity 0.2s;
}
.logo-preview-box:hover .logo-overlay { opacity: 1; }
.logo-hint { font-size: 11px; color: #9e9e9e; }

/* Edit mode */
.logo-edit { display: flex; flex-direction: column; gap: 10px; max-width: 500px; }
.cropper-box { width: 300px; height: 300px; background: #1a1a1a; border-radius: 6px; overflow: hidden; }
.cropper { width: 100%; height: 100%; }

/* Controls */
.cropper-controls {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 10px; background: #F5F7FA; border-radius: 6px; width: fit-content;
}
.ctrl-btn {
  background: none; border: none; cursor: pointer; color: #424242;
  width: 28px; height: 28px; border-radius: 5px;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.ctrl-btn:hover { background: #E3F2FD; color: #1565C0; }
.zoom-slider { width: 100px; accent-color: #1565C0; }

/* Actions */
.cropper-actions { display: flex; align-items: center; gap: 8px; }
.btn-save {
  display: flex; align-items: center; gap: 6px;
  background: #2E7D32; color: white; border: none;
  padding: 8px 16px; border-radius: 6px; font-size: 13px;
  font-family: 'Roboto', sans-serif; cursor: pointer; font-weight: 500;
  transition: background 0.15s;
}
.btn-save:hover { background: #388E3C; }
.btn-change {
  background: white; color: #424242;
  border: 1px solid #E0E0E0; padding: 8px 16px;
  border-radius: 6px; font-size: 13px;
  font-family: 'Roboto', sans-serif; cursor: pointer;
  transition: background 0.15s;
}
.btn-change:hover { background: #F5F5F5; }
.btn-cancel {
  display: flex; align-items: center; justify-content: center;
  background: #E53935; color: white; border: none;
  width: 34px; height: 34px; border-radius: 6px; cursor: pointer;
  transition: background 0.15s;
}
.btn-cancel:hover { background: #C62828; }
.cropper-hint { font-size: 12px; color: #757575; line-height: 1.5; }
</style>
