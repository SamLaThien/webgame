import { Modal, Box, Typography, Button } from '@mui/material';

const ClanDeleteModal = ({ clan, onClose, onDelete }) => {
  return (
    <Modal open onClose={onClose}>
      <Box p={3} bgcolor="white" borderRadius={4}>
        <h2>Delete Clan</h2>
        <Typography>Are you sure you want to delete the clan "{clan.name}"?</Typography>
        <Box mt={2}>
          <Button onClick={onDelete} variant="contained" color="primary">
            Yes
          </Button>
          <Button onClick={onClose} variant="contained" color="secondary" style={{ marginLeft: '10px' }}>
            No
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ClanDeleteModal;
