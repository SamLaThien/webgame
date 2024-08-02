import { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { Menu, MenuItem, IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const Container = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  margin-bottom: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
`;

const Th = styled.th`
  border: 1px solid #ddd;
  padding: 8px;
  background-color: #f2f2f2;
`;

const Td = styled.td`
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
`;

const LevelManagement = () => {
  const [levels, setLevels] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      const response = await axios.get('/api/admin/level');
      setLevels(response.data);
    } catch (error) {
      console.error('Error fetching levels:', error);
    }
  };

  const handleMenuClick = (event, level) => {
    setAnchorEl(event.currentTarget);
    setSelectedLevel(level);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedLevel(null);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/admin/level/${id}`);
      fetchLevels();
    } catch (error) {
      console.error('Error deleting level:', error);
    }
    handleMenuClose();
  };

  return (
    <Container>
      <Title>Level Management</Title>
      <Table>
        <thead>
          <tr>
            <Th>Actions</Th>
            <Th>Cap So</Th>
            <Th>Tu Vi</Th>
            <Th>EXP</Th>
            <Th>Vat Pham Bat Buoc</Th>
            <Th>Ty Le Dot Pha Thanh Cong</Th>
            <Th>Dot Pha That Bai Mat %EXP</Th>
            <Th>Dot Pha That Bai Mat EXP</Th>
            <Th>Bac Nhan Duoc Khi Dot Pha</Th>
            <Th>Bac Mo Hop Qua</Th>
            <Th>Bac Mo Hop Qua Tu Bao Bai</Th>
            <Th>Thoi Gian Cho Giua 2 Nhiem Vu</Th>
            <Th>Dau Mien Phi Moi Ngay</Th>
            <Th>So Hop Qua Duoc Mo Moi Ngay</Th>
          </tr>
        </thead>
        <tbody>
          {levels.map((level) => (
            <tr key={level.id}>
              <Td>
                <IconButton
                  aria-controls="simple-menu"
                  aria-haspopup="true"
                  onClick={(event) => handleMenuClick(event, level)}
                >
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  keepMounted
                  open={Boolean(anchorEl && selectedLevel && selectedLevel.id === level.id)}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={() => handleDelete(level.id)}>Delete</MenuItem>
                </Menu>
              </Td>
              <Td>{level.cap_so}</Td>
              <Td>{level.tu_vi}</Td>
              <Td>{level.exp}</Td>
              <Td>{level.vatpham_bat_buoc}</Td>
              <Td>{level.ty_le_dot_pha_thanh_cong}</Td>
              <Td>{level.dot_pha_that_bai_mat_exp_percent}</Td>
              <Td>{level.dot_pha_that_bai_mat_exp}</Td>
              <Td>{level.bac_nhan_duoc_khi_dot_pha}</Td>
              <Td>{level.bac_mo_hop_qua}</Td>
              <Td>{level.bac_mo_hop_qua_tu_bao_bai}</Td>
              <Td>{level.thoi_gian_cho_giua_2_nhiem_vu}</Td>
              <Td>{level.dau_mien_phi_moi_ngay}</Td>
              <Td>{level.so_hop_qua_duoc_mo_moi_ngay}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default LevelManagement;
