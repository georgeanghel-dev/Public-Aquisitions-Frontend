<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">Istoric utilizator</h2>
        <button class="modal-close" @click="$emit('close')">✕</button>
      </div>
      <div class="modal-body">
        <p class="text-muted">Istoricul utilizatorului va fi disponibil în curând.</p>
      </div>
    </div>
  </div>
</template>
<script setup>
defineProps({ user: Object })
defineEmits(['close'])
</script>
