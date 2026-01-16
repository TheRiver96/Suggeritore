# Suggeritore 🎭

**App per lo studio di copioni teatrali** - Una web application che permette ad attori e registi di annotare copioni con memo vocali.

[![Deploy to GitHub Pages](https://github.com/TheRiver96/Suggeritore/actions/workflows/deploy.yml/badge.svg)](https://github.com/TheRiver96/Suggeritore/actions/workflows/deploy.yml)
[![GitHub release](https://img.shields.io/github/v/release/TheRiver96/Suggeritore)](https://github.com/TheRiver96/Suggeritore/releases)

## 🌐 Demo Live

**[Prova l'app online →](https://TheRiver96.github.io/Suggeritore/)**

Nessuna installazione richiesta! Puoi iniziare subito a studiare i tuoi copioni.

## Funzionalità

- **Caricamento PDF** - Importa copioni in formato PDF
- **Selezione testo** - Seleziona battute o porzioni di testo
- **Memo vocali** - Registra note audio collegate al testo selezionato
- **Annotazioni** - Organizza le tue note con tag e colori
- **Ricerca** - Trova rapidamente le annotazioni per testo o tag
- **Storage locale** - Tutti i dati salvati nel browser (IndexedDB)

## Screenshot

*Coming soon*

## Tecnologie

- **React 18** + **TypeScript**
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **react-pdf** - Visualizzazione PDF
- **localforage** - Persistenza dati (IndexedDB)
- **MediaRecorder API** - Registrazione audio

## Installazione

### Opzione 1: Usa Online (Raccomandato)

Semplicemente visita **[https://TheRiver96.github.io/Suggeritore/](https://TheRiver96.github.io/Suggeritore/)**

### Opzione 2: Download Offline

1. Vai alla pagina [Releases](https://github.com/TheRiver96/Suggeritore/releases)
2. Scarica il file `suggeritore-vX.X.X.zip` dell'ultima versione
3. Estrai l'archivio in una cartella locale
4. Avvia un server HTTP nella cartella estratta:
   ```bash
   # Con Python 3:
   python -m http.server 8000

   # Con Node.js (se hai npx):
   npx serve

   # Con PHP:
   php -S localhost:8000
   ```
5. Apri il browser su `http://localhost:8000`

### Opzione 3: Sviluppo Locale

```bash
# Clona il repository
git clone https://github.com/TheRiver96/Suggeritore.git
cd Suggeritore

# Installa le dipendenze
npm install

# Avvia in modalità sviluppo
npm run dev
```

L'applicazione sarà disponibile su `http://localhost:5173/`

## Utilizzo

1. **Carica un copione** - Clicca su "Carica Documento" e seleziona un file PDF
2. **Seleziona il testo** - Evidenzia una battuta o porzione di testo
3. **Registra un memo** - Nel popup che appare, clicca "Registra" per aggiungere una nota vocale
4. **Riascolta** - Le annotazioni appaiono nella sidebar, clicca per riprodurre l'audio
5. **Organizza** - Usa i tag per categorizzare le note (es. "atto1", "monologo", "emozione")

## Struttura del Progetto

```
suggeritore/
├── src/
│   ├── components/     # Componenti React
│   │   ├── layout/     # Header, Sidebar, MainLayout
│   │   ├── reader/     # PDFReader, DocumentViewer
│   │   ├── audio/      # VoiceRecorder, AudioPlayer
│   │   ├── annotations/# AnnotationList, AnnotationEditor
│   │   └── common/     # Button, Modal, FileUploader
│   ├── hooks/          # Custom hooks
│   ├── store/          # Zustand stores
│   ├── services/       # Storage e servizi
│   ├── types/          # TypeScript types
│   └── utils/          # Utility functions
```

## Roadmap

### Completato

- [x] Visualizzazione PDF con navigazione e zoom
- [x] Selezione testo e creazione annotazioni
- [x] Registrazione e riproduzione memo vocali
- [x] Lista annotazioni con ricerca
- [x] Storage persistente locale

### In sviluppo

- [ ] Supporto EPUB
- [ ] Sistema tag con autocomplete
- [ ] Export/Import annotazioni (JSON)
- [ ] Visualizzazione waveform audio

### Futuro

- [ ] PWA con supporto offline
- [ ] Modalità "Prova" (autoplay sequenziale)
- [ ] Statistiche di studio

## Compatibilità Browser

### Desktop
| Browser | Supporto |
|---------|----------|
| Chrome  | ✅ Pieno |
| Firefox | ✅ Pieno |
| Edge    | ✅ Pieno |
| Safari  | ⚠️ Parziale (verificare MediaRecorder) |

### Mobile
| Browser | Supporto |
|---------|----------|
| Chrome iOS | ✅ Pieno |
| Firefox iOS | ✅ Pieno |
| Edge iOS | ✅ Pieno |
| **Safari iOS** | ❌ **NON SUPPORTATO** |

**Nota importante per utenti iOS**: Safari iOS ha limitazioni critiche su File API e IndexedDB. Si raccomanda di usare Chrome, Firefox o Edge per iOS.

## Deployment

Il progetto usa GitHub Actions per il deployment automatico:

### GitHub Pages (Automatico)

Il sito viene deployato automaticamente su GitHub Pages ad ogni push sul branch `main`:
- URL: https://TheRiver96.github.io/Suggeritore/
- Workflow: [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)

### Release con Artifacts

Per creare una nuova release con build scaricabile:

```bash
# Crea e pusha un tag versione
git tag v1.0.0
git push --tags
```

Questo attiverà automaticamente il workflow [`.github/workflows/release.yml`](.github/workflows/release.yml) che:
1. Builda il progetto
2. Crea un file ZIP con i build artifacts
3. Crea una GitHub Release con il file scaricabile

### Build Locale

Per buildare in locale:

```bash
# Build per produzione (senza base path)
npm run build

# Build per GitHub Pages (con base path)
VITE_BASE_PATH=/Suggeritore/ npm run build

# Preview del build
npm run preview
```

Il build genera i file ottimizzati nella cartella `dist/`.

## Contribuire

I contributi sono benvenuti! Per favore:

1. Fai un fork del repository
2. Crea un branch per la tua feature (`git checkout -b feature/nuova-funzionalita`)
3. Committa le modifiche (`git commit -m 'Aggiunge nuova funzionalità'`)
4. Pusha il branch (`git push origin feature/nuova-funzionalita`)
5. Apri una Pull Request

## Licenza

MIT License - vedi [LICENSE](LICENSE) per dettagli.

## Autore

Creato con ❤️ per la comunità teatrale italiana.

---

*"Il teatro è poesia che esce da un libro per farsi umana." - Federico García Lorca*
