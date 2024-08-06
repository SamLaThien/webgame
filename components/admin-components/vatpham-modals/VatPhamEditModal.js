import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button } from '@mui/material';

const VatPhamEditModal = ({ vatPham, onClose, onSave }) => {
  const [name, setName] = useState(vatPham.name);
  const [phamCap, setPhamCap] = useState(vatPham.phamCap);
  const [suDung, setSuDung] = useState(vatPham.suDung);

  const handleSave = () => {
    onSave({ ...vatPham, name, phamCap, suDung });
  };

  return (
    <Modal
      open={!!vatPham}
      onClose={onClose}
      aria-labelledby="vat-pham-edit-modal"
      aria-describedby="vat-pham-edit-description"
    >
      <Box sx={{ width: 400, margin: 'auto', marginTop: '20%', padding: 4, backgroundColor: 'white', borderRadius: 2 }}>
        <Typography id="vat-pham-edit-modal" variant="h6" component="h2">
          Sửa vật phẩm
        </Typography>
        <TextField
          fullWidth
          label="Tên"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mt: 2 }}
        />
        <TextField
          fullWidth
          label="Phẩm cấp"
          value={phamCap}
          onChange={(e) => setPhamCap(e.target.value)}
          sx={{ mt: 2 }}
        />
        <TextField
          fullWidth
          label="Sử dụng"
          value={suDung}
          onChange={(e) => setSuDung(e.target.value)}
          sx={{ mt: 2 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button onClick={handleSave} variant="contained" color="primary">
            Lưu
          </Button>
          <Button onClick={onClose} variant="outlined" color="secondary">
            Hủy
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default VatPhamEditModal;
