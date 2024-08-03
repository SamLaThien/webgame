// components/admin-components/clan-modals/ClanDeleteModal.js
import React from 'react';
import { Modal, Button, Typography } from '@mui/material';
import { styled } from '@mui/system';

const StyledModalContent = styled('div')`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  margin: 50px auto;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const StyledButton = styled(Button)`
  margin-top: 20px;
  &:first-of-type {
    background-color: #93b6c8;
    margin-right: 10px;
  }
  &:last-of-type {
    background-color: #b3d7e8;
  }
`;

const ClanDeleteModal = ({ clan, onClose, onDelete }) => {
  return (
    <Modal open={!!clan} onClose={onClose}>
      <StyledModalContent>
        <Typography variant="h5" gutterBottom>
          Xác nhận xóa
        </Typography>
        <Typography variant="body1" gutterBottom>
          Bạn có chắc chắn muốn xóa bang &quot;{clan.name}&quot;?
        </Typography>
        <div>
          <StyledButton onClick={() => onDelete(clan.id)} variant="contained" color="primary">
            Xóa
          </StyledButton>
          <StyledButton onClick={onClose} variant="contained" color="secondary">
            Hủy
          </StyledButton>
        </div>
      </StyledModalContent>
    </Modal>
  );
};

export default ClanDeleteModal;
