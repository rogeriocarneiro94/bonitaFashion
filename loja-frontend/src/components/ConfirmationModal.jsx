// Local: src/components/ConfirmationModal.jsx

import React from 'react';
import Modal from 'react-modal';

function ConfirmationModal({ isOpen, onClose, onConfirm, title, message }) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel={title}
      // Reutilizando o estilo do modal principal, mas um pouco menor
      style={{
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          width: '350px',
          padding: '30px',
          borderRadius: '8px'
        }
      }}
    >
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
    </Modal>
  );
}

export default ConfirmationModal;