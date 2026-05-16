<template>
  <div class="dp-wrap" ref="wrapRef">
    <input
      type="text"
      :value="displayValue"
      :placeholder="placeholder"
      readonly
      class="dp-input"
      @click.stop="toggleOpen"
    />
    <Teleport to="body">
      <div v-if="open" class="dp-calendar" :style="calendarStyle" @click.stop>
        <!-- Header -->
        <div class="dp-header">
          <button class="dp-nav" @click="prevMonth">‹</button>
          <div class="dp-header-center">
            <span class="dp-month-trigger" @click.stop="showMonthPicker = !showMonthPicker">
              {{ MONTHS[currentMonth] }}
            </span>
            <input
              class="dp-year-input"
              type="number"
              v-model.number="currentYear"
              @change="onYearChange"
              @click.stop
            />
          </div>
          <button class="dp-nav" @click="nextMonth">›</button>
        </div>

        <!-- Month picker dropdown -->
        <div v-if="showMonthPicker" class="dp-month-list" @click.stop>
          <div
            v-for="(m, i) in MONTHS"
            :key="i"
            class="dp-month-opt"
            :class="{ active: i === currentMonth }"
            @click.stop="selectMonth(i)"
          >{{ m }}</div>
        </div>

        <!-- Weekdays -->
        <div class="dp-weekdays">
          <span v-for="d in DAYS" :key="d">{{ d }}</span>
        </div>

        <!-- Days grid -->
        <div class="dp-days">
          <span
            v-for="(day, i) in calendarDays"
            :key="i"
            class="dp-day"
            :class="{
              'dp-day--other': !day.current,
              'dp-day--today': day.isToday,
              'dp-day--selected': day.isSelected,
              'dp-day--disabled': !day.current
            }"
            @click="day.current && selectDay(day)"
          >{{ day.d }}</span>
        </div>

        <!-- Footer -->
        <div class="dp-footer">
          <button class="dp-btn-clear" @click="clearDate">Șterge</button>
          <button class="dp-btn-today" @click="goToday">Azi</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const DP_EVENT = 'dp:open'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Selectează data' },
})
const emit = defineEmits(['update:modelValue', 'change'])

const MONTHS = ['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie','Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie']
const DAYS   = ['Lu','Ma','Mi','Jo','Vi','Sâ','Du']

const instanceId = Math.random().toString(36).slice(2)
const open           = ref(false)
const showMonthPicker = ref(false)
const wrapRef        = ref(null)
const calendarStyle  = ref({})

const today = new Date()
const currentMonth = ref(today.getMonth())
const currentYear  = ref(today.getFullYear())
const selectedDate = ref(props.modelValue ? new Date(props.modelValue) : null)

// Display value dd.mm.yyyy
const displayValue = computed(() => {
  if (!selectedDate.value) return ''
  const d = selectedDate.value
  return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`
})

// Calendar days grid
const calendarDays = computed(() => {
  const days = []
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  // Luni = 1, Du = 7 → ajustam pentru grid Luni-prima
  let startDow = firstDay.getDay() // 0=Du
  startDow = startDow === 0 ? 6 : startDow - 1 // 0=Lu..6=Du

  const lastDay   = new Date(currentYear.value, currentMonth.value + 1, 0)
  const prevLast  = new Date(currentYear.value, currentMonth.value, 0)

  // Zile din luna precedenta
  for (let i = startDow - 1; i >= 0; i--) {
    days.push({ d: prevLast.getDate() - i, current: false })
  }
  // Zile curente
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(currentYear.value, currentMonth.value, d)
    days.push({
      d, current: true, date,
      isToday: isSameDay(date, today),
      isSelected: selectedDate.value && isSameDay(date, selectedDate.value)
    })
  }
  // Zile din luna urmatoare
  const remaining = 42 - days.length
  for (let d = 1; d <= remaining; d++) {
    days.push({ d, current: false })
  }
  return days
})

function isSameDay(a, b) {
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()
}

function toggleOpen() {
  if (open.value) { open.value = false; return }
  // Inchidem toate celelalte datepicker-uri deschise
  window.dispatchEvent(new CustomEvent(DP_EVENT, { detail: instanceId }))
  // Pozitionam calendarul
  const rect = wrapRef.value?.getBoundingClientRect()
  if (rect) {
    const top = rect.bottom + 4
    let left = rect.left
    if (left + 280 > window.innerWidth - 8) left = window.innerWidth - 288
    calendarStyle.value = { position: 'fixed', top: top + 'px', left: left + 'px', zIndex: 99999 }
  }
  open.value = true
  showMonthPicker.value = false
}

function prevMonth() {
  if (currentMonth.value === 0) { currentMonth.value = 11; currentYear.value-- }
  else currentMonth.value--
}
function nextMonth() {
  if (currentMonth.value === 11) { currentMonth.value = 0; currentYear.value++ }
  else currentMonth.value++
}
function onYearChange() {
  if (currentYear.value < 1900) currentYear.value = 1900
  if (currentYear.value > 2100) currentYear.value = 2100
}
function selectMonth(i) {
  currentMonth.value = i
  showMonthPicker.value = false
}
function selectDay(day) {
  selectedDate.value = day.date
  const iso = `${day.date.getFullYear()}-${String(day.date.getMonth()+1).padStart(2,'0')}-${String(day.date.getDate()).padStart(2,'0')}`
  emit('update:modelValue', iso)
  emit('change', iso)
  open.value = false
}
function clearDate() {
  selectedDate.value = null
  emit('update:modelValue', '')
  emit('change', '')
  open.value = false
}
function goToday() {
  currentMonth.value = today.getMonth()
  currentYear.value  = today.getFullYear()
  selectDay({ date: today, d: today.getDate() })
}

// Sync external value
watch(() => props.modelValue, val => {
  selectedDate.value = val ? new Date(val) : null
})

// Close on outside click
function onDocClick() { open.value = false; showMonthPicker.value = false }
function onDpOpen(e) {
  // Daca un alt datepicker s-a deschis, inchidem pe acesta
  if (e.detail !== instanceId) { open.value = false; showMonthPicker.value = false }
}
onMounted(() => {
  document.addEventListener('click', onDocClick)
  window.addEventListener(DP_EVENT, onDpOpen)
})
onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
  window.removeEventListener(DP_EVENT, onDpOpen)
})
</script>

<style scoped>
.dp-wrap { position: relative; display: flex; align-items: center; width: 100%; }

.dp-input {
  border: none; outline: none; font-size: 0.75rem; color: #424242;
  background: transparent; width: 100%; cursor: pointer;
  font-family: 'Roboto', sans-serif;
}
.dp-input::placeholder { color: #9e9e9e; }
</style>

<style>
/* Calendar - global ca e teleportat */
.dp-calendar {
  background: white;
  border: 1px solid #E0E0E0;
  border-radius: 10px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.14);
  width: 280px;
  overflow: hidden;
  font-family: 'Roboto', sans-serif;
  user-select: none;
}

.dp-header {
  background: #1565C0;
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 12px;
}
.dp-nav {
  background: none; border: none; color: white; font-size: 20px;
  cursor: pointer; width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s; line-height: 1;
}
.dp-nav:hover { background: rgba(255,255,255,0.2); }
.dp-header-center { display: flex; align-items: center; gap: 6px; }
.dp-month-trigger {
  color: white; font-size: 14px; font-weight: 600;
  cursor: pointer; padding: 2px 6px; border-radius: 4px;
  transition: background 0.15s;
}
.dp-month-trigger:hover { background: rgba(255,255,255,0.2); }
.dp-year-input {
  color: white; background: transparent; border: none; outline: none;
  font-size: 14px; font-weight: 600; width: 50px; text-align: center;
  font-family: 'Roboto', sans-serif; cursor: text;
  -moz-appearance: textfield;
}
.dp-year-input::-webkit-outer-spin-button,
.dp-year-input::-webkit-inner-spin-button { -webkit-appearance: none; }

/* Month picker */
.dp-month-list {
  display: grid; grid-template-columns: 1fr 1fr 1fr;
  gap: 2px; padding: 8px; background: white;
  border-bottom: 1px solid #F0F0F0;
}
.dp-month-opt {
  padding: 7px 4px; text-align: center; font-size: 12px;
  color: #424242; cursor: pointer; border-radius: 5px;
  transition: background 0.12s;
}
.dp-month-opt:hover { background: #E3F2FD; color: #1565C0; }
.dp-month-opt.active { background: #1565C0; color: white; font-weight: 600; }

/* Weekdays */
.dp-weekdays {
  display: grid; grid-template-columns: repeat(7, 1fr);
  padding: 8px 8px 4px; gap: 2px;
}
.dp-weekdays span {
  text-align: center; font-size: 11px; font-weight: 600;
  color: #1565C0; padding: 2px 0;
}

/* Days */
.dp-days {
  display: grid; grid-template-columns: repeat(7, 1fr);
  padding: 0 8px 8px; gap: 2px;
}
.dp-day {
  text-align: center; padding: 5px 2px; font-size: 12px;
  color: #424242; cursor: pointer; border-radius: 5px;
  transition: background 0.12s;
}
.dp-day:hover:not(.dp-day--other) { background: #E3F2FD; color: #1565C0; }
.dp-day--other { color: #BDBDBD; cursor: default; }
.dp-day--today { border: 1.5px solid #1565C0; color: #1565C0; font-weight: 600; }
.dp-day--selected { background: #1565C0 !important; color: white !important; font-weight: 600; }

/* Footer */
.dp-footer {
  display: flex; justify-content: space-between;
  padding: 8px 12px; border-top: 1px solid #F0F0F0;
}
.dp-btn-clear, .dp-btn-today {
  border: none; background: none; font-size: 12px;
  cursor: pointer; font-family: 'Roboto', sans-serif;
  padding: 4px 8px; border-radius: 4px; transition: background 0.12s;
}
.dp-btn-clear { color: #9e9e9e; }
.dp-btn-clear:hover { background: #F5F5F5; color: #E53935; }
.dp-btn-today { color: #1565C0; font-weight: 500; }
.dp-btn-today:hover { background: #E3F2FD; }
</style>
