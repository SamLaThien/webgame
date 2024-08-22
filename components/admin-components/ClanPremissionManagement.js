import { useState, useEffect } from 'react';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress } from '@mui/material';
import axios from 'axios';

const ClanPremissionManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/admin/clan-requests', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (Array.isArray(response.data)) {
          setRequests(response.data);
        } else {
          console.error('Unexpected response format:', response.data);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching requests:', error);
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleAction = async (requestId, action, userId, clanId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/admin/clan-requests/${requestId}`, {
        action,
        user_id: userId,
        clan_id: clanId,
      }, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      if (response.data.message.includes('Request')) {
        setRequests(requests.map(req => req.id === requestId ? { ...req, status: action } : req));
      } else {
        console.error('Error updating request:', response.data.message);
      }
    } catch (error) {
      console.error('Error updating request:', error);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <div>
      <h1>Clan Permission Management</h1>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Clan Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.id}</TableCell>
                <TableCell>{request.username}</TableCell>
                <TableCell>{request.clan_name}</TableCell>
                <TableCell>{request.status}</TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleAction(request.id, 'approved', request.user_id, request.clan_id)}
                    disabled={request.status !== 'pending'}
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleAction(request.id, 'rejected', request.user_id, request.clan_id)}
                    disabled={request.status !== 'pending'}
                  >
                    Reject
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default ClanPremissionManagement;
