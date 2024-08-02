import { useState, useEffect } from 'react';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress } from '@mui/material';
import ClanDetailModal from './clan-modals/ClanDetailModal';
import ClanEditModal from './clan-modals/ClanEditModal';
import ClanDeleteModal from './clan-modals/ClanDeleteModal';
import ClanCreateModal from './clan-modals/ClanCreateModal';

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
        console.error('Error fetching clans:', error);
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
    .catch(error => console.error('Error updating clan:', error));
  };

  const handleCreateClan = (newClan) => {
    fetch(`/api/admin/clan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newClan)
    })
    .then(response => response.json())
    .then(data => {
      setClans([...clans, data]);
      handleCloseModal();
    })
    .catch(error => console.error('Error creating clan:', error));
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
    .catch(error => console.error('Error deleting clan:', error));
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <div>
      <h1>Clan Management</h1>
      <Button onClick={() => handleOpenModal({}, 'create')}>Create Clan</Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clans.map((clan) => (
              <TableRow key={clan.id}>
                <TableCell>{clan.id}</TableCell>
                <TableCell>{clan.name}</TableCell>
                <TableCell>{clan.owner}</TableCell>
                <TableCell>
                  <Button onClick={() => handleOpenModal(clan, 'details')}>Details</Button>
                  <Button onClick={() => handleOpenModal(clan, 'edit')}>Edit</Button>
                  <Button onClick={() => handleOpenModal(clan, 'delete')}>Delete</Button>
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
    </div>
  );
};

export default ClanManagement;
