import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';

const VatPhamDetailModal = ({ vatPham, onClose }) => {
  return (
    <Modal
      open={!!vatPham}
      onClose={onClose}
      aria-labelledby="vat-pham-detail-modal"
      aria-describedby="vat-pham-detail-description"
    >
      <Box sx={{ width: 400, margin: 'auto', marginTop: '20%', padding: 4, backgroundColor: 'white', borderRadius: 2 }}>
        <Typography id="vat-pham-detail-modal" variant="h6" component="h2">
          Chi tiết vật phẩm
        </Typography>
        <Typography id="vat-pham-detail-description" sx={{ mt: 2 }}>
          <strong>ID:</strong> {vatPham.id}
        </Typography>
        <Typography sx={{ mt: 2 }}>
          <strong>Tên:</strong> {vatPham.name}
        </Typography>
        <Typography sx={{ mt: 2 }}>
          <strong>Phẩm cấp:</strong> {vatPham.phamCap}
        </Typography>
        <Typography sx={{ mt: 2 }}>
          <strong>Sử dụng:</strong> {vatPham.suDung}
        </Typography>
        <Button onClick={onClose} sx={{ mt: 3 }} variant="contained" color="primary">
          Đóng
        </Button>
      </Box>
    </Modal>
  );
};

export default VatPhamDetailModal;
