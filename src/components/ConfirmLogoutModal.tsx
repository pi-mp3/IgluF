import React from "react";

interface ConfirmLogoutModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmLogoutModal: React.FC<ConfirmLogoutModalProps> = ({
  open,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2 className="modal-title">¿Cerrar sesión?</h2>
        <p className="modal-text">
          Se cerrará tu sesión actual en Iglú. Podrás volver a iniciar sesión
          cuando quieras usando tu correo y contraseña.
        </p>

        <div className="modal-actions">
          <button
            type="button"
            className="modal-btn modal-btn-cancel"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="modal-btn modal-btn-danger"
            onClick={onConfirm}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmLogoutModal;
