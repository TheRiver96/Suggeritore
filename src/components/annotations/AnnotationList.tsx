import { useAnnotationStore, useDocumentStore, selectFilteredAnnotations } from '@/store';
import { AnnotationCard } from './AnnotationCard';
import type { Annotation } from '@/types';

export function AnnotationList() {
  const annotationStore = useAnnotationStore();
  const filteredAnnotations = selectFilteredAnnotations(annotationStore);
  const { selectedAnnotation, setSelectedAnnotation, deleteAnnotation, highlightAnnotationTemporarily } = annotationStore;
  const { currentPage, setCurrentPage } = useDocumentStore();

  const handleAnnotationClick = (annotation: Annotation) => {
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
  };

  const handleDelete = async (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questa annotazione?')) {
      await deleteAnnotation(id);
    }
  };

  if (filteredAnnotations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nessuna annotazione trovata</p>
        <p className="text-sm mt-1">Seleziona del testo nel documento per crearne una</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredAnnotations.map((annotation) => (
        <AnnotationCard
          key={annotation.id}
          annotation={annotation}
          isSelected={selectedAnnotation?.id === annotation.id}
          onClick={() => handleAnnotationClick(annotation)}
          onDelete={() => handleDelete(annotation.id)}
        />
      ))}
    </div>
  );
}
