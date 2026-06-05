import type { ReactNode } from "react";

interface ConfirmDialogProps {
  title: string;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  danger = false,
  isPending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="dialog-backdrop" role="presentation">
      <div
        aria-modal="true"
        className="dialog-card"
        role="dialog"
        aria-label={title}
      >
        <div className="dialog-title">{title}</div>
        <div className="dialog-description">{description}</div>
        <div className="dialog-actions">
          <button
            className="ghost-button compact-button"
            disabled={isPending}
            onClick={onCancel}
            type="button"
          >
            {cancelLabel}
          </button>
          <button
            className={`compact-button ${danger ? "danger-solid-button" : "primary-button"}`}
            disabled={isPending}
            onClick={onConfirm}
            type="button"
          >
            {isPending ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
