<template>
  <transition name="drawer">
    <div v-if="visible" class="ai-drawer-overlay" @click.self="$emit('close')">
      <div class="ai-drawer">

        <!-- Header -->
        <div class="drawer-header">
          <div class="drawer-header__brand">
            <div class="drawer-header__icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </div>
            <div>
              <div class="drawer-header__title">Asistent AI</div>
              <div class="drawer-header__sub">Achiziții Publice · Referințe de preț</div>
            </div>
          </div>
          <button class="drawer-close" @click="$emit('close')">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Context produs selectat -->
        <div v-if="productName" class="product-context">
          <i class="fas fa-box-open"></i>
          <span>Produs selectat: <strong>{{ productName }}</strong></span>
        </div>

        <!-- Mesaje chat -->
        <div class="chat-messages" ref="chatMessages">
          <!-- Mesaj de bun venit -->
          <div class="msg msg--ai">
            <div class="msg__avatar">
              <i class="fas fa-robot"></i>
            </div>
            <div class="msg__content">
              <div class="msg__bubble">
                <p>Bună ziua! Pot să caut pe internet referințe de preț pentru produse similare cu <strong>{{ productName || 'produsul selectat' }}</strong>.</p>
                <p style="margin-top:0.5rem">Descrieți produsul cât mai detaliat (specificații tehnice, brand preferat, etc.) și voi găsi un preț de referință.</p>
              </div>
              <div class="msg__time">{{ currentTime }}</div>
            </div>
          </div>

          <!-- Mesajele din conversație -->
          <template v-for="(msg, idx) in messages" :key="idx">
            <!-- Mesaj utilizator -->
            <div v-if="msg.role === 'user'" class="msg msg--user">
              <div class="msg__content msg__content--user">
                <div class="msg__bubble msg__bubble--user">{{ msg.text }}</div>
                <div class="msg__time msg__time--user">{{ msg.time }}</div>
              </div>
            </div>

            <!-- Mesaj AI text -->
            <div v-else-if="msg.role === 'ai'" class="msg msg--ai">
              <div class="msg__avatar"><i class="fas fa-robot"></i></div>
              <div class="msg__content">
                <div class="msg__bubble" v-html="msg.html || msg.text"></div>
                <div class="msg__time">{{ msg.time }}</div>
              </div>
            </div>

            <!-- Card rezultat AI -->
            <div v-else-if="msg.role === 'result'" class="msg msg--ai">
              <div class="msg__avatar"><i class="fas fa-robot"></i></div>
              <div class="msg__content" style="width:100%">
                <div class="result-card">
                  <div class="result-card__header">
                    <i class="fas fa-search-dollar"></i>
                    <span>Referință de preț identificată</span>
                    <a v-if="msg.result.url" :href="msg.result.url" target="_blank" class="result-card__link" v-tooltip="'Deschide sursa'">
                      <i class="fas fa-external-link-alt"></i>
                    </a>
                  </div>

                  <div class="result-card__product">
                    <div class="result-card__label">Produs găsit</div>
                    <div class="result-card__value">{{ msg.result.productFound }}</div>
                    <div v-if="msg.result.source" class="result-card__source">
                      <i class="fas fa-globe"></i> {{ msg.result.source }}
                    </div>
                  </div>

                  <div class="result-card__grid">
                    <!-- VUE fără TVA -->
                    <div class="result-field">
                      <div class="result-field__label">V.U.E fără TVA</div>
                      <div class="result-field__value">{{ msg.result.priceWoTva }} RON</div>
                      <button
                        class="result-field__apply"
                        :class="{ applied: appliedFields.priceWoTva === msg.result.priceWoTva }"
                        @click="applyField('priceWoTva', msg.result.priceWoTva)"
                      >
                        <i :class="appliedFields.priceWoTva === msg.result.priceWoTva ? 'fas fa-check' : 'fas fa-arrow-left'"></i>
                        {{ appliedFields.priceWoTva === msg.result.priceWoTva ? 'Aplicat' : 'Aplică' }}
                      </button>
                    </div>

                    <!-- Cotă TVA -->
                    <div class="result-field">
                      <div class="result-field__label">Cotă TVA %</div>
                      <div class="result-field__value">{{ msg.result.tva }}%</div>
                      <div class="result-field__hint">{{ msg.result.tvaReason }}</div>
                      <button
                        class="result-field__apply"
                        :class="{ applied: appliedFields.tva === msg.result.tva }"
                        @click="applyField('tva', msg.result.tva)"
                      >
                        <i :class="appliedFields.tva === msg.result.tva ? 'fas fa-check' : 'fas fa-arrow-left'"></i>
                        {{ appliedFields.tva === msg.result.tva ? 'Aplicat' : 'Aplică' }}
                      </button>
                    </div>
                  </div>

                  <!-- Descriere tehnică -->
                  <div class="result-desc">
                    <div class="result-desc__label">Descriere tehnică sugerată</div>
                    <div class="result-desc__text">{{ msg.result.description }}</div>
                    <button
                      class="result-field__apply"
                      :class="{ applied: appliedFields.description === msg.result.description }"
                      @click="applyField('description', msg.result.description)"
                      style="margin-top:0.5rem"
                    >
                      <i :class="appliedFields.description === msg.result.description ? 'fas fa-check' : 'fas fa-arrow-left'"></i>
                      {{ appliedFields.description === msg.result.description ? 'Aplicată' : 'Aplică descrierea' }}
                    </button>
                  </div>

                  <!-- Aplică toate -->
                  <div class="result-card__actions">
                    <button class="btn-apply-all" @click="applyAll(msg.result)">
                      <i class="fas fa-magic"></i>
                      Aplică toate valorile
                    </button>
                    <button class="btn-generate-pdf" @click="generatePdf(msg.result)" :disabled="generatingPdf">
                      <i :class="generatingPdf ? 'fas fa-spinner fa-spin' : 'fas fa-file-pdf'"></i>
                      {{ generatingPdf ? 'Se generează...' : 'Generează PDF justificativ' }}
                    </button>
                  </div>

                  <!-- PDF generat -->
                  <div v-if="msg.result.pdfGenerated" class="pdf-badge">
                    <i class="fas fa-file-pdf"></i>
                    <span>PDF adăugat la Documente justificative</span>
                    <i class="fas fa-check-circle" style="color:#27ae60;margin-left:auto"></i>
                  </div>
                </div>
                <div class="msg__time">{{ msg.time }}</div>
              </div>
            </div>
          </template>

          <!-- Typing indicator -->
          <div v-if="loading" class="msg msg--ai">
            <div class="msg__avatar"><i class="fas fa-robot"></i></div>
            <div class="msg__content">
              <div class="msg__bubble typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Disclaimer -->
        <div class="ai-disclaimer">
          <i class="fas fa-info-circle"></i>
          <span>Valorile sunt estimative. Răspunderea pentru datele introduse aparține exclusiv utilizatorului. Platforma este exonerată de orice răspundere.</span>
        </div>

        <!-- Input -->
        <div class="chat-input-area">
          <div class="chat-input-wrap" :class="{ disabled: loading }">
            <textarea
              v-model="userInput"
              class="chat-input"
              :placeholder="productName ? `Descrieți specificațiile pentru ${productName}...` : 'Selectați mai întâi un produs din formular...'"
              :disabled="loading || !productName"
              rows="2"
              @keydown.enter.exact.prevent="sendMessage"
              @keydown.enter.shift.exact="userInput += '\n'"
            ></textarea>
            <button
              class="chat-send"
              @click="sendMessage"
              :disabled="loading || !userInput.trim() || !productName"
            >
              <i v-if="loading" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-paper-plane"></i>
            </button>
          </div>
          <div class="chat-input-hint">Enter = trimite · Shift+Enter = linie nouă</div>
        </div>

      </div>
    </div>
  </transition>
</template>

<script>
import jsPDF from 'jspdf'

export default {
  name: 'AiPriceAgent',
  props: {
    visible: { type: Boolean, default: false },
    productName: { type: String, default: '' },
    productCpv: { type: String, default: '' },
  },
  emits: ['close', 'apply-price', 'apply-tva', 'apply-description', 'pdf-generated'],

  data() {
    return {
      messages: [],
      userInput: '',
      loading: false,
      generatingPdf: false,
      appliedFields: {
        priceWoTva: null,
        tva: null,
        description: null,
      },
      conversationHistory: [],
    }
  },

  computed: {
    currentTime() {
      return new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })
    },
  },

  watch: {
    productName(val) {
      if (val) {
        this.messages = []
        this.conversationHistory = []
        this.appliedFields = { priceWoTva: null, tva: null, description: null }
      }
    },
    visible(val) {
      if (val) {
        this.$nextTick(() => this.scrollToBottom())
      }
    },
  },

  methods: {
    scrollToBottom() {
      const el = this.$refs.chatMessages
      if (el) el.scrollTop = el.scrollHeight
    },

    getTime() {
      return new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })
    },

    async sendMessage() {
      const text = this.userInput.trim()
      if (!text || this.loading || !this.productName) return

      this.userInput = ''
      this.messages.push({ role: 'user', text, time: this.getTime() })
      this.conversationHistory.push({ role: 'user', content: text })
      this.loading = true
      this.$nextTick(() => this.scrollToBottom())

      try {
        const systemPrompt = `Ești un asistent specializat în achiziții publice din România. 
Ajuți utilizatorii să găsească referințe de preț pentru produse pe care doresc să le achiziționeze.

Produsul pentru care se caută referința: "${this.productName}"
${this.productCpv ? `Cod CPV: ${this.productCpv}` : ''}

Instrucțiuni:
1. Caută pe internet produse similare cu cel descris de utilizator
2. Identifică un preț de referință rezonabil din surse românești (emag.ro, cel.ro, dedeman.ro, marketplace-uri B2B etc.)
3. Determină cota de TVA corectă conform legislației române:
   - 19% standard (majoritatea produselor)
   - 9% pentru alimente, medicamente, cărți, acces la muzee, hoteluri
   - 5% pentru locuințe sociale, evenimente culturale, lemne de foc, panouri solare
4. Sugerează o descriere tehnică concisă și relevantă

IMPORTANT: Răspunde EXCLUSIV cu un obiect JSON valid, fără text în afara JSON-ului:
{
  "productFound": "denumirea exactă a produsului găsit",
  "source": "numele site-ului sursă (ex: emag.ro)",
  "url": "URL-ul paginii produsului",
  "priceWoTva": număr_cu_2_zecimale,
  "tva": număr_întreg (5, 9 sau 19),
  "tvaReason": "explicație scurtă pentru cota TVA aleasă",
  "description": "descriere tehnică sugerată max 200 caractere",
  "searchSummary": "rezumat scurt despre ce ai găsit (1-2 propoziții, în română)"
}`

        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1000,
            system: systemPrompt,
            tools: [{ type: 'web_search_20250305', name: 'web_search' }],
            messages: this.conversationHistory,
          }),
        })

        const data = await response.json()

        // Extrage textul din răspuns (poate include tool_use blocks)
        const textContent = data.content
          ?.filter(b => b.type === 'text')
          ?.map(b => b.text)
          ?.join('') || ''

        // Încearcă parsare JSON
        try {
          const clean = textContent.replace(/```json|```/g, '').trim()
          const result = JSON.parse(clean)

          // Adaugă mesaj sumar
          this.messages.push({
            role: 'ai',
            text: result.searchSummary || 'Am găsit o referință de preț pentru produsul solicitat.',
            time: this.getTime(),
          })

          // Adaugă cardul cu rezultat
          this.messages.push({
            role: 'result',
            result: { ...result, pdfGenerated: false },
            time: this.getTime(),
          })

          // Actualizează istoricul conversației cu răspunsul AI
          this.conversationHistory.push({
            role: 'assistant',
            content: textContent,
          })

        } catch {
          // Dacă nu e JSON valid, afișează ca text normal
          this.messages.push({
            role: 'ai',
            text: textContent || 'Nu am putut procesa răspunsul. Reformulați cererea.',
            time: this.getTime(),
          })
          this.conversationHistory.push({ role: 'assistant', content: textContent })
        }

      } catch (e) {
        this.messages.push({
          role: 'ai',
          text: 'A apărut o eroare la comunicarea cu agentul AI. Încercați din nou.',
          time: this.getTime(),
        })
      } finally {
        this.loading = false
        this.$nextTick(() => this.scrollToBottom())
      }
    },

    applyField(field, value) {
      this.appliedFields[field] = value
      if (field === 'priceWoTva') this.$emit('apply-price', parseFloat(value))
      if (field === 'tva') this.$emit('apply-tva', parseFloat(value))
      if (field === 'description') this.$emit('apply-description', value)
    },

    applyAll(result) {
      this.applyField('priceWoTva', result.priceWoTva)
      this.applyField('tva', result.tva)
      this.applyField('description', result.description)
    },

    async generatePdf(result) {
      this.generatingPdf = true
      try {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
        const pageW = 210
        const margin = 20
        const contentW = pageW - margin * 2
        let y = 0

        // ── Header brand ──────────────────────────────────
        doc.setFillColor(21, 101, 192) // #1565C0
        doc.rect(0, 0, pageW, 42, 'F')

        // Icon coș (simplified rectangle placeholder)
        doc.setFillColor(30, 136, 229) // #1E88E5
        doc.roundedRect(margin, 10, 22, 22, 3, 3, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(14)
        doc.text('🛒', margin + 4, 24)

        // Titlu aplicație
        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.text('Achiziții Publice', margin + 27, 19)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text('PLATFORMĂ DE MANAGEMENT', margin + 27, 25)

        // Titlu document
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text('REFERINȚĂ DE PREȚ', pageW - margin - 50, 19)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text(`Generat: ${new Date().toLocaleString('ro-RO')}`, pageW - margin - 50, 25)

        y = 55

        // ── Secțiune: Produs căutat ───────────────────────
        doc.setFillColor(243, 246, 255)
        doc.rect(margin, y, contentW, 28, 'F')
        doc.setDrawColor(21, 101, 192)
        doc.setLineWidth(0.5)
        doc.rect(margin, y, contentW, 28, 'S')

        doc.setTextColor(21, 101, 192)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        doc.text('PRODUS SOLICITAT', margin + 5, y + 7)
        doc.setTextColor(26, 26, 46)
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text(this.productName || '-', margin + 5, y + 15)
        if (this.productCpv) {
          doc.setFontSize(8)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(120, 120, 120)
          doc.text(`Cod CPV: ${this.productCpv}`, margin + 5, y + 22)
        }

        y += 36

        // ── Secțiune: Produs găsit ────────────────────────
        doc.setTextColor(21, 101, 192)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.text('PRODUS GĂSIT', margin, y)
        y += 5

        doc.setTextColor(26, 26, 46)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        const productLines = doc.splitTextToSize(result.productFound, contentW)
        doc.text(productLines, margin, y)
        y += productLines.length * 5 + 3

        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(100, 100, 100)
        doc.text(`Sursă: ${result.source || '-'}`, margin, y)
        y += 4
        if (result.url) {
          doc.setTextColor(21, 101, 192)
          doc.text(result.url.substring(0, 80) + (result.url.length > 80 ? '...' : ''), margin, y)
          y += 4
        }

        y += 6

        // ── Tabel valori ──────────────────────────────────
        doc.setFillColor(21, 101, 192)
        doc.rect(margin, y, contentW, 8, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        doc.text('VALORI IDENTIFICATE', margin + 3, y + 5.5)
        y += 8

        const colW = contentW / 3
        const rows = [
          ['V.U.E fără TVA', `${result.priceWoTva} RON`, ''],
          ['Cotă TVA', `${result.tva}%`, result.tvaReason || ''],
          ['V.U.E cu TVA', `${(parseFloat(result.priceWoTva) * (1 + parseFloat(result.tva) / 100)).toFixed(2)} RON`, 'calculat'],
        ]

        rows.forEach((row, i) => {
          const rowY = y + i * 10
          doc.setFillColor(i % 2 === 0 ? 248 : 255, i % 2 === 0 ? 249 : 255, i % 2 === 0 ? 255 : 255)
          doc.rect(margin, rowY, contentW, 10, 'F')
          doc.setDrawColor(220, 220, 220)
          doc.setLineWidth(0.3)
          doc.rect(margin, rowY, contentW, 10, 'S')

          doc.setTextColor(80, 80, 80)
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(8)
          doc.text(row[0], margin + 3, rowY + 6.5)

          doc.setFont('helvetica', 'bold')
          doc.setTextColor(21, 101, 192)
          doc.text(row[1], margin + colW + 3, rowY + 6.5)

          doc.setFont('helvetica', 'normal')
          doc.setFontSize(7)
          doc.setTextColor(130, 130, 130)
          doc.text(row[2], margin + colW * 2 + 3, rowY + 6.5)
        })

        y += rows.length * 10 + 8

        // ── Descriere tehnică ─────────────────────────────
        doc.setTextColor(21, 101, 192)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.text('DESCRIERE TEHNICĂ SUGERATĂ', margin, y)
        y += 5

        doc.setFillColor(250, 250, 250)
        const descLines = doc.splitTextToSize(result.description || '-', contentW - 6)
        const descH = descLines.length * 5 + 6
        doc.rect(margin, y, contentW, descH, 'F')
        doc.setDrawColor(220, 220, 220)
        doc.rect(margin, y, contentW, descH, 'S')
        doc.setTextColor(60, 60, 60)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.text(descLines, margin + 3, y + 5)
        y += descH + 8

        // ── Notă importantă ───────────────────────────────
        doc.setFillColor(255, 243, 224)
        doc.rect(margin, y, contentW, 22, 'F')
        doc.setDrawColor(255, 152, 0)
        doc.setLineWidth(0.5)
        doc.rect(margin, y, contentW, 22, 'S')

        doc.setTextColor(230, 81, 0)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        doc.text('⚠  NOTĂ IMPORTANTĂ', margin + 3, y + 6)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(80, 80, 80)
        doc.setFontSize(7.5)
        const disclaimer = 'Valorile prezentate în acest document au caracter estimativ și au fost obținute prin intermediul unui agent AI. Răspunderea pentru datele introduse în formularul de achiziție aparține exclusiv utilizatorului. Platforma „Achiziții Publice" este exonerată de orice răspundere cu privire la acuratețea acestor informații.'
        const disclaimerLines = doc.splitTextToSize(disclaimer, contentW - 6)
        doc.text(disclaimerLines, margin + 3, y + 12)
        y += 28

        // ── Footer ────────────────────────────────────────
        doc.setFillColor(245, 245, 245)
        doc.rect(0, 282, pageW, 15, 'F')
        doc.setTextColor(150, 150, 150)
        doc.setFontSize(7)
        doc.setFont('helvetica', 'normal')
        doc.text('Achiziții Publice · Platformă de Management · powered by ConectX', margin, 289)
        doc.text(`Pag. 1/1`, pageW - margin - 10, 289)

        // ── Conversie la File și emit ─────────────────────
        const pdfBlob = doc.output('blob')
        const fileName = `referinta-pret-${(this.productName || 'produs').replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`
        const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' })

        // Marchează cardul ca PDF generat
        result.pdfGenerated = true

        this.$emit('pdf-generated', pdfFile)
        this.$toastr?.s('PDF adăugat la Documente justificative.')

      } catch (e) {
        console.error('PDF generation error:', e)
        this.$toastr?.e('A apărut o eroare la generarea PDF-ului.')
      } finally {
        this.generatingPdf = false
      }
    },
  },
}
</script>

<style scoped>
/* ── Drawer overlay ─────────────────────────────── */
.ai-drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  justify-content: flex-end;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(2px);
}

.ai-drawer {
  width: 420px;
  max-width: 100vw;
  height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.15);
}

/* ── Header ─────────────────────────────────────── */
.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #1565C0, #1E88E5);
  color: #fff;
  flex-shrink: 0;
}

.drawer-header__brand { display: flex; align-items: center; gap: 0.75rem; }

.drawer-header__icon {
  width: 36px; height: 36px;
  background: rgba(255,255,255,0.2);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.drawer-header__title { font-size: 1rem; font-weight: 700; line-height: 1.2; }
.drawer-header__sub { font-size: 0.7rem; opacity: 0.8; margin-top: 1px; }

.drawer-close {
  background: rgba(255,255,255,0.15);
  border: none; border-radius: 6px;
  width: 32px; height: 32px;
  color: #fff; cursor: pointer; font-size: 0.95rem;
  transition: background 0.2s;
}
.drawer-close:hover { background: rgba(255,255,255,0.3); }

/* ── Context produs ─────────────────────────────── */
.product-context {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  background: #e8f0fe;
  font-size: 0.82rem; color: #1565C0;
  border-bottom: 1px solid #c5d8fb;
  flex-shrink: 0;
}
.product-context strong { font-weight: 700; }

/* ── Chat messages ──────────────────────────────── */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: #f8f9fb;
}

/* ── Mesaje ─────────────────────────────────────── */
.msg { display: flex; gap: 0.5rem; align-items: flex-start; }
.msg--user { flex-direction: row-reverse; }

.msg__avatar {
  width: 30px; height: 30px; border-radius: 50%;
  background: linear-gradient(135deg, #1565C0, #1E88E5);
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 0.8rem; flex-shrink: 0;
}

.msg__content { max-width: 85%; display: flex; flex-direction: column; gap: 0.2rem; }
.msg__content--user { align-items: flex-end; }

.msg__bubble {
  background: #fff;
  border: 1px solid #e0e4ef;
  border-radius: 12px 12px 12px 4px;
  padding: 0.65rem 0.9rem;
  font-size: 0.85rem;
  color: #333;
  line-height: 1.5;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.msg__bubble p { margin: 0; }
.msg__bubble--user {
  background: linear-gradient(135deg, #1565C0, #1E88E5);
  color: #fff;
  border-color: transparent;
  border-radius: 12px 12px 4px 12px;
}

.msg__time { font-size: 0.7rem; color: #aaa; padding: 0 0.3rem; }
.msg__time--user { text-align: right; }

/* ── Typing indicator ───────────────────────────── */
.typing-indicator {
  display: flex; align-items: center; gap: 4px; padding: 0.75rem 1rem;
}
.typing-indicator span {
  width: 7px; height: 7px; border-radius: 50%;
  background: #1565C0; opacity: 0.4;
  animation: typing-bounce 1.2s infinite;
}
.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
@keyframes typing-bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-6px); opacity: 1; }
}

/* ── Result card ────────────────────────────────── */
.result-card {
  background: #fff;
  border: 1px solid #e0e4ef;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  width: 100%;
}

.result-card__header {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.65rem 0.9rem;
  background: #e8f0fe;
  font-size: 0.82rem; font-weight: 700; color: #1565C0;
  border-bottom: 1px solid #c5d8fb;
}
.result-card__link {
  margin-left: auto; color: #1565C0; font-size: 0.8rem;
  text-decoration: none;
}
.result-card__link:hover { color: #1E88E5; }

.result-card__product { padding: 0.8rem 0.9rem; border-bottom: 1px solid #f0f0f0; }
.result-card__label { font-size: 0.7rem; text-transform: uppercase; color: #aaa; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 0.2rem; }
.result-card__value { font-size: 0.9rem; font-weight: 700; color: #1a1a2e; }
.result-card__source { font-size: 0.75rem; color: #888; margin-top: 0.25rem; }

.result-card__grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 0; border-bottom: 1px solid #f0f0f0;
}

.result-field {
  padding: 0.75rem 0.9rem;
  border-right: 1px solid #f0f0f0;
  display: flex; flex-direction: column; gap: 0.2rem;
}
.result-field:last-child { border-right: none; }
.result-field__label { font-size: 0.7rem; text-transform: uppercase; color: #aaa; font-weight: 600; letter-spacing: 0.5px; }
.result-field__value { font-size: 1.1rem; font-weight: 700; color: #1565C0; }
.result-field__hint { font-size: 0.7rem; color: #888; line-height: 1.3; }

.result-field__apply {
  display: inline-flex; align-items: center; gap: 0.3rem;
  background: none; border: 1px solid #1565C0;
  color: #1565C0; border-radius: 5px;
  padding: 0.25rem 0.6rem; font-size: 0.75rem; font-weight: 600;
  cursor: pointer; transition: all 0.2s; margin-top: 0.3rem;
  width: fit-content;
}
.result-field__apply:hover { background: #1565C0; color: #fff; }
.result-field__apply.applied { background: #e8f5e9; border-color: #27ae60; color: #27ae60; }

.result-desc { padding: 0.75rem 0.9rem; border-bottom: 1px solid #f0f0f0; }
.result-desc__label { font-size: 0.7rem; text-transform: uppercase; color: #aaa; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 0.3rem; }
.result-desc__text { font-size: 0.82rem; color: #555; line-height: 1.5; }

.result-card__actions {
  display: flex; gap: 0.5rem; padding: 0.75rem 0.9rem;
  flex-wrap: wrap;
}

.btn-apply-all {
  flex: 1;
  display: flex; align-items: center; justify-content: center; gap: 0.4rem;
  background: linear-gradient(135deg, #1565C0, #1E88E5);
  color: #fff; border: none; border-radius: 7px;
  padding: 0.55rem 0.75rem; font-size: 0.8rem; font-weight: 700;
  cursor: pointer; transition: opacity 0.2s;
}
.btn-apply-all:hover { opacity: 0.9; }

.btn-generate-pdf {
  flex: 1;
  display: flex; align-items: center; justify-content: center; gap: 0.4rem;
  background: #fff4f0; color: #e53935; border: 1px solid #ffccbc;
  border-radius: 7px; padding: 0.55rem 0.75rem;
  font-size: 0.8rem; font-weight: 600;
  cursor: pointer; transition: all 0.2s;
}
.btn-generate-pdf:hover:not(:disabled) { background: #ffebee; }
.btn-generate-pdf:disabled { opacity: 0.6; cursor: not-allowed; }

.pdf-badge {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.5rem 0.9rem;
  background: #e8f5e9;
  font-size: 0.8rem; color: #2e7d32; font-weight: 600;
  border-top: 1px solid #c8e6c9;
}
.pdf-badge i:first-child { color: #e53935; }

/* ── Disclaimer ─────────────────────────────────── */
.ai-disclaimer {
  display: flex; align-items: flex-start; gap: 0.5rem;
  padding: 0.6rem 1rem;
  background: #fff8e1;
  border-top: 1px solid #ffe082;
  font-size: 0.72rem; color: #795548;
  line-height: 1.4;
  flex-shrink: 0;
}
.ai-disclaimer i { color: #f9a825; margin-top: 1px; flex-shrink: 0; }

/* ── Chat input ─────────────────────────────────── */
.chat-input-area {
  padding: 0.75rem 1rem 0.6rem;
  background: #fff;
  border-top: 1px solid #eee;
  flex-shrink: 0;
}

.chat-input-wrap {
  display: flex; gap: 0.5rem; align-items: flex-end;
  background: #f5f7fb;
  border: 1.5px solid #e0e4ef;
  border-radius: 10px;
  padding: 0.5rem;
  transition: border-color 0.2s;
}
.chat-input-wrap:focus-within { border-color: #1565C0; }
.chat-input-wrap.disabled { opacity: 0.6; }

.chat-input {
  flex: 1; border: none; background: transparent;
  resize: none; font-size: 0.875rem; line-height: 1.4;
  color: #333; outline: none; font-family: inherit;
  max-height: 100px; overflow-y: auto;
}
.chat-input::placeholder { color: #aaa; }

.chat-send {
  width: 36px; height: 36px; border-radius: 8px;
  background: linear-gradient(135deg, #1565C0, #1E88E5);
  border: none; color: #fff; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.9rem; flex-shrink: 0;
  transition: opacity 0.2s;
}
.chat-send:disabled { opacity: 0.4; cursor: not-allowed; }
.chat-send:hover:not(:disabled) { opacity: 0.9; }

.chat-input-hint {
  font-size: 0.68rem; color: #bbb;
  margin-top: 0.3rem; text-align: right;
}

/* ── Tranziție drawer ───────────────────────────── */
.drawer-enter-active { animation: slide-in 0.3s ease-out; }
.drawer-leave-active { animation: slide-out 0.25s ease-in; }
@keyframes slide-in {
  from { transform: translateX(100%); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}
@keyframes slide-out {
  from { transform: translateX(0);    opacity: 1; }
  to   { transform: translateX(100%); opacity: 0; }
}
</style>
