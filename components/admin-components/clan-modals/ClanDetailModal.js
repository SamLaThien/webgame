import { Modal, Box, Typography, Button } from '@mui/material';
import styled from 'styled-components';

const StyledBox = styled(Box)`
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  max-width: 500px;
  margin: 0 auto;
`;

const StyledButton = styled(Button)`
  && {
    background-color: #93B6C8;
    color: white;
    &:hover {
      background-color: #45a049;
    }
  }
`;

const ClanDetailModal = ({ clan, onClose }) => {
  return (
    <Modal open onClose={onClose}>
      <StyledBox>
        <Typography variant="h5" gutterBottom>
          Chi tiết Bang hội
        </Typography>
        <Typography>ID: {clan.id}</Typography>
        <Typography>Tên: {clan.name}</Typography>
        <Typography>Chủ sở hữu: {clan.owner}</Typography>
        <Typography>Kế toán: {clan.accountant_id}</Typography>
        <Typography>Ngân quỹ: {clan.clan_money}</Typography>
        <Typography>Mana: {clan.clan_mana}</Typography>
        <Typography>Màu sắc: {clan.clan_color}</Typography>
        {clan.clan_icon && <img src={clan.clan_icon} alt="Clan Icon" style={{ width: '100px', height: '100px' }} />}
        <Box mt={2}>
          <StyledButton onClick={onClose} variant="contained">
            Đóng
          </StyledButton>
        </Box>
      </StyledBox>
    </Modal>
  );
};

export default ClanDetailModal;
