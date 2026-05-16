<template>
  <div class="app-layout">
    <AppHeader />
    <div class="app-body">
      <AppSidebar />
      <main class="app-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import AppHeader from '@/components/AppHeader.vue'
import AppSidebar from '@/components/AppSidebar.vue'
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  font-family: 'Roboto', sans-serif;
}
.app-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}
.app-content {
  flex: 1;
  background: #F5F7FA;
  overflow-y: auto;
  min-width: 0;
}
</style>
