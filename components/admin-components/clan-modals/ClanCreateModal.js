import { useState, useEffect } from 'react';
import { Modal, Button, TextField, CircularProgress, MenuItem, ListItemText } from '@mui/material';
import styled from 'styled-components';

const ModalContent = styled.div`
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #333;
`;

const Title = styled.h2`
  margin-bottom: 20px;
  color: #333;
`;

const StyledTextField = styled(TextField)`
  && {
    margin-bottom: 20px;
    width: 100%;
  }
`;

const StyledButton = styled(Button)`
  && {
    margin: 10px;
    background-color: #93B6C8;
    color: white;
    &:hover {
      background-color: #45a049;
    }
  }
`;

const ClanCreateModal = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [ownerUsername, setOwnerUsername] = useState('');
  const [ownerId, setOwnerId] = useState(null);
  const [money, setMoney] = useState(0);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clanId, setClanId] = useState('');

  useEffect(() => {
    if (ownerUsername) {
      setLoading(true);
      fetch(`/api/admin/search-user?username=${ownerUsername}`)
        .then(response => response.json())
        .then(data => {
          setMembers(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Lỗi khi tìm kiếm thành viên:', error);
          setLoading(false);
        });
    }
  }, [ownerUsername]);

  const handleSave = () => {
    if (!name || !ownerId || !clanId) {
      alert('ID bang hội, tên và chủ sở hữu là bắt buộc');
      return;
    }

    onSave({ id: clanId, name, owner: ownerId, clan_money: money });
  };

  return (
    <Modal open onClose={onClose}>
      <ModalContent>
        <Title>Tạo bang hội</Title>
        <StyledTextField
          label="ID bang hội"
          value={clanId}
          onChange={(e) => setClanId(e.target.value)}
          fullWidth
          margin="normal"
        />
        <StyledTextField
          label="Tên bang hội"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <StyledTextField
          label="Tên tài khoản chủ sở hữu"
          value={ownerUsername}
          onChange={(e) => setOwnerUsername(e.target.value)}
          fullWidth
          margin="normal"
        />
        {loading ? (
          <CircularProgress />
        ) : (
          members.map(member => (
            <MenuItem key={member.id} onClick={() => { setOwnerId(member.id); setOwnerUsername(member.username); }}>
              <ListItemText primary={member.username} />
            </MenuItem>
          ))
        )}
        <StyledTextField
          label="Ngân quỹ bang hội"
          type="number"
          value={money}
          onChange={(e) => setMoney(e.target.value)}
          fullWidth
          margin="normal"
        />
        <StyledButton onClick={handleSave} variant="contained">
          Lưu
        </StyledButton>
        <StyledButton onClick={onClose} variant="outlined" color="secondary">
          Hủy
        </StyledButton>
      </ModalContent>
    </Modal>
  );
};

export default ClanCreateModal;
