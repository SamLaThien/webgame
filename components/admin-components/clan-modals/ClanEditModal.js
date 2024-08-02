import { useState } from 'react';
import { Modal, Box, TextField, Button } from '@mui/material';

const ClanEditModal = ({ clan, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    id: clan.id,
    name: clan.name,
    owner: clan.owner
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Modal open onClose={onClose}>
      <Box p={3} bgcolor="white" borderRadius={4}>
        <h2>Edit Clan</h2>
        <TextField
          label="ID"
          name="id"
          value={formData.id}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Owner"
          name="owner"
          value={formData.owner}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <Box mt={2}>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
          <Button onClick={onClose} variant="contained" color="secondary" style={{ marginLeft: '10px' }}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ClanEditModal;
