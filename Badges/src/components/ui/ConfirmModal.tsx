import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  loading?: boolean;
  children?: React.ReactNode;
}

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'danger',
  loading = false,
  children,
}: ConfirmModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col gap-4">
        <div className={`flex items-start gap-3 p-4 rounded-lg ${variant === 'danger' ? 'bg-red-50' : 'bg-amber-50'}`}>
          <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${variant === 'danger' ? 'text-red-500' : 'text-amber-500'}`} />
          <p className={`text-sm ${variant === 'danger' ? 'text-red-700' : 'text-amber-700'}`}>{message}</p>
        </div>
        {children}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>{cancelLabel}</Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        </div>
      </div>
    </Modal>
  );
};
