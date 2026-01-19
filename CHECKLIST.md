# Checklist Test Supporto EPUB v1.2.0

## 📋 Test da Eseguire

### 1. Upload e Visualizzazione
- [ ] **Test upload e visualizzazione EPUB**
  - Caricare un file EPUB valido
  - Verificare che il libro si apra correttamente
  - Controllare che il testo sia leggibile
  - Verificare che non ci siano errori nella console

- [ ] **Test retrocompatibilità con PDF reader**
  - Caricare un file PDF
  - Verificare che il PDF reader funzioni correttamente
  - Alternare tra PDF ed EPUB
  - Verificare che entrambi i reader funzionino senza interferenze

### 2. Funzionalità Core

- [ ] **Test selezione testo in EPUB**
  - Selezionare testo nel viewer EPUB
  - Verificare che appaia il popup di selezione
  - Controllare che il testo selezionato sia corretto
  - Testare selezione su più righe

- [ ] **Test creazione annotazione con audio memo**
  - Selezionare testo
  - Aprire il recorder audio
  - Registrare un memo vocale
  - Aggiungere tags e note
  - Selezionare un colore
  - Salvare l'annotazione
  - Verificare che l'annotazione appaia nella lista

- [ ] **Test highlights annotazioni nel viewer EPUB**
  - Creare 2-3 annotazioni con colori diversi
  - Verificare che gli highlights siano visibili nel viewer
  - Controllare che i colori siano corretti
  - Navigare tra le sezioni e verificare persistenza highlights

- [ ] **Test navigazione sezioni (prev/next)**
  - Cliccare il pulsante "Pagina precedente"
  - Cliccare il pulsante "Pagina successiva"
  - Verificare che la navigazione sia fluida
  - Controllare che gli highlights persistano durante la navigazione

- [ ] **Test zoom font-size EPUB**
  - Cliccare il pulsante "Aumenta zoom" (+)
  - Verificare che il testo diventi più grande
  - Cliccare il pulsante "Riduci zoom" (-)
  - Verificare che il testo diventi più piccolo
  - Controllare che lo zoom sia limitato (50%-200%)

### 3. Storage

- [ ] **Test salvataggio annotazioni IndexedDB**
  - Creare un'annotazione
  - Aprire DevTools > Application > IndexedDB > annotations
  - Verificare che l'annotazione sia salvata con CFI
  - Controllare che tutti i campi siano presenti (tags, notes, color, audioMemo)

- [ ] **Test recupero annotazioni da IndexedDB**
  - Creare 2-3 annotazioni
  - Ricaricare la pagina (F5)
  - Verificare che le annotazioni siano caricate automaticamente
  - Controllare che gli highlights siano renderizzati
  - Verificare che la lista annotazioni sia popolata

### 4. Layout Responsive

- [ ] **Test layout responsive su mobile**
  - Aprire DevTools (F12)
  - Attivare "Toggle device toolbar" (Ctrl+Shift+M)
  - Testare su iPhone SE (375px)
  - Testare su iPad (768px)
  - Verificare che il layout si adatti correttamente

- [ ] **Test BottomSheet per SelectionPopup su mobile**
  - In modalità mobile, selezionare testo
  - Verificare che appaia il BottomSheet dal basso
  - Testare swipe-down per chiudere
  - Testare click su backdrop per chiudere
  - Verificare animazioni smooth

- [ ] **Test BottomSheet per AnnotationEditor su mobile**
  - In modalità mobile, cliccare su un'annotazione nella lista
  - Verificare che appaia il BottomSheet
  - Testare modifica annotazione
  - Testare chiusura con swipe e backdrop
  - Verificare modale di conferma modifiche

### 5. Compatibilità Browser

#### Desktop

- [ ] **Test compatibilità Chrome desktop**
  - Aprire app in Chrome
  - Testare upload EPUB
  - Testare selezione e annotazioni
  - Testare registrazione audio (formato webm/opus)
  - Verificare highlights e navigazione

- [ ] **Test compatibilità Firefox desktop**
  - Aprire app in Firefox
  - Testare upload EPUB
  - Testare selezione e annotazioni
  - Testare registrazione audio (formato webm/opus)
  - Verificare highlights e navigazione

- [ ] **Test compatibilità Safari desktop**
  - Aprire app in Safari
  - Testare upload EPUB
  - Testare selezione e annotazioni
  - Testare registrazione audio (formato mp4)
  - Verificare highlights e navigazione

#### Mobile

- [ ] **Test compatibilità Chrome mobile/iOS**
  - Aprire app su dispositivo iOS reale o tramite BrowserStack
  - Testare upload EPUB
  - Testare selezione testo (touch)
  - Testare registrazione audio (Web Audio API + WAV)
  - Verificare BottomSheet e animazioni
  - Testare highlights e navigazione touch

---

## 📝 Note per il Testing

### File EPUB di Test
Scaricare EPUB gratuiti da:
- [Standard Ebooks](https://standardebooks.org/) - eBook classici di alta qualità
- [Project Gutenberg](https://www.gutenberg.org/) - migliaia di libri gratuiti
- [Feedbooks Public Domain](https://www.feedbooks.com/publicdomain)

### Browser Testing
- **Desktop**: Chrome, Firefox, Safari (versioni più recenti)
- **Mobile**: Chrome iOS, Safari iOS (testare su dispositivo reale se possibile)
- **Tool**: BrowserStack o ngrok per test mobile remoto

### Comandi Utili
```bash
# Avvia dev server
npm run dev

# Build e preview
npm run build
npm run preview

# Test con HTTPS (per registrazione audio iOS)
# Opzione 1: ngrok
ngrok http 5173

# Opzione 2: certificato autofirmato
VITE_HTTPS=true npm run dev
```

### Debug
- Aprire DevTools (F12)
- Console: controllare errori JavaScript
- Network: verificare caricamento EPUB e risorse
- Application > IndexedDB: verificare storage annotazioni
- Application > Storage: verificare blob audio

---

## ✅ Risultati Attesi

Tutti i test devono passare senza errori critici. Eventuali warning minori vanno documentati.

### Criteri di Successo
- Upload e visualizzazione EPUB funzionanti
- Selezione testo e creazione annotazioni OK
- Highlights renderizzati correttamente
- Storage IndexedDB persistente
- Layout responsive fluido su mobile
- Compatibilità cross-browser (con limitazioni note per Safari iOS)

### Limitazioni Note
- Safari iOS: registrazione audio usa Web Audio API (WAV) invece di MediaRecorder
- Safari iOS: pause/resume non disponibili durante registrazione
- EPUB: navigazione a annotazione da sidebar non implementata (future feature)
- EPUB: table of contents non implementata (future feature)

---

**Versione**: 1.2.0
**Data**: 2026-01-19
**Feature**: Supporto EPUB (Fase 2)
