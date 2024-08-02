// components/admin-components/clan-modals/ClanDeleteModal.js
import React from 'react';
import { Modal, Button } from '@mui/material';

const ClanDeleteModal = ({ clan, onClose, onDelete }) => {
  return (
    <Modal open={!!clan} onClose={onClose}>
      <div>
        <h2>Confirm Delete</h2>
        <p>Are you sure you want to delete the clan &quot;{clan.name}&quot;?</p>
        <Button onClick={() => onDelete(clan.id)}>Delete</Button>
        <Button onClick={onClose}>Cancel</Button>
      </div>
    </Modal>
  );
};

export default ClanDeleteModal;
