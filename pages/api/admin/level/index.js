import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      db.query('SELECT * FROM levels', (error, results) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
        res.status(200).json(results);
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else if (req.method === 'POST') {
    const { cap_so, tu_vi, exp, vatpham_bat_buoc, ty_le_dot_pha_thanh_cong, dot_pha_that_bai_mat_exp_percent, dot_pha_that_bai_mat_exp, bac_nhan_duoc_khi_dot_pha, bac_mo_hop_qua, bac_mo_hop_qua_tu_bao_bai, thoi_gian_cho_giua_2_nhiem_vu, dau_mien_phi_moi_ngay, so_hop_qua_duoc_mo_moi_ngay } = req.body;

    try {
      db.query(`INSERT INTO levels (cap_so, tu_vi, exp, vatpham_bat_buoc, ty_le_dot_pha_thanh_cong, dot_pha_that_bai_mat_exp_percent, dot_pha_that_bai_mat_exp, bac_nhan_duoc_khi_dot_pha, bac_mo_hop_qua, bac_mo_hop_qua_tu_bao_bai, thoi_gian_cho_giua_2_nhiem_vu, dau_mien_phi_moi_ngay, so_hop_qua_duoc_mo_moi_ngay) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
      [cap_so, tu_vi, exp, vatpham_bat_buoc, ty_le_dot_pha_thanh_cong, dot_pha_that_bai_mat_exp_percent, dot_pha_that_bai_mat_exp, bac_nhan_duoc_khi_dot_pha, bac_mo_hop_qua, bac_mo_hop_qua_tu_bao_bai, thoi_gian_cho_giua_2_nhiem_vu, dau_mien_phi_moi_ngay, so_hop_qua_duoc_mo_moi_ngay], 
      (error, results) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
        res.status(201).json({ message: 'Level created successfully', id: results.insertId });
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else if (req.method === 'PUT') {
    const { id } = req.query;
    const { cap_so, tu_vi, exp, vatpham_bat_buoc, ty_le_dot_pha_thanh_cong, dot_pha_that_bai_mat_exp_percent, dot_pha_that_bai_mat_exp, bac_nhan_duoc_khi_dot_pha, bac_mo_hop_qua, bac_mo_hop_qua_tu_bao_bai, thoi_gian_cho_giua_2_nhiem_vu, dau_mien_phi_moi_ngay, so_hop_qua_duoc_mo_moi_ngay } = req.body;

    if (id === undefined || id === null) {
      return res.status(400).json({ message: 'Level ID is required' });
    }

    try {
      db.query(`UPDATE levels SET cap_so = ?, tu_vi = ?, exp = ?, vatpham_bat_buoc = ?, ty_le_dot_pha_thanh_cong = ?, dot_pha_that_bai_mat_exp_percent = ?, dot_pha_that_bai_mat_exp = ?, bac_nhan_duoc_khi_dot_pha = ?, bac_mo_hop_qua = ?, bac_mo_hop_qua_tu_bao_bai = ?, thoi_gian_cho_giua_2_nhiem_vu = ?, dau_mien_phi_moi_ngay = ?, so_hop_qua_duoc_mo_moi_ngay = ? WHERE id = ?`, 
      [cap_so, tu_vi, exp, vatpham_bat_buoc, ty_le_dot_pha_thanh_cong, dot_pha_that_bai_mat_exp_percent, dot_pha_that_bai_mat_exp, bac_nhan_duoc_khi_dot_pha, bac_mo_hop_qua, bac_mo_hop_qua_tu_bao_bai, thoi_gian_cho_giua_2_nhiem_vu, dau_mien_phi_moi_ngay, so_hop_qua_duoc_mo_moi_ngay, id], 
      (error, results) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
        res.status(200).json({ message: 'Level updated successfully' });
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.query;

    if (id === undefined || id === null) {
      return res.status(400).json({ message: 'Level ID is required' });
    }

    try {
      db.query(`DELETE FROM levels WHERE id = ?`, [id], (error, results) => {
        if (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
        res.status(200).json({ message: 'Level deleted successfully' });
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
