import { useState, useEffect } from 'react';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress } from '@mui/material';
import VatPhamDetailModal from './vatpham-modals/VatPhamDetailModal';
import VatPhamEditModal from './vatpham-modals/VatPhamEditModal';
import VatPhamDeleteModal from './vatpham-modals/VatPhamDeleteModal';

const VatPhamManagement = () => {
  const [vatPhams, setVatPhams] = useState([]);
  const [selectedVatPham, setSelectedVatPham] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/vat-pham')
      .then(response => response.json())
      .then(data => {
        setVatPhams(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching vat pham:', error);
        setLoading(false);
      });
  }, []);

  const handleOpenModal = (vatPham, type) => {
    setSelectedVatPham(vatPham);
    setModalType(type);
  };

  const handleCloseModal = () => {
    setSelectedVatPham(null);
    setModalType(null);
  };

  const handleSaveVatPham = (updatedVatPham) => {
    fetch(`/api/admin/vat-pham/${updatedVatPham.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedVatPham)
    })
    .then(response => response.json())
    .then(data => {
      setVatPhams(vatPhams.map(vatPham => (vatPham.id === updatedVatPham.id ? updatedVatPham : vatPham)));
      handleCloseModal();
    })
    .catch(error => console.error('Error updating vat pham:', error));
  };

  const handleDeleteVatPham = (vatPham) => {
    fetch(`/api/admin/vat-pham/${vatPham.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      setVatPhams(vatPhams.filter(v => v.id !== vatPham.id));
      handleCloseModal();
    })
    .catch(error => console.error('Error deleting vat pham:', error));
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <div>
      <h1>Quản lý Vật Phẩm</h1>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Tên</TableCell>
              <TableCell>Phẩm cấp</TableCell>
              <TableCell>Sử dụng</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vatPhams.map((vatPham) => (
              <TableRow key={vatPham.id}>
                <TableCell>{vatPham.id}</TableCell>
                <TableCell>{vatPham.name}</TableCell>
                <TableCell>{vatPham.phamCap}</TableCell>
                <TableCell>{vatPham.suDung}</TableCell>
                <TableCell>
                  <Button onClick={() => handleOpenModal(vatPham, 'details')}>Chi tiết</Button>
                  <Button onClick={() => handleOpenModal(vatPham, 'edit')}>Sửa</Button>
                  <Button onClick={() => handleOpenModal(vatPham, 'delete')}>Xóa</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {selectedVatPham && modalType === 'details' && (
        <VatPhamDetailModal vatPham={selectedVatPham} onClose={handleCloseModal} />
      )}
      {selectedVatPham && modalType === 'edit' && (
        <VatPhamEditModal vatPham={selectedVatPham} onClose={handleCloseModal} onSave={handleSaveVatPham} />
      )}
      {selectedVatPham && modalType === 'delete' && (
        <VatPhamDeleteModal vatPham={selectedVatPham} onClose={handleCloseModal} onDelete={handleDeleteVatPham} />
      )}
    </div>
  );
};

export default VatPhamManagement;
