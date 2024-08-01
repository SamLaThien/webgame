import { Modal, Box, Typography, Button } from '@mui/material';

const UserDeleteModal = ({ user, onClose }) => {
  const handleDelete = () => {
    // Delete logic here
    onClose();
  };

  return (
    <Modal open onClose={onClose}>
      <Box sx={{ padding: 2, backgroundColor: 'white', margin: 'auto', maxWidth: 500 }}>
        <Typography variant="h6">Delete User</Typography>
        <Typography>Are you sure you want to delete {user.username}?</Typography>
        <Button onClick={handleDelete}>Delete</Button>
        <Button onClick={onClose}>Cancel</Button>
      </Box>
    </Modal>
  );
};

export default UserDeleteModal;
