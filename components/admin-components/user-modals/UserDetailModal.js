import { Modal, Box, Typography, Button } from '@mui/material';

const UserDetailModal = ({ user, onClose }) => {
  return (
    <Modal open onClose={onClose}>
      <Box sx={{ padding: 2, backgroundColor: 'white', margin: 'auto', maxWidth: 500 }}>
        <Typography variant="h6">User Details</Typography>
        <Typography>ID: {user.id}</Typography>
        <Typography>Username: {user.username}</Typography>
        <Typography>Email: {user.email}</Typography>
        <Typography>Role: {user.role}</Typography>
        <Button onClick={onClose}>Close</Button>
      </Box>
    </Modal>
  );
};

export default UserDetailModal;
