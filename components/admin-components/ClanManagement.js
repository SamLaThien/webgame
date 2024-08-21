import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress } from '@mui/material';
import ClanDetailModal from './clan-modals/ClanDetailModal';
import ClanEditModal from './clan-modals/ClanEditModal';
import ClanDeleteModal from './clan-modals/ClanDeleteModal';
import ClanCreateModal from './clan-modals/ClanCreateModal';

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
    fetch('/api/admin/clan')
      .then(response => response.json())
      .then(data => {
        setClans(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Lỗi khi lấy danh sách bang hội:', error);
        setLoading(false);
      });
  }, []);

  const handleOpenModal = (clan, type) => {
    setSelectedClan(clan);
    setModalType(type);
  };

  const handleCloseModal = () => {
    setSelectedClan(null);
    setModalType(null);
  };

  const handleSaveClan = (updatedClan) => {
    fetch(`/api/admin/clan/${updatedClan.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedClan)
    })
      .then(response => response.json())
      .then(data => {
        setClans(clans.map(clan => (clan.id === updatedClan.id ? updatedClan : clan)));
        handleCloseModal();
      })
      .catch(error => console.error('Lỗi khi cập nhật bang hội:', error));
  };

  const handleCreateClan = (newClanFormData) => {
    fetch(`/api/admin/clan`, {
      method: 'POST',
      body: newClanFormData 
    })
      .then(response => response.json())
      .then(data => {
        setClans([...clans, data]);
        handleCloseModal();
      })
      .catch(error => console.error('Lỗi khi tạo bang hội:', error));
  };
  

  const handleDeleteClan = (clanId) => {
    fetch(`/api/admin/clan/${clanId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(() => {
        setClans(clans.filter(clan => clan.id !== clanId));
      })
      .catch(error => console.error('Lỗi khi xóa bang hội:', error));
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
                <TableCell>{clan.clan_money}</TableCell>
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
