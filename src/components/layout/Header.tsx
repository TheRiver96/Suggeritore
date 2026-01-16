import {
  Bars3Icon,
  DocumentTextIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
} from '@heroicons/react/24/outline';
import { useDocumentStore } from '@/store';
import { useBreakpoints } from '@/hooks';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { currentDocument, currentPage, totalPages, zoom, setCurrentPage, setZoom, prevPage, nextPage } =
    useDocumentStore();
  const { isMobile } = useBreakpoints();

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-2 sm:px-4 shadow-sm">
      {/* Left section */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Toggle sidebar"
        >
          <Bars3Icon className="w-6 h-6 text-gray-600" />
        </button>

        <div className="flex items-center gap-2">
          <DocumentTextIcon className="w-6 h-6 text-teatro-600" />
          {!isMobile && <h1 className="text-lg font-semibold text-gray-900">Suggeritore</h1>}
        </div>
      </div>

      {/* Center section - Document name & navigation */}
      {currentDocument && (
        <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-center">
          {/* Document name - hide su mobile */}
          {!isMobile && (
            <span className="text-sm text-gray-600 truncate max-w-[150px] sm:max-w-[200px]">
              {currentDocument.name}
            </span>
          )}

          {totalPages > 0 && (
            <div className="flex items-center gap-1 sm:gap-2 bg-gray-100 rounded-lg px-1 sm:px-2 py-1">
              <button
                onClick={prevPage}
                disabled={currentPage <= 1}
                className="p-2 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Pagina precedente"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1 text-sm">
                <input
                  type="number"
                  value={currentPage}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    if (!isNaN(value) && value >= 1 && value <= totalPages) {
                      setCurrentPage(value);
                    }
                  }}
                  min={1}
                  max={totalPages}
                  className="w-10 sm:w-12 text-center bg-white border border-gray-300 rounded px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-teatro-500"
                  aria-label="Numero pagina"
                />
                <span className="text-gray-500 text-xs sm:text-sm">/ {totalPages}</span>
              </div>

              <button
                onClick={nextPage}
                disabled={currentPage >= totalPages}
                className="p-2 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Pagina successiva"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Right section - Zoom controls */}
      {currentDocument && (
        <div className="flex items-center gap-1 sm:gap-2 bg-gray-100 rounded-lg px-1 sm:px-2 py-1">
          <button
            onClick={() => setZoom(zoom - 0.1)}
            disabled={zoom <= 0.5}
            className="p-2 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Diminuisci zoom"
          >
            <MagnifyingGlassMinusIcon className="w-5 h-5" />
          </button>

          {/* Nascondi percentuale su mobile piccolo */}
          {!isMobile && (
            <span className="text-xs sm:text-sm text-gray-600 min-w-[40px] sm:min-w-[45px] text-center">
              {Math.round(zoom * 100)}%
            </span>
          )}

          <button
            onClick={() => setZoom(zoom + 0.1)}
            disabled={zoom >= 3}
            className="p-2 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Aumenta zoom"
          >
            <MagnifyingGlassPlusIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Placeholder when no document */}
      {!currentDocument && <div className="w-12 sm:w-24" />}
    </header>
  );
}
