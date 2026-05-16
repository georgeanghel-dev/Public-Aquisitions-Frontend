<template>
  <div class="home-page">
    <div class="home-cards">
      <router-link to="/planificare/nevoi" class="home-card">
        <div class="home-card__icon">
          <i class="fas fa-clipboard-list"></i>
        </div>
        <div class="home-card__title">Planificare</div>
        <div class="home-card__sub">PAAP, referate de necesitate, bugete</div>
      </router-link>

      <router-link to="/atribuire" class="home-card">
        <div class="home-card__icon">
          <i class="fas fa-file-contract"></i>
        </div>
        <div class="home-card__title">Achiziție / Atribuire</div>
        <div class="home-card__sub">Proceduri, documente, furnizori</div>
      </router-link>

      <router-link to="/monitorizare" class="home-card">
        <div class="home-card__icon">
          <i class="fas fa-chart-bar"></i>
        </div>
        <div class="home-card__title">Monitorizare</div>
        <div class="home-card__sub">Rapoarte, contracte, urmărire</div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
// Home — vizibil pentru responsabil_achizitii și supervizor_achizitii
</script>

<style scoped>
.home-page {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 3rem 1.5rem;
  background: #F5F7FA;
}

.home-cards {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 900px;
  width: 100%;
}

.home-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #e0e8f0;
  padding: 2.5rem 2rem;
  width: 240px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.home-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(21,101,192,0.12);
  border-color: #1565C0;
}

.home-card__icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #E3F2FD;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  color: #1565C0;
  transition: background 0.2s;
}

.home-card:hover .home-card__icon {
  background: #1565C0;
  color: white;
}

.home-card__title {
  font-size: 1rem;
  font-weight: 600;
  color: #1565C0;
  text-align: center;
}

.home-card__sub {
  font-size: 0.78rem;
  color: #888;
  text-align: center;
  line-height: 1.5;
}
</style>
