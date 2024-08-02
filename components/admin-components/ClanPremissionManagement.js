import { useState, useEffect } from 'react';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress } from '@mui/material';

const ClanPermissionManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/clan_requests')
      .then(response => response.json())
      .then(data => {
        setRequests(data.requests);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching clan requests:', error);
        setLoading(false);
      });
  }, []);

  const handleRequestAction = (requestId, action) => {
    fetch(`/api/admin/clan_requests/${requestId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action })
    })
    .then(response => response.json())
    .then(data => {
      setRequests(requests.map(req => req.id === requestId ? { ...req, status: action } : req));
    })
    .catch(error => console.error('Error updating clan request:', error));
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
              <TableCell>User ID</TableCell>
              <TableCell>Clan ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.id}</TableCell>
                <TableCell>{request.user_id}</TableCell>
                <TableCell>{request.clan_id}</TableCell>
                <TableCell>{request.status}</TableCell>
                <TableCell>
                  <Button onClick={() => handleRequestAction(request.id, 'approved')} disabled={request.status !== 'pending'}>Approve</Button>
                  <Button onClick={() => handleRequestAction(request.id, 'rejected')} disabled={request.status !== 'pending'}>Reject</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default ClanPermissionManagement;
