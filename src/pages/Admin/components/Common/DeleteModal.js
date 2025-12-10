import React from 'react';
import './DeleteModal.css';

const DeleteModal = ({ isOpen, onClose, onConfirm, itemName, type }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content delete-modal">
        <h3>Confirm Delete</h3>
        <p>Are you sure you want to delete this {type}?</p>
        {itemName && <p className="item-name">{itemName}</p>}
        <p className="warning-text">This action cannot be undone.</p>
        <div className="modal-actions">
          <button 
            className="btn-danger"
            onClick={onConfirm}
          >
            Delete
          </button>
          <button 
            className="btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal; 