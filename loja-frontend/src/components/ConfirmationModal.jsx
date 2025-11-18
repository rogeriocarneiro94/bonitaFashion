// Local: src/components/ConfirmationModal.jsx

import React from 'react';
import Modal from 'react-modal';
// 1. Importe o objeto de estilos que criamos
import { modalStyles } from './modalStyles';

function ConfirmationModal({ isOpen, onClose, onConfirm, title, message }) {
  return (
    <Modal
          isOpen={isOpen}
          onRequestClose={onClose}
          contentLabel={title}
          overlayClassName="ModalOverlay"
          className="ModalContent"
          closeTimeoutMS={200}
        >
      <>
        <h2 style={{ color: '#333', marginTop: 0 }}>{title}</h2>
        <p style={{ color: '#555' }}>{message}</p>

        <div className="confirmation-buttons">
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-danger" onClick={onConfirm}>
            Confirmar Exclusão
          </button>
        </div>
      </>

    </Modal>
  );
}

export default ConfirmationModal;