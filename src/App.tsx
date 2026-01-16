import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout';
import { DocumentViewer } from '@/components/reader';
import { checkStorageAvailability } from '@/services/storage';

function App() {
  const [storageWarning, setStorageWarning] = useState<string | null>(null);

  useEffect(() => {
    // Rileva Safari iOS
    const isSafariIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) &&
                        /Safari/.test(navigator.userAgent) &&
                        !/CriOS|FxiOS|EdgiOS/.test(navigator.userAgent);

    if (isSafariIOS) {
      setStorageWarning(
        'Safari iOS non è supportato. Usa Chrome, Firefox o Edge per iOS per la migliore esperienza.'
      );
      return;
    }

    // Verifica disponibilità storage all'avvio (importante per Safari privato)
    checkStorageAvailability().then((result) => {
      console.log('Storage driver:', result.driver);

      if (!result.available) {
        setStorageWarning(
          'Storage non disponibile. Se stai usando Safari in modalità privata, passa alla navigazione normale.'
        );
      } else if (result.driver === 'localStorage') {
        setStorageWarning(
          'Storage limitato rilevato. L\'app potrebbe avere limitazioni nel salvataggio di file grandi.'
        );
      }
    });
  }, []);

  return (
    <MainLayout>
      {storageWarning && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 max-w-md mx-auto p-4 bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-yellow-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-yellow-800">{storageWarning}</p>
            </div>
            <button
              onClick={() => setStorageWarning(null)}
              className="flex-shrink-0 text-yellow-600 hover:text-yellow-800"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
      <DocumentViewer />
    </MainLayout>
  );
}

export default App;
