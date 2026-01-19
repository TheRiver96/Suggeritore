import { useDocumentStore } from '@/store';
import { PDFReader } from './PDFReader';
import { EPUBReader } from './EPUBReader';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

export function DocumentViewer() {
  const { currentDocument } = useDocumentStore();

  if (!currentDocument) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50 text-center p-8">
        <DocumentTextIcon className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Nessun documento selezionato
        </h2>
        <p className="text-gray-500 max-w-md">
          Carica un PDF o EPUB dalla sidebar per iniziare a studiare il tuo copione.
          Potrai selezionare il testo e aggiungere memo vocali.
        </p>
      </div>
    );
  }

  if (currentDocument.type === 'pdf') {
    return <PDFReader document={currentDocument} />;
  }

  if (currentDocument.type === 'epub') {
    return <EPUBReader document={currentDocument} />;
  }

  return null;
}
