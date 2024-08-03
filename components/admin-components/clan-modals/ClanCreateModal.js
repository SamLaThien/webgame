// components/admin-components/clan-modals/ClanCreateModal.js
import { useState, useEffect } from 'react';
import { Modal, Button, TextField, CircularProgress, MenuItem, ListItemText } from '@mui/material';

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
          console.error('Error fetching members:', error);
          setLoading(false);
        });
    }
  }, [ownerUsername]);

  const handleSave = () => {
    if (!name || !ownerId || !clanId) {
      alert('Clan ID, Name, and Owner are required');
      return;
    }

    onSave({ id: clanId, name, owner: ownerId, clan_money: money });
  };

  return (
    <Modal open onClose={onClose}>
      <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', maxWidth: '500px', margin: '0 auto' }}>
        <h2>Create Clan</h2>
        <TextField
          label="Clan ID"
          value={clanId}
          onChange={(e) => setClanId(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Clan Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Owner Username"
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
        <TextField
          label="Clan Money"
          type="number"
          value={money}
          onChange={(e) => setMoney(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button onClick={handleSave} variant="contained" color="primary" style={{ marginTop: '20px' }}>
          Save
        </Button>
        <Button onClick={onClose} variant="outlined" color="secondary" style={{ marginTop: '10px' }}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
};

export default ClanCreateModal;
