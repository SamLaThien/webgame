import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';

const VatPhamDeleteModal = ({ vatPham, onClose, onDelete }) => {
  const handleDelete = () => {
    onDelete(vatPham);
  };

  return (
    <Modal
      open={!!vatPham}
      onClose={onClose}
      aria-labelledby="vat-pham-delete-modal"
      aria-describedby="vat-pham-delete-description"
    >
      <Box sx={{ width: 400, margin: 'auto', marginTop: '20%', padding: 4, backgroundColor: 'white', borderRadius: 2 }}>
        <Typography id="vat-pham-delete-modal" variant="h6" component="h2">
          Xóa vật phẩm
        </Typography>
        <Typography id="vat-pham-delete-description" sx={{ mt: 2 }}>
          Bạn có chắc chắn muốn xóa vật phẩm này?
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button onClick={handleDelete} variant="contained" color="error">
            Xóa
          </Button>
          <Button onClick={onClose} variant="outlined" color="secondary">
            Hủy
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default VatPhamDeleteModal;
