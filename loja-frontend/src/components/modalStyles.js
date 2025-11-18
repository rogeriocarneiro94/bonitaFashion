// Local: src/components/modalStyles.js

export const modalStyles = {
  // O fundo escurecido (Overlay)
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 2000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // O "card" branco do Modal (Content)
  content: {
    position: 'relative', // Importante para o overlay centralizar
    background: '#fff',
    borderRadius: '8px',
    padding: '30px',
    maxWidth: '500px',
    width: '90%',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
    border: 'none',
    color: 'black',
    // Reseta o posicionamento 'inline'
    top: 'auto',
    left: 'auto',
    right: 'auto',
    bottom: 'auto',
    margin: 0,
    overflowY: 'auto',
    maxHeight: '90vh',
  }
};