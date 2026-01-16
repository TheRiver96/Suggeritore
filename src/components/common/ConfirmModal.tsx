import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onSave?: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  saveText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  onSave,
  title,
  message,
  confirmText = 'Conferma',
  cancelText = 'Annulla',
  saveText = 'Salva',
  variant = 'warning',
}: ConfirmModalProps) {
  const variantStyles = {
    danger: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <p className={`text-sm ${variantStyles[variant]}`}>{message}</p>

        <div className="flex gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="flex-1"
          >
            {cancelText}
          </Button>

          {onSave && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onSave();
                onClose();
              }}
              className="flex-1"
            >
              {saveText}
            </Button>
          )}

          <Button
            variant={variant === 'danger' ? 'danger' : 'secondary'}
            size="sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
