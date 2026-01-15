# Suggeritore 🎭

**App per lo studio di copioni teatrali** - Una web application che permette ad attori e registi di annotare copioni con memo vocali.

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

```bash
# Clona il repository
git clone https://github.com/TheRiver96/suggeritore.git
cd suggeritore

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

| Browser | Supporto |
|---------|----------|
| Chrome  | ✅ Pieno |
| Firefox | ✅ Pieno |
| Edge    | ✅ Pieno |
| Safari  | ⚠️ Parziale (verificare MediaRecorder) |

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
