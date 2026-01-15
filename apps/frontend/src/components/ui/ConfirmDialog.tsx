/**
 * Confirmation Dialog component replacing native window.confirm.
 */
import { Modal } from "./Modal";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isDestructive?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isDestructive = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          {isDestructive && (
            <div className="p-2 rounded-full bg-[var(--color-danger)]/10 text-[var(--color-danger)]">
              <AlertTriangle className="w-5 h-5" />
            </div>
          )}
          <p className="text-[var(--color-text-secondary)]">{description}</p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`btn ${isDestructive ? "btn-danger" : "btn-primary"}`}
          >
            Continue
          </button>
        </div>
      </div>
    </Modal>
  );
}
