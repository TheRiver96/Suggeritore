# Suggeritore - App per lo Studio di Copioni Teatrali

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
- Chrome/Edge: pieno supporto
- Firefox: pieno supporto
- Safari: verificare MediaRecorder (potrebbe richiedere polyfill)

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

### Fase 2: Miglioramenti (da implementare)
- [ ] Supporto EPUB
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

### Dipendenze Aggiunte
- `uuid` - Generazione ID univoci
- `react-pdf` v10 - Visualizzazione PDF
- `pdfjs-dist` - Worker PDF
- `epubjs` - (predisposto per Fase 2)
- `@headlessui/react` - Componenti UI accessibili
- `@heroicons/react` - Icone

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
2. Testare deployment su GitHub Pages dopo il push
3. Creare prima release (v1.0.0) per testare artifact workflow
4. Implementare supporto EPUB (Fase 2)
5. Aggiungere sistema tag con autocomplete
6. Implementare export/import annotazioni

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

### Build Locale

```bash
# Build produzione
npm run build

# Build per GitHub Pages
VITE_BASE_PATH=/Suggeritore/ npm run build

# Preview build
npm run preview
```