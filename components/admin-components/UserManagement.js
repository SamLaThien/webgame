import { useState, useEffect } from 'react';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress } from '@mui/material';
import UserDetailModal from './user-modals/UserDetailModal';
import UserEditModal from './user-modals/UserEditModal';
import UserBanModal from './user-modals/UserBanModal';
import UserDeleteModal from './user-modals/UserDeleteModal';
import axios from 'axios';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found, redirecting to login');
          return;
        }

        const response = await axios.get('/api/admin/user', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleOpenModal = (user, type) => {
    setSelectedUser(user);
    setModalType(type);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setModalType(null);
  };

  const handleSaveUser = async (updatedUser) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found, redirecting to login');
        return;
      }

      const response = await axios.post(`/api/admin/user/${updatedUser.id}`, updatedUser, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        setUsers(users.map(user => (user.id === updatedUser.id ? updatedUser : user)));
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleBanUser = async (user) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found, redirecting to login');
        return;
      }

      const response = await axios.put(`/api/admin/user/${user.id}`, {
        ban: user.ban === 1 ? 0 : 1
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        setUsers(users.map(u => u.id === user.id ? { ...u, ban: user.ban === 1 ? 0 : 1 } : u));
      }
    } catch (error) {
      console.error('Error banning user:', error);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <div>
      <h1>User Management</h1>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Ban Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.ban === 1 ? 'Banned' : 'Active'}</TableCell>
                <TableCell>
                  <Button onClick={() => handleOpenModal(user, 'details')}>Details</Button>
                  <Button onClick={() => handleOpenModal(user, 'edit')}>Edit</Button>
                  <Button onClick={() => handleBanUser(user)}>{user.ban === 1 ? 'Unban' : 'Ban'}</Button>
                  <Button onClick={() => handleOpenModal(user, 'delete')}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {selectedUser && modalType === 'details' && (
        <UserDetailModal user={selectedUser} onClose={handleCloseModal} />
      )}
      {selectedUser && modalType === 'edit' && (
        <UserEditModal user={selectedUser} onClose={handleCloseModal} onSave={handleSaveUser} />
      )}
      {selectedUser && modalType === 'ban' && (
        <UserBanModal user={selectedUser} onClose={handleCloseModal} />
      )}
      {selectedUser && modalType === 'delete' && (
        <UserDeleteModal user={selectedUser} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default UserManagement;
