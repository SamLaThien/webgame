import { Modal, Box, Typography, Button } from '@mui/material';

const UserBanModal = ({ user, onClose }) => {
  const handleBan = () => {
    // Ban logic here
    onClose();
  };

  return (
    <Modal open onClose={onClose}>
      <Box sx={{ padding: 2, backgroundColor: 'white', margin: 'auto', maxWidth: 500 }}>
        <Typography variant="h6">Ban User</Typography>
        <Typography>Are you sure you want to ban {user.username}?</Typography>
        <Button onClick={handleBan}>Ban</Button>
        <Button onClick={onClose}>Cancel</Button>
      </Box>
    </Modal>
  );
};

export default UserBanModal;
