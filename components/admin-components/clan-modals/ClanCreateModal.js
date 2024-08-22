import { useState, useEffect } from 'react';
import { Modal, Button, TextField, CircularProgress, MenuItem } from '@mui/material';
import styled from 'styled-components';
import axios from 'axios';

const ModalContent = styled.div`
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  color: #333;
`;

const Title = styled.h2`
  margin-bottom: 20px;
  color: #333;
  text-align: center;
`;

const FieldContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: space-between;
`;

const HalfWidthTextField = styled(TextField)`
  flex: 1;
  min-width: 45%;
`;

const StyledButton = styled(Button)`
  && {
    margin: 20px 0 10px 0;
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
  const [accountantUsername, setAccountantUsername] = useState('');
  const [ownerId, setOwnerId] = useState(null);
  const [accountantId, setAccountantId] = useState(null);
  const [money, setMoney] = useState(0);
  const [clanMana, setClanMana] = useState(10000000);  // Default 10 million mana
  const [clanColor, setClanColor] = useState('');
  const [clanIconFile, setClanIconFile] = useState(null);
  const [clanPassword, setClanPassword] = useState('');
  const [ownerSearchResults, setOwnerSearchResults] = useState([]);
  const [accountantSearchResults, setAccountantSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clanId, setClanId] = useState('');

  useEffect(() => {
    const fetchOwnerResults = async () => {
      if (ownerUsername) {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
          const response = await axios.get(`/api/admin/search-user?username=${ownerUsername}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setOwnerSearchResults(response.data);
        } catch (error) {
          console.error('Error searching for owner:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOwnerResults();
  }, [ownerUsername]);

  useEffect(() => {
    const fetchAccountantResults = async () => {
      if (accountantUsername) {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
          const response = await axios.get(`/api/admin/search-user?username=${accountantUsername}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setAccountantSearchResults(response.data);
        } catch (error) {
          console.error('Error searching for accountant:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAccountantResults();
  }, [accountantUsername]);

  const handleSave = async () => {
    if (!name || !ownerId || !clanId || !accountantId || !clanColor || !clanIconFile || !clanPassword) {
      alert('ID bang hội, tên, chủ sở hữu, kế toán, màu sắc bang hội, biểu tượng và mật khẩu là bắt buộc');
      return;
    }

    const formData = new FormData();
    formData.append('id', clanId);
    formData.append('name', name);
    formData.append('owner', ownerId);
    formData.append('clan_money', money);
    formData.append('clan_mana', clanMana);
    formData.append('accountant_id', accountantId);
    formData.append('clan_color', clanColor);
    formData.append('clan_icon', clanIconFile);
    formData.append('password', clanPassword);

    const token = localStorage.getItem('token');
    if (!token) {
      alert('User is not authenticated');
      return;
    }

    try {
      await axios.post('/api/admin/clan', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      onSave(); // Call onSave to update the parent component after successful save
    } catch (error) {
      console.error('Error saving clan:', error);
      alert('Lỗi khi lưu bang hội');
    }
  };

  return (
    <Modal open onClose={onClose}>
      <ModalContent>
        <Title>Tạo bang hội</Title>
        <FieldContainer>
          <HalfWidthTextField
            label="ID bang hội"
            value={clanId}
            onChange={(e) => setClanId(e.target.value)}
            margin="normal"
          />
          <HalfWidthTextField
            label="Tên bang hội"
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
          />
        </FieldContainer>
        <FieldContainer>
          <HalfWidthTextField
            label="Tên tài khoản chủ sở hữu"
            value={ownerUsername}
            onChange={(e) => setOwnerUsername(e.target.value)}
            margin="normal"
          />
          {loading && ownerUsername ? (
            <CircularProgress />
          ) : (
            <HalfWidthTextField
              label="Chọn chủ sở hữu"
              select
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              margin="normal"
            >
              {ownerSearchResults.map(member => (
                <MenuItem key={member.id} value={member.id}>
                  {member.username}
                </MenuItem>
              ))}
            </HalfWidthTextField>
          )}
        </FieldContainer>
        <FieldContainer>
          <HalfWidthTextField
            label="Tên tài khoản kế toán"
            value={accountantUsername}
            onChange={(e) => setAccountantUsername(e.target.value)}
            margin="normal"
          />
          {loading && accountantUsername ? (
            <CircularProgress />
          ) : (
            <HalfWidthTextField
              label="Chọn kế toán"
              select
              value={accountantId}
              onChange={(e) => setAccountantId(e.target.value)}
              margin="normal"
            >
              {accountantSearchResults.map(member => (
                <MenuItem key={member.id} value={member.id}>
                  {member.username}
                </MenuItem>
              ))}
            </HalfWidthTextField>
          )}
        </FieldContainer>
        <FieldContainer>
          <HalfWidthTextField
            label="Ngân quỹ bang hội"
            type="number"
            value={money}
            onChange={(e) => setMoney(e.target.value)}
            margin="normal"
          />
          <HalfWidthTextField
            label="Mana của bang hội"
            type="number"
            value={clanMana}
            onChange={(e) => setClanMana(e.target.value)}
            margin="normal"
          />
        </FieldContainer>
        <FieldContainer>
          <HalfWidthTextField
            label="Màu sắc bang hội"
            value={clanColor}
            onChange={(e) => setClanColor(e.target.value)}
            margin="normal"
          />
          <input
            type="file"
            onChange={(e) => setClanIconFile(e.target.files[0])}
            accept="image/*"
            style={{ marginTop: '16px', flex: 1 }}
          />
        </FieldContainer>
        <FieldContainer>
          <HalfWidthTextField
            label="Mật khẩu bang hội"
            type="password"
            value={clanPassword}
            onChange={(e) => setClanPassword(e.target.value)}
            margin="normal"
          />
        </FieldContainer>
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
