import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress } from '@mui/material';
import ClanDetailModal from './clan-modals/ClanDetailModal';
import ClanEditModal from './clan-modals/ClanEditModal';
import ClanDeleteModal from './clan-modals/ClanDeleteModal';
import ClanCreateModal from './clan-modals/ClanCreateModal';
import axios from 'axios';

const Container = styled.div`
  padding: 20px;
  background-color: none;
  height: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  color: #333;
`;

const StyledButton = styled(Button)`
  && {
    margin: 10px 0;
    background-color: #93B6C8;
    color: white;
    &:hover {
      background-color: #45a049;
    }
  }
`;

const ClanManagement = () => {
  const [clans, setClans] = useState([]);
  const [selectedClan, setSelectedClan] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClans = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      try {
        const response = await axios.get('/api/admin/clan', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClans(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching clans:', error);
        setLoading(false);
      }
    };

    fetchClans();
  }, []);

  const handleOpenModal = (clan, type) => {
    setSelectedClan(clan);
    setModalType(type);
  };

  const handleCloseModal = () => {
    setSelectedClan(null);
    setModalType(null);
  };

  const handleSaveClan = async (updatedFormData) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }
  
    try {
      const response = await axios.put(`/api/admin/clan/${selectedClan.id}`, updatedFormData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setClans(clans.map(clan => (clan.id === selectedClan.id ? { ...clan, ...response.data } : clan)));
      handleCloseModal();
    } catch (error) {
      console.error('Error updating clan:', error);
    }
  };
  

  const handleCreateClan = async (newClanFormData) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    try {
      const response = await axios.post(`/api/admin/clan`, newClanFormData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClans([...clans, response.data]);
      handleCloseModal();
    } catch (error) {
      console.error('Error creating clan:', error);
    }
  };

  const handleDeleteClan = async (clanId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    try {
      await axios.delete(`/api/admin/clan/${clanId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClans(clans.filter(clan => clan.id !== clanId));
    } catch (error) {
      console.error('Error deleting clan:', error);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container>
      <Title>Quản lý Bang hội</Title>
      <StyledButton onClick={() => handleOpenModal({}, 'create')}>Tạo Bang hội</StyledButton>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Tên Bang hội</TableCell>
              <TableCell>Chủ sở hữu</TableCell>
              <TableCell>Ngân quỹ</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clans.map((clan) => (
              <TableRow key={clan.id}>
                <TableCell>{clan.id}</TableCell>
                <TableCell>{clan.name}</TableCell>
                <TableCell>{clan.owner}</TableCell>
                <TableCell>{clan.accountant_id}</TableCell>
                <TableCell>
                  <Button onClick={() => handleOpenModal(clan, 'details')}>Chi tiết</Button>
                  <Button onClick={() => handleOpenModal(clan, 'edit')}>Chỉnh sửa</Button>
                  <Button onClick={() => handleOpenModal(clan, 'delete')}>Xóa</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {selectedClan && modalType === 'details' && (
        <ClanDetailModal clan={selectedClan} onClose={handleCloseModal} />
      )}
      {selectedClan && modalType === 'edit' && (
        <ClanEditModal clan={selectedClan} onClose={handleCloseModal} onSave={handleSaveClan} />
      )}
      {modalType === 'create' && (
        <ClanCreateModal onClose={handleCloseModal} onSave={handleCreateClan} />
      )}
      {selectedClan && modalType === 'delete' && (
        <ClanDeleteModal clan={selectedClan} onClose={handleCloseModal} onDelete={() => handleDeleteClan(selectedClan.id)} />
      )}
    </Container>
  );
};

export default ClanManagement;
