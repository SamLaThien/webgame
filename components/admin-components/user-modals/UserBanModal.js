import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';

const UserBanModal = ({ user, onClose, onSave }) => {
  const handleBan = () => {
    onSave({ ...user, ban: user.ban === 1 ? 0 : 1 });
    onClose();
  };

  return (
    <Modal open={true} onClose={onClose}>
      <Box p={3} bgcolor="white" borderRadius={3} maxWidth={500} mx="auto" mt={10}>
        <Typography variant="h6" gutterBottom>
          {user.ban === 1 ? 'Unban User' : 'Ban User'}
        </Typography>
        <Typography variant="body1" gutterBottom>
          Are you sure you want to {user.ban === 1 ? 'unban' : 'ban'} {user.username}?
        </Typography>
        <Box mt={2} display="flex" justifyContent="space-between">
          <Button variant="contained" color="primary" onClick={handleBan}>
            {user.ban === 1 ? 'Unban' : 'Ban'}
          </Button>
          <Button variant="contained" color="secondary" onClick={onClose}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default UserBanModal;
