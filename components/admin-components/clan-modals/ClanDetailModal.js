import { Modal, Box, Typography, Button } from '@mui/material';

const ClanDetailModal = ({ clan, onClose }) => {
  return (
    <Modal open onClose={onClose}>
      <Box p={3} bgcolor="white" borderRadius={4}>
        <h2>Clan Details</h2>
        <Typography>ID: {clan.id}</Typography>
        <Typography>Name: {clan.name}</Typography>
        <Typography>Owner: {clan.owner}</Typography>
        <Box mt={2}>
          <Button onClick={onClose} variant="contained" color="secondary">
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ClanDetailModal;
