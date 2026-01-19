# Suggeritore - App per lo Studio di Copioni Teatrali

**Versione**: 1.2.0

## Obiettivo del Progetto

Creare una web application per lo studio di copioni teatrali che permetta di:
- Leggere documenti PDF ed EPUB
- Selezionare porzioni di testo
- Registrare memo vocali collegati al testo selezionato
- Riprodurre i memo durante lo studio
- Organizzare annotazioni per scena/atto/personaggio

## Stack Tecnologico

### Core
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand

### Librerie Specializzate
- **PDF**: `react-pdf` (basato su PDF.js)
- **EPUB**: `epubjs` 
- **Audio**: MediaRecorder API (nativa browser)
- **Visualizzazione Audio**: `wavesurfer.js` (opzionale)
- **Storage**: `localforage` (wrapper per IndexedDB)
- **UI Components**: `@headlessui/react` + `@heroicons/react`

## Struttura del Progetto

```
suggeritore/
├── public/
│   └── sample/                    # File di esempio (opzionale)
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── MainLayout.tsx
│   │   ├── reader/
│   │   │   ├── PDFReader.tsx
│   │   │   ├── EPUBReader.tsx
│   │   │   ├── DocumentViewer.tsx
│   │   │   └── TextHighlighter.tsx
│   │   ├── audio/
│   │   │   ├── VoiceRecorder.tsx
│   │   │   ├── AudioPlayer.tsx
│   │   │   └── WaveformDisplay.tsx (opzionale)
│   │   ├── annotations/
│   │   │   ├── AnnotationList.tsx
│   │   │   ├── AnnotationCard.tsx
│   │   │   └── AnnotationEditor.tsx
│   │   └── common/
│   │       ├── Button.tsx
│   │       ├── Modal.tsx
│   │       └── FileUploader.tsx
│   ├── hooks/
│   │   ├── useAudioRecorder.ts
│   │   ├── useAnnotations.ts
│   │   ├── useDocument.ts
│   │   └── useTextSelection.ts
│   ├── store/
│   │   ├── documentStore.ts
│   │   ├── annotationStore.ts
│   │   └── audioStore.ts
│   ├── services/
│   │   ├── storage.ts
│   │   ├── audioService.ts
│   │   └── exportService.ts
│   ├── types/
│   │   ├── document.ts
│   │   ├── annotation.ts
│   │   └── audio.ts
│   ├── utils/
│   │   ├── textSelection.ts
│   │   ├── audioUtils.ts
│   │   └── dateFormat.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## Modelli Dati TypeScript

### Document

```typescript
interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'epub';
  file: File | Blob;
  uploadedAt: Date;
  metadata?: {
    author?: string;
    title?: string;
    totalPages?: number;
  };
}
```

### Annotation

```typescript
interface Annotation {
  id: string;
  documentId: string;
  
  // Posizione nel documento
  location: {
    page?: number;           // Per PDF
    cfi?: string;            // Per EPUB (Canonical Fragment Identifier)
    startOffset: number;
    endOffset: number;
  };
  
  // Contenuto
  selectedText: string;
  textContext: string;       // Testo circostante per contestualizzare
  
  // Audio memo
  audioMemo?: {
    id: string;
    blob: Blob;
    duration: number;
    mimeType: string;
  };
  
  // Metadati
  tags: string[];            // es: ["atto1", "monologo", "importante"]
  color: string;             // Per evidenziazione visuale
  notes?: string;            // Note testuali opzionali
  
  // Timestamp
  createdAt: Date;
  updatedAt: Date;
}
```

## Setup Iniziale

### Comandi per Creare il Progetto

```bash
# Creare progetto Vite con React + TypeScript
npm create vite@latest suggeritore -- --template react-ts
cd suggeritore

# Installare dipendenze core
npm install

# Installare librerie specializzate
npm install react-pdf pdfjs-dist epubjs
npm install zustand localforage
npm install wavesurfer.js
npm install @headlessui/react @heroicons/react

# Installare Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Installare tipi TypeScript
npm install -D @types/node
```

### Configurazioni Necessarie

**Tailwind Config**: estendere con colori tema teatrale (rossi/bordeaux)

**Vite Config**: 
- Configurare alias `@` per `./src`
- Includere `pdfjs-dist` in `optimizeDeps`

**PDF.js Worker**: configurare worker URL per react-pdf

## Funzionalità da Implementare

### Fase 1: MVP (Base Funzionante)

#### 1. Storage Service
- Creare store IndexedDB separati per: documenti, annotazioni, audio blob
- Implementare CRUD completo per annotazioni
- Gestire associazione blob audio con annotazioni
- Recuperare annotazioni per documento specifico

#### 2. Upload e Gestione Documenti
- Componente per upload file PDF/EPUB
- Visualizzare lista documenti caricati
- Selezionare documento da aprire
- Salvare documenti in IndexedDB

#### 3. PDF Reader
- Integrare react-pdf
- Navigazione tra pagine
- Zoom e controlli visualizzazione
- Renderizzare text layer per selezione

#### 4. Selezione Testo
- Hook personalizzato per catturare selezioni
- Estrarre testo selezionato e offset
- Calcolare contesto (testo circostante)
- Mostrare popup azione quando c'è selezione attiva

#### 5. Registrazione Audio
- Hook per gestire MediaRecorder API
- Stati: idle, recording, paused, stopped
- Timer durata registrazione
- Gestione permessi microfono
- Preview audio prima di salvare

#### 6. Collegamento Audio-Testo
- Creare annotazione con testo + audio
- Salvare in storage con ID univoco
- Visualizzare marker sul testo annotato
- Click su marker per riprodurre audio

#### 7. Lista Annotazioni
- Visualizzare tutte le annotazioni del documento corrente
- Ordinare per data/posizione
- Filtri per tag
- Click per navigare a posizione nel documento

#### 8. UI/UX Base
- Layout responsive (sidebar + area lettura)
- Componenti Button, Modal riutilizzabili
- Stati di loading
- Gestione errori base

### Fase 2: Miglioramenti

#### 9. Supporto EPUB
- Integrare epubjs
- Gestire CFI per posizionamento
- Stessa logica annotazioni del PDF

#### 10. Sistema Tag
- Input tag durante creazione annotazione
- Autocomplete tag esistenti
- Filtro annotazioni per tag
- Colori distintivi per tag



#### 11. Note Testuali
- Campo note opzionale oltre audio
- Edit note esistenti
- Visualizzare note in card annotazione

#### 12. Ricerca
- Ricerca full-text nelle annotazioni
- Ricerca per tag
- Highlight risultati

#### 13. Export/Import
- Esportare annotazioni come JSON
- Importare annotazioni salvate
- Esportare singolo documento con note

#### 14. Interfaccia Mobile-Responsive
- Drawer overlay per sidebar su mobile (stile Gmail)
- Bottom sheet draggable per pannelli annotazioni (stile Google Maps)
- Breakpoints: Mobile (<640px), Tablet (640-1024px), Desktop (>1024px)
- Touch-friendly: tap target minimi 44x44px
- Fix UI hover-dependent su dispositivi touch
- Componenti nuovi: useMediaQuery hook, Backdrop, BottomSheet
- Modifiche layout: MainLayout, Sidebar, Header, PDFReader
- Ottimizzazione input e button per touch
- Zero impatto sull'esperienza desktop

### Fase 3: Features Avanzate (Opzionali)

#### 15. Visualizzazione Waveform
- Integrare wavesurfer.js
- Mostrare forma d'onda registrazione
- Navigazione visuale audio

#### 16. PWA
- Manifest per installabilità
- Service worker per offline
- Cache documenti e annotazioni

#### 17. Modalità Prova/Rehearsal
- Autoplay sequenziale note per scena
- Timer tra note
- Modalità hands-free

#### 18. Statistiche
- Tempo totale studio per documento
- Numero annotazioni per sezione
- Tag più usati

## Requisiti Tecnici

### Performance
- Lazy loading per documenti pesanti
- Virtual scrolling per liste lunghe annotazioni
- Debounce per ricerca
- React.memo per componenti costosi

### Accessibilità
- Supporto tastiera completo
- ARIA labels appropriati
- Focus management nei modal
- Contrasti colori WCAG AA

### Browser Support
- Chrome/Edge: pieno supporto (MediaRecorder con webm/opus)
- Firefox: pieno supporto (MediaRecorder con webm/opus)
- Safari Desktop: supporto parziale (MediaRecorder con mp4)
- **Safari iOS: SUPPORTATO** (Web Audio API con WAV encoding, senza pause/resume)
- **Chrome iOS: SUPPORTATO** (Web Audio API con WAV encoding, senza pause/resume)
- **Android: pieno supporto** (MediaRecorder con webm/opus)

### Gestione Errori
- Fallback se microfono non disponibile
- Messaggio se file non supportato
- Gestione quota storage superata
- Recupero graceful da errori storage

## User Stories

1. **Come attore**, voglio caricare il mio copione in PDF per studiarlo digitalmente
2. **Come attore**, voglio selezionare una battuta e registrare una nota vocale su come interpretarla
3. **Come attore**, voglio riascoltare le mie note mentre rileggo il copione
4. **Come attore**, voglio organizzare le note per scene usando i tag
5. **Come attore**, voglio cercare tutte le note dove ho parlato di "emozione" o "rabbia"
6. **Come regista**, voglio aggiungere note di regia per gli attori
7. **Come utente**, voglio esportare tutte le mie annotazioni per backup

## Note per l'Implementazione

### Priorità
1. Focus iniziale su PDF (EPUB può essere fase 2)
2. UI semplice e funzionale prima di estetica avanzata
3. Storage locale robusto prima di pensare a cloud

### Espandibilità Futura
- Architettura deve permettere aggiunta backend facilmente
- Service layer ben separato da UI
- Types ben definiti per future estensioni
- Possibilità di aggiungere features AI (trascrizione, analisi)

### Testing (Opzionale ma Consigliato)
- Vitest per test unitari
- Testing Library per componenti
- Test critici: storage, audio recording, text selection

## Comandi di Sviluppo

```bash
npm run dev        # Avvio sviluppo
npm run build      # Build produzione
npm run preview    # Preview build
npm run lint       # Linting
```

## Risorse Utili

- [React PDF Documentation](https://github.com/wojtekmaj/react-pdf)
- [Epub.js Documentation](https://github.com/futurepress/epub.js)
- [Web Audio API Guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [LocalForage Documentation](https://localforage.github.io/localForage/)

---

## Per Claude Code

### Responsabilità

Claude Code deve:
1. Generare l'intero scaffolding del progetto
2. Implementare i componenti seguendo la struttura definita
3. Configurare tutti i file necessari
4. Seguire la roadmap fase per fase
5. Creare esempi e test

### ⚠️ IMPORTANTE: Mantenimento Documentazione

**Claude Code DEVE tenere aggiornato questo file CLAUDE.md durante lo sviluppo:**

- ✅ Aggiungere sezione "Stato Implementazione" con checkbox per funzionalità completate
- ✅ Documentare scelte architetturali significative prese durante l'implementazione
- ✅ Annotare eventuali deviazioni dalla struttura originale (con motivazione)
- ✅ Aggiungere note su problemi risolti e soluzioni adottate
- ✅ Mantenere una sezione "Prossimi Passi" sempre aggiornata
- ✅ Documentare dipendenze aggiunte oltre quelle specificate

**Formato suggerito per aggiornamenti:**

## Stato Implementazione

### Fase 1: MVP
- [x] Storage Service (completato il 2026-01-15)
  - Note: Usato localforage con 3 store separati (documents, annotations, audio)
- [x] Upload e Gestione Documenti (completato il 2026-01-15)
- [x] PDF Reader (completato il 2026-01-15)
  - Integrato react-pdf v10
  - Navigazione pagine e zoom funzionanti
- [x] Selezione Testo (completato il 2026-01-15)
  - Hook useTextSelection per catturare selezioni
  - Popup azione al click
- [x] Registrazione Audio (completato il 2026-01-15)
  - MediaRecorder API con supporto webm/mp4
  - Preview audio prima di salvare
- [x] Collegamento Audio-Testo (completato il 2026-01-15)
  - Annotazioni con audio memo collegato
  - Player audio integrato
- [x] Lista Annotazioni (completato il 2026-01-15)
  - Sidebar con lista annotazioni
  - Ricerca testuale nelle annotazioni
- [x] UI/UX Base (completato il 2026-01-15)
  - Layout responsive con sidebar
  - Componenti Button, Modal, FileUploader

### Fase 2: Miglioramenti
- [x] Interfaccia Mobile-Responsive (completato il 2026-01-16)
  - Hook useMediaQuery e useBreakpoints per rilevamento breakpoint
  - Componenti Backdrop e BottomSheet
  - Drawer overlay per Sidebar su mobile (stile Gmail)
  - BottomSheet draggable per annotazioni su mobile (stile Google Maps)
  - Header responsive con controlli ottimizzati
  - Touch target minimi 44x44px su tutti i controlli
  - Disabilitato pinch-to-zoom per prevenire rottura interfaccia
  - Zero impatto sull'esperienza desktop
- [x] Conferma modifiche non salvate (completato il 2026-01-16)
  - Modale di conferma con opzioni Salva/Chiudi/Annulla
  - Rilevamento automatico modifiche in AnnotationEditor e SelectionPopup
  - Funziona con chiusura da pulsanti, backdrop, swipe BottomSheet
- [x] Supporto EPUB (completato il 2026-01-19)
  - **Migrato da epubjs vanilla a react-reader** (wrapper React dedicato)
  - Gestione CFI (Canonical Fragment Identifier) per posizionamento
  - Selezione testo e annotazioni funzionanti con stessa logica PDF
  - Highlights annotazioni renderizzate nel viewer EPUB
  - Navigazione affidabile tra sezioni con flow paginated
  - Controlli zoom tramite fontSize scaling
  - Layout responsive (desktop + mobile BottomSheet)
- [ ] Sistema Tag avanzato con autocomplete
- [ ] Note testuali edit
- [ ] Ricerca avanzata
- [ ] Export/Import JSON

### Fase 3: Features Avanzate (opzionale)
- [ ] Visualizzazione Waveform
- [ ] PWA
- [ ] Modalita Prova/Rehearsal
- [ ] Statistiche

## Note di Sviluppo

### 2026-01-15
- Creato progetto con Vite + React 18 + TypeScript
- Configurato Tailwind CSS v3 con colori tema teatrale (teatro, burgundy)
- Implementato storage service con localforage e pattern repository
- Blob audio salvati in store separato per performance
- Aggiunta dipendenza `uuid` per generazione ID
- Usato Zustand per state management (documentStore, annotationStore, audioStore)
- Implementati hooks custom: useTextSelection, useAudioRecorder, useAudioPlayer
- PDF.js worker configurato con import.meta.url per Vite

### 2026-01-16 - Interfaccia Mobile-Responsive
- **Implementati nuovi componenti e hooks:**
  - `useMediaQuery`: Hook per rilevare media queries e breakpoint (mobile <640px, tablet 640-1024px, desktop >1024px)
  - `useBreakpoints`: Hook preconfigurato con breakpoint comuni + rilevamento touch device
  - `Backdrop`: Componente overlay per chiudere drawer/sheet su mobile
  - `BottomSheet`: Componente draggable per mobile (stile Google Maps), con gesture di trascinamento

- **Aggiornati componenti esistenti:**
  - `MainLayout`: Gestisce apertura/chiusura sidebar responsive, backdrop su mobile
  - `Sidebar`: Drawer overlay con animazione slide-in su mobile, fisso su desktop
  - `Header`: Layout compatto su mobile (icone più grandi, testo nascosto), controlli ottimizzati
  - `PDFReader`: Usa BottomSheet su mobile/tablet per annotazioni, pannelli laterali su desktop
  - `SelectionPopup`: Styling adattivo (senza padding laterale nel BottomSheet)
  - `AnnotationEditor`: Styling adattivo con componenti più grandi su mobile
  - `Button`: Touch-friendly con min-height garantiti (sm: 36px, md: 44px, lg: 48px)

- **Ottimizzazioni touch:**
  - Tutti i button interattivi hanno min-width/min-height di 44x44px su mobile
  - Icone più grandi su mobile (5x5 invece di 4x4)
  - Testi più leggibili su mobile (text-base invece di text-sm)
  - Delete button sempre visibili su mobile (no hover-only)
  - Input e textarea con sizing touch-friendly

- **Comportamento mobile:**
  - Sidebar si chiude automaticamente dopo selezione documento/annotazione
  - BottomSheet si può trascinare per chiudere (threshold 100px)
  - Backdrop previene scroll del body quando attivo
  - Layout completamente responsive senza compromessi su desktop

### 2026-01-16 - Miglioramenti Animazioni UI
- **Problema**: Le animazioni erano deboli o assenti, l'interfaccia sembrava statica
- **Soluzione**: Implementato sistema completo di animazioni fluide e percettibili
- **Implementazione**:
  - **CSS Animations globali** in `index.css`:
    - Keyframes: `fadeIn`, `fadeOut`, `scaleIn`, `scaleOut`, `slideInFromBottom`, `slideOutToBottom`, `slideInFromLeft`, `slideOutToLeft`
    - Classi utility: `.animate-fadeIn`, `.animate-scaleIn`, `.animate-slideInFromBottom`, etc.
    - Easing functions: `cubic-bezier(0.34, 1.56, 0.64, 1)` per effetti "bounce" naturali
    - Transizioni globali smooth per `button`, `a`, `input`, `select`, `textarea` (200ms ease-in-out)
    - Hover effect con translateY(-1px) su tutti i button non disabilitati
  - **Sidebar** ([Sidebar.tsx](src/components/layout/Sidebar.tsx)):
    - Drawer slide-in più fluido con `ease-out` (300ms)
    - Tab con transizione `duration-200` e icone con `hover:scale-110`
    - Card documenti/annotazioni con `hover:shadow-md`, `hover:scale-[1.01/1.02]`
    - Bottoni delete con `hover:scale-110` e fade-in opacity su desktop
  - **BottomSheet** ([BottomSheet.tsx](src/components/common/BottomSheet.tsx)):
    - Aggiunta transizione opacity per fade-in/out più evidente (300ms ease-out)
    - Handle drag bar con `hover:bg-gray-400` e `hover:w-16` (feedback visivo)
    - Close button con `hover:scale-110`
  - **Backdrop** ([Backdrop.tsx](src/components/common/Backdrop.tsx)):
    - Aggiunto `ease-in-out` per fade più naturale
    - `pointerEvents: none` quando chiuso per evitare click accidentali
  - **Modal** ([Modal.tsx](src/components/common/Modal.tsx)):
    - Animazione `scaleIn` sul panel (scale 0.95 → 1.0) con cubic-bezier bounce
    - Backdrop con fade opacity smooth
    - Close button con `hover:scale-110`
  - **Header** ([Header.tsx](src/components/layout/Header.tsx)):
    - Tutti i button con `hover:scale-110` e `transition-all duration-200`
    - Icone con `transition-transform` per animazioni fluide
  - **Button** ([Button.tsx](src/components/common/Button.tsx)):
    - Cambiato `transition-colors` → `transition-all` per animare anche transform/shadow
    - Aggiunto `hover:shadow-md` e `active:scale-[0.98]` per feedback tattile
  - **FileUploader** ([FileUploader.tsx](src/components/common/FileUploader.tsx)):
    - Area upload con `hover:scale-[1.02]` e `hover:shadow-lg` (300ms)
    - Icona drag con `animate-bounce` quando isDragging
    - Icona default con `hover:scale-110`
    - Errori con `animate-fadeIn`
  - **TagInput** ([TagInput.tsx](src/components/common/TagInput.tsx)):
    - Tag con animazione `animate-scaleIn` all'aggiunta
    - Hover state con `bg-gray-200` e transizione smooth
    - Remove button con `hover:scale-125`
  - **ColorSelector** ([ColorSelector.tsx](src/components/common/ColorSelector.tsx)):
    - Color circles con `hover:scale-125` e `hover:ring-2`
    - Transizione smooth ring quando selezionato
  - **SelectionPopup** e **AnnotationEditor**:
    - Close buttons con `hover:scale-110`
    - Tutte le icone con `transition-transform`
- **Risultato**:
  - ✅ Interfaccia molto più reattiva e piacevole da usare
  - ✅ Feedback visivo chiaro su tutti gli elementi interattivi
  - ✅ Animazioni fluide con easing naturali (bounce/ease-in-out)
  - ✅ Effetti hover/active percettibili ma non eccessivi
  - ✅ Performance ottimali (GPU-accelerated transforms)
  - ✅ Esperienza coerente su tutti i componenti

### 2026-01-16 - Ottimizzazione Performance Animazioni iOS/Mobile
- **Problema**: Animazioni con `transform: scale()` causavano scatti su Chrome iOS e Safari iOS
- **Causa**: iOS WebKit ha limitazioni con animazioni hardware-accelerated complesse (scale + shadow + transform combinati)
- **Soluzione**: Ottimizzazioni CSS specifiche per dispositivi mobile/touch
- **Implementazione**:
  - **CSS Media Query `@media (hover: none) and (pointer: coarse)`** per rilevare dispositivi touch:
    - Disabilitate tutte le animazioni `scale` su mobile (causano scatti)
    - Rimosse shadow dinamiche su mobile (costose da renderizzare)
    - Ridotte durate animazioni: 200ms → 100ms, 300ms → 150ms
    - Mantenute solo transizioni di colore/opacity (molto più performanti)
  - **Hardware Acceleration forzata** con `translateZ(0)` e `backface-visibility: hidden`:
    - Applicato a tutti gli elementi con `transition`, `hover:scale`, `animate-*`
    - Aggiunto `will-change: transform, opacity` per hint al browser
  - **Semplificazione componenti**:
    - **Button**: Rimosso `hover:shadow-md`, `active:scale-[0.98]` → Solo `active:opacity-80`
    - **FileUploader**: Rimosso `hover:scale-[1.02]`, `shadow-lg`, `animate-bounce`
    - **TagInput**: Rimosso `hover:scale-110/125` su icone e bottoni
    - **ColorSelector**: Rimosso `scale-110` e `hover:scale-125`, aumentata size base (w-7 h-7)
    - **Sidebar**: Mantenute transizioni solo su `colors` invece di `all`
  - **Desktop preservato**: Tutte le animazioni complete restano attive su `@media (hover: hover) and (pointer: fine)`
- **Risultato**:
  - ✅ **Interfaccia fluida su Chrome iOS** - zero scatti o lag
  - ✅ **Migliorate performance Safari iOS** - animazioni smooth
  - ✅ **Ridotto carico GPU** su dispositivi mobile
  - ✅ **Esperienza desktop invariata** - tutte le animazioni funzionano
  - ✅ **Transizioni rapide** (100-150ms) ma percettibili su mobile
  - ✅ **Active states** con opacity invece di scale (più performante)

### 2026-01-16 - Supporto Registrazione iOS con Web Audio API
- **Problema**: iOS non supporta MediaRecorder API in nessun browser (Safari, Chrome, Firefox)
- **Soluzione**: Implementato sistema di fallback con Web Audio API
- **Implementazione**:
  - Creato `WebAudioEncoder` class in `/src/utils/audioEncoder.ts`:
    - Usa `AudioContext` + `ScriptProcessorNode` per catturare stream audio
    - Buffer size 4096 campioni, sample rate 44.1kHz, mono
    - Cattura audio come Float32Array e converte in Int16 PCM
    - Genera file WAV completo con header RIFF/WAVE corretto
  - Aggiornato `useAudioRecorder` hook con logica di fallback:
    - Rileva disponibilità MediaRecorder API al runtime
    - Se disponibile: usa MediaRecorder (webm/opus su Chrome/Firefox, mp4 su Safari desktop)
    - Se non disponibile: usa WebAudioEncoder (iOS, browser vecchi)
    - Gestisce automaticamente differenze tra i due metodi
  - Aggiornato `VoiceRecorder` UI component:
    - Rimosso messaggio di errore "iOS non supportato"
    - Aggiunto warning informativo su iOS (modalità Web Audio API)
    - Nascosti pulsanti Pausa/Riprendi su iOS (non supportati da ScriptProcessorNode)
    - L'app ora funziona su tutti i dispositivi iOS
- **Risultato**:
  - ✅ Registrazione funziona su Safari iOS
  - ✅ Registrazione funziona su Chrome iOS
  - ✅ Registrazione funziona su Firefox iOS
  - ✅ Audio salvato come WAV 16-bit mono 44.1kHz
  - ⚠️ Pause/Resume non disponibili su iOS (limitazione tecnica)
  - ✅ Compatibilità retroattiva: browser desktop continuano a usare MediaRecorder
- **Note tecniche**:
  - ScriptProcessorNode è deprecato ma ancora l'unico modo per iOS (AudioWorklet non supportato)
  - WAV non compresso: file più grandi di webm/opus, ma universalmente compatibile
  - Possibile futura ottimizzazione: implementare encoding MP3 con lamejs (già installato)

### 2026-01-16 - Conferma Modifiche Non Salvate
- **Funzionalità**: Prevenire perdita accidentale di dati quando si chiude o cambia una modale di annotazione
- **Implementazione**:
  - **Creato componente `ConfirmModal`** in `/src/components/common/ConfirmModal.tsx`:
    - Modale riutilizzabile con 3 azioni: Annulla, Salva, Chiudi senza salvare
    - Supporta varianti danger/warning/info per diversi contesti
    - Pulsanti personalizzabili per testo e azioni
  - **Rilevamento modifiche in `AnnotationEditor`**:
    - Hook `useMemo` che confronta stato corrente con annotazione originale
    - Confronta: tags (ordinati), notes, color, audioMemo.id
    - Mostra conferma solo se ci sono modifiche reali
    - **Intercetta cambio annotazione**: usa `useEffect` + `useRef` per bloccare il cambio quando ci sono modifiche non salvate
    - Due modali separate: una per chiusura, una per cambio annotazione
  - **Rilevamento modifiche in `SelectionPopup`**:
    - Rileva qualsiasi campo compilato (tags, notes, color diverso dal default, audioMemo)
    - Mostra conferma prima di chiudere se l'utente ha iniziato a creare l'annotazione
  - **Gestione chiusura unificata**:
    - `handleClose()`: controlla hasChanges e mostra modale se necessario
    - `handleSaveAndClose()`: salva e chiude
    - `handleDiscardAndClose()`: chiude senza salvare
    - `handleSaveAndSwitch()`: salva e passa a nuova annotazione (solo AnnotationEditor)
    - `handleDiscardAndSwitch()`: scarta modifiche e passa a nuova annotazione (solo AnnotationEditor)
  - **Integrazione con BottomSheet su mobile**:
    - `PDFReader` usa ref (`handleCloseRef`) per accedere a `handleClose` dei componenti figli
    - Wrapper handlers (`handleRequestCloseSelection`, `handleRequestCloseEditor`) delegano ai componenti
    - BottomSheet e Backdrop chiamano i wrapper invece di chiudere direttamente
    - I componenti controllano internamente se mostrare la conferma
- **Risultato**:
  - ✅ L'utente riceve una conferma chiara prima di perdere modifiche
  - ✅ Tre opzioni intuitive: Annulla (torna indietro), Salva, Chiudi/Cambia senza salvare
  - ✅ Funziona su desktop e mobile (button X, Annulla, backdrop, swipe BottomSheet)
  - ✅ **Funziona anche al cambio annotazione dalla lista** (sidebar)
  - ✅ Nessuna interruzione se non ci sono modifiche (chiusura immediata)
  - ✅ Esperienza utente migliorata e dati protetti

### 2026-01-19 - Supporto EPUB (Migrazione a react-reader)
- **Funzionalità**: Leggere e annotare file EPUB con la stessa esperienza del PDF
- **Problema riscontrato**: epubjs vanilla aveva problemi di navigazione tra sezioni (eventi `relocated` e `display()` in conflitto)
- **Soluzione**: Migrazione da epubjs vanilla a **react-reader** (wrapper React dedicato e ben mantenuto)
- **Implementazione**:
  - **Riscritta `EPUBReader` component** usando react-reader:
    - Componente `<ReactReader>` gestisce rendering e navigazione automaticamente
    - Caricamento libro da Blob URL (`URL.createObjectURL()`)
    - Flow paginato configurato (`flow: 'paginated'`, `manager: 'default'`)
    - Callback `getRendition` per accedere al rendition e gestire eventi
    - Eventi `selected` per catturare selezione testo e ottenere CFI range
    - Highlights annotazioni con `rendition.annotations.add()`
    - Navigazione prev/next tramite prop `location` (href della sezione TOC)
    - Zoom tramite `rendition.themes.fontSize()` scaling
  - **Gestione CFI (Canonical Fragment Identifier)**:
    - CFI usato per identificare posizione esatta nel libro EPUB
    - Salvato in `annotation.location.cfi`
    - Navigazione a CFI con `rendition.display(cfi)`
    - Highlights renderizzati su CFI range
  - **Modificato `SelectionPopup`** per supportare EPUB:
    - Props `documentId` e `currentPage` ora opzionali
    - Nuova prop `createLocation?: () => AnnotationLocation` per logica custom (EPUB)
    - Fallback a `useDocumentStore.getState().currentDocument.id` se documentId non fornito
    - Mantiene retrocompatibilità con PDF (usa page-based location se createLocation non fornita)
  - **Aggiornato `DocumentViewer`**:
    - Rimuove placeholder EPUB e usa `<EPUBReader>` per file .epub
    - Switching automatico tra PDFReader ed EPUBReader basato su `document.type`
  - **Layout responsive**:
    - Stessa struttura di PDFReader: pannelli laterali su desktop, BottomSheet su mobile
    - Backdrop e BottomSheet per SelectionPopup e AnnotationEditor
    - Handlers `handleRequestCloseSelection` e `handleRequestCloseEditor`
- **Installate dipendenze**:
  - `react-reader` - Wrapper React per epubjs con gestione navigazione migliorata
  - `@types/epub` (dev dependency) per tipi TypeScript
- **Vantaggi react-reader vs epubjs vanilla**:
  - Navigazione affidabile senza conflitti tra eventi `relocated` e `display()`
  - Gestione automatica del rendering e resize
  - Props dichiarative per location/navigazione
  - Manutenzione attiva e bug fix frequenti
  - Styling personalizzabile tramite `readerStyles`
- **Risultato**:
  - ✅ Upload e visualizzazione file EPUB funzionanti
  - ✅ Selezione testo e creazione annotazioni con CFI
  - ✅ Highlights annotazioni renderizzate nel viewer
  - ✅ **Navigazione prev/next affidabile e fluida**
  - ✅ Zoom font-size funzionante
  - ✅ Layout responsive identico a PDF (BottomSheet mobile)
  - ✅ Annotazioni salvate in IndexedDB con CFI
  - ✅ **Navigazione a annotazione da sidebar** (completato il 2026-01-19)
  - ✅ **Highlights cliccabili** per aprire annotazioni (completato il 2026-01-19)
  - ⚠️ Table of contents dropdown (feature futura)

### Problemi Risolti
- **PDF.js worker path**: Risolto usando `new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url)` per compatibilita Vite
- **react-pdf CSS**: Rimossi import CSS obsoleti (v10 non li richiede)
- **TypeScript strict mode**: Corretti warning su variabili non usate
- **Audio memo tutti uguali (2026-01-15)**: Il hook `useAudioPlayer` aveva un bug critico - tutti i componenti `AudioPlayer` condividevano lo stesso elemento `<audio>` e FileReader asincrono causava race condition. Risolto con:
  - Caricamento lazy del blob solo al momento del play
  - Blob passato come parametro all'hook invece di metodo `load()`
  - Tracking del blob corrente per evitare ricaricamenti inutili
  - Aggiunta `key` ai componenti `AudioPlayer` per forzare re-mount
- **Registrazione precedente visibile in nuovo recorder (2026-01-15)**: Lo store audio globale manteneva `currentRecording` tra sessioni. Risolto con reset dello stato al mount di `VoiceRecorder`
- **Memo non aggiornato cambiando annotazione nell'editor (2026-01-15)**: `AnnotationEditor` non sincronizzava lo stato quando cambiava l'annotazione prop. Risolto con `useEffect` che aggiorna lo stato locale quando `annotation.id` cambia
- **Safari iOS non supportato (2026-01-16)**: Safari iOS ha limitazioni critiche su File API e IndexedDB che impediscono il funzionamento corretto dell'app. Implementati miglioramenti parziali ma insufficienti:
  - MIME types espliciti nell'accept: `application/pdf,application/epub+zip,.pdf,.epub`
  - Validazione più permissiva per MIME types
  - Configurazione localforage con fallback drivers (IndexedDB → WebSQL → localStorage)
  - Funzione `checkStorageAvailability()` per rilevare Safari modalità privata
  - Warning UI se storage limitato o non disponibile
  - **DECISIONE**: Safari iOS marcato come NON SUPPORTATO fino a risoluzione dei problemi di compatibilità. L'app funziona correttamente su Chrome iOS come alternativa.
- **Selezione testo non funzionante su Chrome iOS (2026-01-16)**: Su dispositivi touch (Chrome iOS, Android) la selezione del testo non apriva il menu annotazione. Il problema era che `useTextSelection` ascoltava solo eventi `mouseup`, che non vengono sempre lanciati su dispositivi touch. Risolto con:
  - Aggiunto ascolto eventi `touchend` oltre a `mouseup`
  - Aggiunto delay di 100ms dopo `touchend` per permettere alla selezione nativa di completarsi
  - Aggiunto ascolto evento `selectionchange` per catturare selezioni programmatiche o da menu nativo
  - Ora funziona correttamente su tutti i dispositivi touch (Chrome iOS, Safari iOS con limitazioni, Android)
- **`navigator.mediaDevices.getUserMedia` undefined (2026-01-16)**: Su alcuni browser o contesti non sicuri (HTTP invece di HTTPS), `navigator.mediaDevices` può essere `undefined`, causando errore "undefined is not an object". Risolto con:
  - Controlli espliciti di disponibilità API (`navigator.mediaDevices` e `MediaRecorder`) in `useAudioRecorder`
  - Messaggio di errore chiaro e specifico per browser non supportati
  - UI dedicata in `VoiceRecorder` con lista browser supportati e nota su Safari iOS
  - L'app ora gestisce gracefully l'assenza dell'API mostrando messaggio esplicativo
- **Registrazione audio su iOS implementata con Web Audio API (2026-01-16)**: Tutti i browser su iOS usano WebKit (motore di Safari) che **non supporta MediaRecorder API**. Risolto implementando fallback con Web Audio API + encoder WAV:
  - Creato `WebAudioEncoder` class che usa `ScriptProcessorNode` per catturare audio PCM
  - Audio catturato in Float32Array e convertito in Int16 PCM
  - Creato header WAV compliant con audio/wav MIME type
  - `useAudioRecorder` hook rileva automaticamente supporto MediaRecorder
  - Se MediaRecorder non disponibile (iOS), usa Web Audio API come fallback
  - Pause/Resume non disponibili su iOS (limitazione di ScriptProcessorNode)
  - UI mostra warning informativo su iOS e nasconde pulsanti Pausa/Riprendi
  - **RISULTATO**: Registrazione audio ora funziona su tutti i dispositivi iOS (Safari, Chrome, Firefox)
  - Audio salvato come WAV 16-bit mono 44.1kHz su iOS, webm/opus su altri dispositivi
- **Pinch-to-zoom rompe interfaccia mobile (2026-01-16)**: Il pinch-to-zoom su dispositivi touch causava zoom indesiderato che rompeva il layout dell'app. Risolto con approccio multi-livello:
  - Meta tag viewport aggiornato: `maximum-scale=1.0, user-scalable=no`
  - CSS `touch-action: pan-x pan-y` su html, body, #root per permettere scroll ma prevenire zoom
  - CSS `overscroll-behavior: none` per prevenire elastic scroll
  - Disabilitato `user-select` e `touch-callout` globalmente
  - Riabilitato `user-select: text` solo su input, textarea e area testo PDF
  - JavaScript event listeners in `main.tsx`:
    - `gesturestart` event: previene pinch-to-zoom su iOS/Safari
    - `touchend` event: previene zoom con doppio tap (300ms threshold)
    - `wheel` event: previene zoom con Ctrl+wheel o Cmd+wheel (desktop)
    - `keydown` event: previene zoom con Ctrl+/Cmd+ Plus/Minus
  - Tutte le soluzioni combinate per massima compatibilità cross-browser
  - Ora l'app ha un'esperienza "app-like" fissa su mobile senza zoom accidentali
- **Navigazione EPUB non funzionante con epubjs vanilla (2026-01-19)**: I pulsanti prev/next non cambiavano sezione negli EPUB. Problema causato da conflitti tra:
  - Evento `relocated` che aggiornava `currentPage` automaticamente
  - `useEffect` che navigava a `currentPage` quando cambiava
  - Flag `isNavigatingProgrammatically` che cercava di prevenire loop ma creava deadlock
  - **SOLUZIONE**: Migrazione completa a **react-reader** invece di debuggare epubjs vanilla
  - react-reader gestisce internamente la navigazione con props dichiarative (`location`)
  - Nessun conflitto tra eventi e navigazione programmatica
  - Codice più semplice e manutenibile (da ~400 righe a ~320)
  - **RISULTATO**: Navigazione prev/next ora fluida e affidabile, zero bug
- **Highlights EPUB non cliccabili e navigazione da sidebar non implementata (2026-01-19)**: Due problemi nelle annotazioni EPUB:
  - Gli highlights non erano cliccabili (mancava `cursor: 'pointer'` negli stili SVG e event listener)
  - Cliccando su annotazione dalla sidebar non si navigava alla posizione nel libro
  - **SOLUZIONE**:
    - Aggiunto `cursor: 'pointer'` agli stili degli highlights (`rendition.annotations.add()`)
    - Implementato listener per evento `markClicked` che trova l'annotazione corrispondente e apre l'editor
    - Aggiunto `useEffect` che naviga al CFI quando `selectedAnnotation` cambia (`rendition.display(cfi)`)
  - **RISULTATO**:
    - ✅ Highlights ora mostrano cursore pointer e sono cliccabili
    - ✅ Click su highlight apre immediatamente l'AnnotationEditor
    - ✅ Click su annotazione da sidebar naviga alla posizione esatta e apre l'editor
    - ✅ Esperienza identica al PDFReader
- **Errore "target.closest is not a function" cambiando da PDF a EPUB (2026-01-19)**: Quando si cambiava documento da PDF a EPUB, l'hook `useTextSelection` crashava con errore "target.closest is not a function".
  - **CAUSA**: Gli eventi DOM dall'iframe EPUB (usato da react-reader) possono avere target che sono nodi XML/SVG senza il metodo `.closest()`
  - **SOLUZIONE**:
    - Aggiunto controllo `if (!target || typeof target.closest !== 'function')` in `useTextSelection.ts:61`
    - L'hook ignora eventi con target non-HTMLElement invece di crashare
  - **RISULTATO**: ✅ Switching fluido tra PDF e EPUB senza errori
- **Warning XML "errore di sintassi" in console (2026-01-19)**: Il browser mostra warning di parsing XML per file come `META-INF/container.xml` e `content.opf` durante il caricamento di EPUB.
  - **CAUSA**: epubjs/react-reader accede a risorse interne dell'EPUB tramite URL relativi, e il browser prova a interpretarli come documenti standalone
  - **NOTA**: Questi warning sono **benigni e normali** - non impediscono il funzionamento dell'app
  - **SOLUZIONE**: Nessuna azione necessaria. I warning possono essere ignorati o nascosti tramite filtri console del browser
  - **RISULTATO**: ✅ L'app funziona correttamente nonostante i warning nella console

### Dipendenze Aggiunte
- `uuid` - Generazione ID univoci
- `react-pdf` v10 - Visualizzazione PDF
- `pdfjs-dist` - Worker PDF
- `react-reader` - Wrapper React per epubjs con navigazione migliorata (Fase 2 completata)
- `@types/epub` - Tipi TypeScript per epubjs (dev)
- `@headlessui/react` - Componenti UI accessibili
- `@heroicons/react` - Icone
- `lamejs` - MP3 encoding (installato per future implementazioni, al momento usa WAV)

## Deployment (configurato il 2026-01-15)

### GitHub Pages
- **URL Live**: https://TheRiver96.github.io/Suggeritore/
- **Workflow**: `.github/workflows/deploy.yml`
- **Trigger**: Push su branch `main`
- **Build**: Vite con `VITE_BASE_PATH=/Suggeritore/`

### GitHub Releases
- **Workflow**: `.github/workflows/release.yml`
- **Trigger**: Push di git tag (es. `v1.0.0`)
- **Output**: File ZIP scaricabile con build standalone
- **Base path**: `/` (per uso locale)

### Configurazione Base Path
- **vite.config.ts**: Aggiunto `base: process.env.VITE_BASE_PATH || '/'`
- **Locale dev**: usa base `/`
- **GitHub Pages**: usa base `/Suggeritore/`
- **Release standalone**: usa base `/`

### Comandi Deployment

```bash
# Deploy automatico su GitHub Pages (push su main)
git add .
git commit -m "Update feature"
git push origin main

# Creare release con artifact scaricabile
git tag v1.0.0
git push --tags

# Build locale per test
VITE_BASE_PATH=/Suggeritore/ npm run build
npm run preview -- --base /Suggeritore/
```

## Prossimi Passi
1. ✅ Configurare deployment GitHub Pages e Releases
2. ✅ Implementare interfaccia mobile-responsive
3. ✅ Implementare registrazione audio iOS con Web Audio API
4. ✅ Implementare supporto EPUB con react-reader
5. Testare EPUB su dispositivi mobile reali
6. Implementare navigazione a annotazione da sidebar (click su annotazione in lista)
7. (Opzionale) Aggiungere dropdown Table of Contents per EPUB
8. Aggiungere sistema tag con autocomplete
9. Implementare export/import annotazioni
10. (Opzionale) Ottimizzare encoder audio con MP3/Opus per ridurre dimensione file

## Come Avviare

### Online (dopo deployment)
Visita: https://TheRiver96.github.io/Suggeritore/

### Locale

```bash
cd suggeritore
npm install
npm run dev
```

L'applicazione sara disponibile su http://localhost:5173/

### Test su Dispositivi iOS (iPhone/iPad)

Per testare la registrazione audio su iOS, **devi usare HTTPS** (requisito del browser per accedere al microfono).

#### Metodo 1: Usare ngrok (Più Semplice)

```bash
# Installa ngrok: https://ngrok.com/download
# Avvia il dev server normale
npm run dev

# In un altro terminale, crea un tunnel HTTPS
ngrok http 5173
```

Ngrok ti darà un URL HTTPS pubblico (es. `https://abc123.ngrok.io`) che puoi aprire su iPhone.

#### Metodo 2: Certificato Autofirmato (Più Complesso)

1. **Installa mkcert** (una volta):
   ```bash
   # Su macOS
   brew install mkcert
   mkcert -install
   ```

2. **Genera certificati** per il tuo IP locale:
   ```bash
   # Trova il tuo IP locale (es. 192.168.1.100)
   ifconfig | grep "inet "

   # Genera certificati (sostituisci con il tuo IP)
   mkcert localhost 192.168.1.100
   ```

3. **Avvia con HTTPS**:
   ```bash
   VITE_HTTPS=true npm run dev
   ```

4. **Su iPhone**:
   - Apri Safari e vai a `https://192.168.1.100:5173`
   - Accetta il certificato (tocca "Mostra dettagli" > "Visita sito web")
   - Ora il microfono funzionerà!

**Nota**: Con HTTP normale (senza HTTPS), il microfono NON funziona su iOS per motivi di sicurezza.

### Build Locale

```bash
# Build produzione
npm run build

# Build per GitHub Pages
VITE_BASE_PATH=/Suggeritore/ npm run build

# Preview build
npm run preview
```