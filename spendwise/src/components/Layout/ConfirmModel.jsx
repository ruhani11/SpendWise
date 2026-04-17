import React, { useEffect } from "react";
import "./ConfirmModel.css";

export default function ConfirmModal({
  isOpen,
  title = "Confirm Action",
  message = "",
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  danger = true,
}) {
  // ESC close + body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onCancel?.();
    };

    document.addEventListener("keydown", onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const stop = (e) => e.stopPropagation();

  return (
    <div className="confirmBackdrop" onClick={onCancel} role="presentation">
      <div className="confirmModal" onClick={stop} role="dialog" aria-modal="true">
        <div className="confirmHeader">
          <h3 className="confirmTitle">{title}</h3>
        </div>

        <div className="confirmBody">
          <p className="confirmMessage">{message}</p>
        </div>

        <div className="confirmActions">
          <button type="button" className="confirmCancelBtn" onClick={onCancel}>
            {cancelText}
          </button>

          <button
            type="button"
            className={danger ? "confirmDeleteBtn" : "confirmPrimaryBtn"}
            onClick={onConfirm}
            autoFocus
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
