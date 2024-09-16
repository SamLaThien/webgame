import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, TextField, Modal } from '@mui/material';
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

const ModalContent = styled.div`
  padding: 20px;
  background-color: white;
  margin: 100px auto;
  max-width: 500px;
  border-radius: 8px;
`;

const DanhHaoManagement = () => {
  const [danhHaoList, setDanhHaoList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDanhHao, setNewDanhHao] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentDanhHao, setCurrentDanhHao] = useState('');
  const [currentDanhHaoId, setCurrentDanhHaoId] = useState(null);
  const [css, setCss] = useState('black'); // Default color white

  const token = localStorage.getItem('token');

  const handleSearchButtonClick = async () => {
    if (!token) {
      console.error('No token found');
      return;
    }

    if (searchQuery) {
      setLoading(true);
      try {
        const userId = searchQuery;
        const danhHaoResponse = await axios.post('/api/admin/danh-hao', { userId }, { headers: { Authorization: `Bearer ${token}` } });
        setDanhHaoList(danhHaoResponse.data || []);
        setSelectedUser(userId);
      } catch (error) {
        console.error('Error fetching danh hao:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddDanhHao = () => {
    setNewDanhHao('');
    setIsModalOpen(true);
  };

  const handleSaveNewDanhHao = async () => {
    if (!newDanhHao || !selectedUser || !token) return;

    try {
      const response = await axios.post('/api/admin/danh-hao/add', {
        userId: selectedUser,
        danhHao: newDanhHao,
        css
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDanhHaoList(prevList => [...prevList, { id: response.data.id, danh_hao: newDanhHao, css }]);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding danh hao:', error);
    }
  };

  const handleEditDanhHao = (danhHao) => {
    setCurrentDanhHao(danhHao.danh_hao);
    setCurrentDanhHaoId(danhHao.id);
    setNewDanhHao('');
    setIsEditModalOpen(true);
  };

  const handleSaveEditedDanhHao = async () => {
    if (!newDanhHao || !selectedUser || !token) return;

    try {
      await axios.put('/api/admin/danh-hao', {
        userId: selectedUser,
        danhHaoId: currentDanhHaoId,
        newDanhHao,
        oldDanhHao: currentDanhHao,
        css
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setDanhHaoList(danhHaoList.map(dh =>
        dh.id === currentDanhHaoId ? { ...dh, danh_hao: newDanhHao, css } : dh
      ));
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error editing danh hao:', error);
    }
  };

  const handleDeleteDanhHao = async (danhHaoId, danhHao) => {
    if (!token) {
      console.error('No token found');
      return;
    }

    try {
      await axios.delete('/api/admin/danh-hao', {
        data: {
          userId: selectedUser,
          danhHaoId,
          danh_hao: danhHao
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      setDanhHaoList(danhHaoList.filter(dh => dh.id !== danhHaoId));
    } catch (error) {
      console.error('Error deleting danh hao:', error);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container>
      <Title>Quản lý Danh Hào</Title>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <TextField
          label="Nhập ID cần tìm:"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <StyledButton onClick={handleSearchButtonClick}>Xem Danh Hào</StyledButton>
      </div>

      {selectedUser && (
        <div>
          <h2>Danh hào của ID {selectedUser}</h2>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Danh Hào</TableCell>
                  <TableCell>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {danhHaoList &&
                  danhHaoList.length > 0 &&
                  danhHaoList.map((danhHao) => (
                    <TableRow key={danhHao.id}>
                      <TableCell>{danhHao.id}</TableCell>
                      <TableCell>{danhHao.danh_hao}</TableCell>
                      <TableCell>
                        <Button onClick={() => handleEditDanhHao(danhHao)}>Chỉnh sửa</Button>
                        <Button onClick={() => handleDeleteDanhHao(danhHao.id, danhHao.danh_hao)}>Xóa</Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <StyledButton onClick={handleAddDanhHao}>Thêm Danh Hào</StyledButton>
        </div>
      )}

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalContent>
          <h2>Thêm Danh Hào</h2>
          <TextField
            label="Danh Hào"
            fullWidth
            value={newDanhHao}
            onChange={(e) => setNewDanhHao(e.target.value)}
          />
          <TextField
            label="CSS"
            fullWidth
            value={css}
            onChange={(e) => setCss(e.target.value)}
          />
          <StyledButton onClick={handleSaveNewDanhHao}>Lưu</StyledButton>
          <StyledButton onClick={() => setIsModalOpen(false)} variant="outlined">Hủy</StyledButton>
        </ModalContent>
      </Modal>

      <Modal open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <ModalContent>
          <h2>Chỉnh sửa Danh Hào</h2>
          <TextField
            label="Danh Hào"
            fullWidth
            value={newDanhHao}
            onChange={(e) => setNewDanhHao(e.target.value)}
          />
          <TextField
            label="CSS"
            fullWidth
            value={css}
            onChange={(e) => setCss(e.target.value)}
          />
          <StyledButton onClick={handleSaveEditedDanhHao}>Lưu</StyledButton>
          <StyledButton onClick={() => setIsEditModalOpen(false)} variant="outlined">Hủy</StyledButton>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default DanhHaoManagement;
