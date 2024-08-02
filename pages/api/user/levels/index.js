import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const [levels] = await db.query('SELECT * FROM levels');
      res.status(200).json(levels);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching levels' });
    }
  } else if (req.method === 'POST') {
    const { cap_so, tu_vi, exp, vatpham_bat_buoc, ty_le_dot_pha_thanh_cong, dot_pha_that_bai_mat_exp_percent, dot_pha_that_bai_mat_exp, bac_nhan_duoc_khi_dot_pha, bac_mo_hop_qua, bac_mo_hop_qua_tu_bao_bai, thoi_gian_cho_giua_2_nhiem_vu, dau_mien_phi_moi_ngay, so_hop_qua_duoc_mo_moi_ngay } = req.body;

    try {
      await db.query('INSERT INTO levels (cap_so, tu_vi, exp, vatpham_bat_buoc, ty_le_dot_pha_thanh_cong, dot_pha_that_bai_mat_exp_percent, dot_pha_that_bai_mat_exp, bac_nhan_duoc_khi_dot_pha, bac_mo_hop_qua, bac_mo_hop_qua_tu_bao_bai, thoi_gian_cho_giua_2_nhiem_vu, dau_mien_phi_moi_ngay, so_hop_qua_duoc_mo_moi_ngay) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [cap_so, tu_vi, exp, vatpham_bat_buoc, ty_le_dot_pha_thanh_cong, dot_pha_that_bai_mat_exp_percent, dot_pha_that_bai_mat_exp, bac_nhan_duoc_khi_dot_pha, bac_mo_hop_qua, bac_mo_hop_qua_tu_bao_bai, thoi_gian_cho_giua_2_nhiem_vu, dau_mien_phi_moi_ngay, so_hop_qua_duoc_mo_moi_ngay]);
      res.status(201).json({ message: 'Level added successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error adding level' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
