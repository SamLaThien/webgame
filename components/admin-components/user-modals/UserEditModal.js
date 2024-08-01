import { useState } from 'react';
import { Modal, Box, TextField, Button, Typography } from '@mui/material';

const UserEditModal = ({ user, onClose }) => {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);

  const handleSave = () => {
    // Save logic here
    onClose();
  };

  return (
    <Modal open onClose={onClose}>
      <Box sx={{ padding: 2, backgroundColor: 'white', margin: 'auto', maxWidth: 500 }}>
        <Typography variant="h6">Edit User</Typography>
        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button onClick={handleSave}>Save</Button>
        <Button onClick={onClose}>Cancel</Button>
      </Box>
    </Modal>
  );
};

export default UserEditModal;
