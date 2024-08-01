import { useState, useEffect } from 'react';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress } from '@mui/material';
import UserDetailModal from './user-modals/UserDetailModal';
import UserEditModal from './user-modals/UserEditModal';
import UserBanModal from './user-modals/UserBanModal';
import UserDeleteModal from './user-modals/UserDeleteModal';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/user')
      .then(response => response.json())
      .then(data => {
        console.log('Fetched users:', data);
        setUsers(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
        setLoading(false);
      });
  }, []);

  const handleOpenModal = (user, type) => {
    setSelectedUser(user);
    setModalType(type);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setModalType(null);
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
                <TableCell>
                  <Button onClick={() => handleOpenModal(user, 'details')}>Details</Button>
                  <Button onClick={() => handleOpenModal(user, 'edit')}>Edit</Button>
                  <Button onClick={() => handleOpenModal(user, 'ban')}>Ban</Button>
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
        <UserEditModal user={selectedUser} onClose={handleCloseModal} />
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
