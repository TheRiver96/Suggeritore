import { useState, useEffect } from 'react';
import {
  FolderIcon,
  ChatBubbleLeftEllipsisIcon,
  TagIcon,
  TrashIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';
import { useDocumentStore, useAnnotationStore, selectFilteredAnnotations } from '@/store';
import { FileUploader } from '@/components/common';
import { formatDateShort, formatDuration } from '@/utils';
import { useBreakpoints } from '@/hooks';
import type { Document } from '@/types';

type SidebarTab = 'documents' | 'annotations';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('documents');
  const { isDesktop } = useBreakpoints();

  const {
    documents,
    currentDocument,
    currentPage,
    loadDocuments,
    addDocument,
    setCurrentDocument,
    setCurrentPage,
    removeDocument,
    isLoading,
  } = useDocumentStore();

  const annotationStore = useAnnotationStore();
  const filteredAnnotations = selectFilteredAnnotations(annotationStore);
  const { setSelectedAnnotation, deleteAnnotation, searchQuery, setSearchQuery, highlightAnnotationTemporarily, setHighlightedAnnotationId } = annotationStore;

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleFileSelect = async (file: File) => {
    const doc = await addDocument(file);
    setCurrentDocument(doc);
    setActiveTab('documents');
  };

  const handleDocumentClick = (doc: Document) => {
    setCurrentDocument(doc);
    // Chiudi la sidebar su mobile dopo aver selezionato un documento
    if (!isDesktop) {
      onClose();
    }
  };

  const handleDeleteDocument = async (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    if (confirm('Sei sicuro di voler eliminare questo documento e tutte le sue annotazioni?')) {
      await removeDocument(docId);
    }
  };

  const handleDeleteAnnotation = async (e: React.MouseEvent, annotationId: string) => {
    e.stopPropagation();
    if (confirm('Sei sicuro di voler eliminare questa annotazione?')) {
      await deleteAnnotation(annotationId);
    }
  };

  const handleAnnotationClick = (annotation: typeof filteredAnnotations[0]) => {
    // Se l'annotazione è su una pagina diversa, naviga a quella pagina
    if (annotation.location.page && annotation.location.page !== currentPage) {
      setCurrentPage(annotation.location.page);
      // Evidenzia temporaneamente l'annotazione dopo il cambio pagina
      setTimeout(() => {
        highlightAnnotationTemporarily(annotation.id, 2500);
      }, 600); // Aspetta che la pagina sia renderizzata
    } else {
      // Stessa pagina: evidenzia subito
      highlightAnnotationTemporarily(annotation.id, 2500);
    }
    setSelectedAnnotation(annotation);
    // Chiudi la sidebar su mobile dopo aver selezionato un'annotazione
    if (!isDesktop) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <aside
      className={`
        bg-white border-r border-gray-200 flex flex-col h-full
        ${isDesktop
          ? 'w-80 relative'
          : 'fixed left-0 top-14 bottom-0 w-80 z-50 shadow-2xl transition-transform duration-300'
        }
        ${!isDesktop && !isOpen ? '-translate-x-full' : 'translate-x-0'}
      `}
    >
      {/* Tabs - Touch friendly con min-height 44px */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('documents')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] text-sm font-medium transition-colors
            ${
              activeTab === 'documents'
                ? 'text-teatro-600 border-b-2 border-teatro-600 bg-teatro-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
        >
          <FolderIcon className="w-5 h-5" />
          <span className={isDesktop ? '' : 'text-base'}>Documenti</span>
        </button>
        <button
          onClick={() => setActiveTab('annotations')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] text-sm font-medium transition-colors
            ${
              activeTab === 'annotations'
                ? 'text-teatro-600 border-b-2 border-teatro-600 bg-teatro-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
        >
          <ChatBubbleLeftEllipsisIcon className="w-5 h-5" />
          <span className={isDesktop ? '' : 'text-base'}>Annotazioni</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <FileUploader onFileSelect={handleFileSelect} />

            {isLoading && (
              <div className="text-center text-gray-500 py-4">Caricamento...</div>
            )}

            {documents.length === 0 && !isLoading && (
              <p className="text-center text-gray-500 text-sm py-4">
                Nessun documento caricato
              </p>
            )}

            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => handleDocumentClick(doc)}
                  className={`
                    group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors
                    ${
                      currentDocument?.id === doc.id
                        ? 'bg-teatro-100 border border-teatro-300'
                        : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                    }
                  `}
                >
                  <DocumentIcon
                    className={`w-8 h-8 flex-shrink-0 ${
                      currentDocument?.id === doc.id ? 'text-teatro-600' : 'text-gray-400'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatDateShort(new Date(doc.uploadedAt))} •{' '}
                      {doc.type.toUpperCase()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteDocument(e, doc.id)}
                    className={`p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center
                      ${isDesktop ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}
                    `}
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'annotations' && (
          <div className="space-y-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Cerca nelle annotazioni..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teatro-500 focus:border-transparent"
            />

            {!currentDocument && (
              <p className="text-center text-gray-500 text-sm py-4">
                Seleziona un documento per vedere le annotazioni
              </p>
            )}

            {currentDocument && filteredAnnotations.length === 0 && (
              <p className="text-center text-gray-500 text-sm py-4">
                Nessuna annotazione trovata
              </p>
            )}

            <div className="space-y-2">
              {filteredAnnotations.map((annotation) => (
                <div
                  key={annotation.id}
                  onClick={() => handleAnnotationClick(annotation)}
                  onMouseEnter={() => {
                    // Evidenzia l'highlight solo se siamo sulla stessa pagina
                    if (annotation.location.page === currentPage) {
                      setHighlightedAnnotationId(annotation.id);
                    }
                  }}
                  onMouseLeave={() => setHighlightedAnnotationId(null)}
                  className="group p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors border-l-4"
                  style={{ borderLeftColor: annotation.color }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-gray-900 line-clamp-2 flex-1">{annotation.selectedText}</p>
                    <button
                      onClick={(e) => handleDeleteAnnotation(e, annotation.id)}
                      className={`p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center
                        ${isDesktop ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}
                      `}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    {annotation.location.page && (
                      <span className="text-xs text-gray-500">
                        Pag. {annotation.location.page}
                      </span>
                    )}

                    {annotation.audioMemo && (
                      <span className="text-xs text-teatro-600 flex items-center gap-1">
                        <ChatBubbleLeftEllipsisIcon className="w-3 h-3" />
                        {formatDuration(annotation.audioMemo.duration)}
                      </span>
                    )}

                    {annotation.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-gray-200 text-gray-700 rounded"
                      >
                        <TagIcon className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
