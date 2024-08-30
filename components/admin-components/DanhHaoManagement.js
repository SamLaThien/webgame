import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, TextField, Modal, MenuItem } from '@mui/material';
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

const DanhHaoManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [danhHaoList, setDanhHaoList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentDanhHao, setCurrentDanhHao] = useState('');
  const [currentDanhHaoId, setCurrentDanhHaoId] = useState(null);
  const [newDanhHao, setNewDanhHao] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      if (searchQuery) {
        setLoading(true);
        try {
          const response = await axios.get(`/api/admin/search-user?username=${searchQuery}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUsers(response.data);
        } catch (error) {
          console.error('Error searching for users:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUsers();
  }, [searchQuery]);

  const handleSelectUser = async (user) => {
    setSelectedUser(user);

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    try {
      const response = await axios.post(
        '/api/admin/danh-hao', 
        { userId: user.id }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDanhHaoList(response.data);
    } catch (error) {
      console.error('Error fetching danh hao:', error);
    }
  };

  const handleEditDanhHao = (danhHao) => {
    setCurrentDanhHao(danhHao.danh_hao);
    setCurrentDanhHaoId(danhHao.id);
    setNewDanhHao('');
    setIsEditModalOpen(true);
  };

  const handleDeleteDanhHao = async (danhHaoId, danhHao) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }
 
    try {
      await axios.delete('/api/admin/danh-hao', {
        data: { 
          userId: selectedUser.id, 
          danhHaoId: danhHaoId,
          danh_hao: danhHao 
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      setDanhHaoList(danhHaoList.filter(dh => dh.id !== danhHaoId));
    } catch (error) {
      console.error('Error deleting danh hao:', error);
    }
    
    
  };

  const handleAddDanhHao = () => {
    setNewDanhHao('');
    setIsModalOpen(true);
  };

  const handleSaveNewDanhHao = async () => {
    if (!newDanhHao) return;

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    try {
      const response = await axios.post('/api/admin/danh-hao/add', {
        userId: selectedUser.id,
        danhHao: newDanhHao,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDanhHaoList([...danhHaoList, { id: response.data.id, danh_hao: newDanhHao }]);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding danh hao:', error);
    }
  };

  const handleSaveEditedDanhHao = async () => {
    if (!newDanhHao) return;

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    try {
      await axios.put('/api/admin/danh-hao', {
        userId: selectedUser.id, 
        danhHaoId: currentDanhHaoId,
        newDanhHao,
        oldDanhHao: currentDanhHao,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setDanhHaoList(danhHaoList.map(dh => 
        dh.id === currentDanhHaoId ? { ...dh, danh_hao: newDanhHao } : dh
      ));
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error editing danh hao:', error);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container>
      <Title>Quản lý Danh Hào</Title>
      <TextField
        label="Tìm kiếm người dùng"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Tên người dùng</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>
                  <Button onClick={() => handleSelectUser(user)}>Xem Danh Hào</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedUser && (
        <div>
          <h2>Danh hào của {selectedUser.username}</h2>
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
                {danhHaoList.map((danhHao) => (
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
        <div style={{ padding: '20px', backgroundColor: 'white', margin: '100px auto', maxWidth: '500px', borderRadius: '8px' }}>
          <h2>Thêm Danh Hào</h2>
          <TextField
            label="Danh Hào"
            fullWidth
            value={newDanhHao}
            onChange={(e) => setNewDanhHao(e.target.value)}
          />
          <StyledButton onClick={handleSaveNewDanhHao}>Lưu</StyledButton>
          <StyledButton onClick={() => setIsModalOpen(false)} variant="outlined">Hủy</StyledButton>
        </div>
      </Modal>

      <Modal open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <div style={{ padding: '20px', backgroundColor: 'white', margin: '100px auto', maxWidth: '500px', borderRadius: '8px' }}>
          <h2>Chỉnh sửa Danh Hào</h2>
          <TextField
            label="Danh Hào"
            fullWidth
            value={newDanhHao}
            onChange={(e) => setNewDanhHao(e.target.value)}
          />
          <StyledButton onClick={handleSaveEditedDanhHao}>Lưu</StyledButton>
          <StyledButton onClick={() => setIsEditModalOpen(false)} variant="outlined">Hủy</StyledButton>
        </div>
      </Modal>
    </Container>
  );
};

export default DanhHaoManagement;
