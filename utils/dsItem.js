export function parseName(name) {
    const vps = {
        1: 'Linh Tuyền',
        2: 'Hư Không Chi Thạch',
        3: 'Tẩy Tủy Đan',
        4: 'Trúc Cơ Đan',
        5: 'Bổ Nguyên Đan',
        6: 'Bổ Anh Đan',
        7: 'Hóa Nguyên Đan',
        8: 'Luyện Thần Đan',
        9: 'Hợp Nguyên Đan',
        10: 'Đại Linh Đan',
        11: 'Độ Hư Đan',
        12: 'Linh Thạch <sup>HP</sup>',
        13: 'Linh Thạch <sup>TP</sup>',
        14: 'Linh Thạch <sup>THP</sup>',
        15: 'Linh Thạch <sup>CP</sup>',
        16: 'Ngọc Tủy Linh Nhũ <sup>HP</sup>',
        17: 'Ngọc Tủy Linh Nhũ <sup>TP</sup>',
        18: 'Ngọc Tủy Linh Nhũ <sup>THP</sup>',
        19: 'Ngọc Tủy Linh Nhũ <sup>CP</sup>',
        20: 'Tinh Linh <sup>HP</sup>',
        21: 'Tinh Linh <sup>TP</sup>',
        22: 'Tinh Linh <sup>THP</sup>',
        23: 'Tinh Linh <sup>CP</sup>',
        24: 'Tử Tinh <sup>HP</sup>',
        25: 'Tử Tinh <sup>TP</sup>',
        26: 'Tử Tinh <sup>THP</sup>',
        27: 'Tử Tinh <sup>CP</sup>',
        28: 'Tử Tinh Tâm',
        29: 'Tử Tinh Chi Hồn',
        30: 'Bàn Đào Quả',
        31: 'Bồ Đề Quả',
        32: 'Ngô Đồng Quả',
        33: 'Thanh Long Quả',
        34: 'Lệ Chi Quả',
        35: 'Bàn Đào Thụ',
        36: 'Bồ Đề Thụ',
        37: 'Ngô Đồng Thụ',
        38: 'Thanh Long Thụ',
        39: 'Lệ Chi Thụ',
        40: 'Hồi Huyết Đan',
        41: 'Huyết Khí Đan',
        42: 'Tụ Bảo Bài',
        43: 'Bánh Trung Thu',
        44: 'Đê Giai Thuẫn',
        45: 'Tị Lôi Châu',
        46: 'Thanh Tâm Đan',
        47: 'Hộ Linh Trận',
        48: 'Tán Lôi Trận',
        49: 'Sa Ngọc Châu',
        50: 'Thải Ngọc Châu',
        51: 'Hỏa Ngọc Châu',
        52: 'Ngọc Tủy Chi',
        53: 'Trích Tinh Thảo',
        54: 'Hóa Long Thảo',
        55: 'Thiên Linh Quả',
        56: 'Huyết Tinh Thảo',
        57: 'Thiên Nguyên Thảo',
        58: 'Hóa Nguyên Thảo',
        59: 'Anh Tâm Thảo',
        60: 'Luyện Thần Thảo',
        61: 'Hợp Nguyên Thảo',
        62: 'Đại Linh Thảo',
        63: 'Hư Linh Thảo',
        64: 'Băng Hỏa Ngọc',
        65: 'Bổ Anh Đan Phương',
        66: 'Bổ Huyết Đan Phương',
        67: 'Bổ Nguyên Đan Phương',
        68: 'Quyên Bạch',
        69: 'Chu Sa',
        70: 'Cố Thần Đan',
        71: 'Công Pháp Tàn Quyển',
        72: 'Dạ Minh Châu',
        73: 'Dung Thần Đan',
        74: 'Hắc Diệu Thạch',
        75: 'Hắc Ma Đỉnh',
        76: 'Hổ Phách Thạch',
        77: 'Hóa Nguyên Đan Phương',
        78: 'Hòa Thị Bích',
        79: 'Hoán Diện Châu',
        80: 'Hoàng Kim Lệnh',
        81: 'Hợp Nguyên Đan Phương',
        84: 'Huyết Khí Đan Phương',
        85: 'Huyết Tinh Đan Phương',
        86: 'Kim Thủ Chỉ',
        87: 'Kim Thuổng',
        88: 'La Bàn',
        89: 'Lông Sói',
        90: 'Luyện Thần Đan Phương',
        91: 'Ngọc Giản Truyền Công',
        92: 'Ngọc Tuyết Linh Sâm',
        93: 'Ngưng Thần Đan',
        94: 'Nguyệt Bạch Thạch',
        95: 'Nhân Tiên Đan',
        96: 'Nội Đan <sup>C1</sup>',
        97: 'Nội Đan <sup>C2</sup>',
        98: 'Nội Đan <sup>C3</sup>',
        99: 'Nội Đan <sup>C4</sup>',
        100: 'Nội Đan <sup>C5</sup>',
        101: 'Nội Đan <sup>C6</sup>',
        102: 'Nội Đan <sup>C7</sup>',
        103: 'Nội Đan <sup>C8</sup>',
        104: 'Nội Đan <sup>C9</sup>',
        105: 'Nội Đan <sup>C10</sup>',
        106: 'Nội Đan C11',
        107: 'Nội Đan C12',
        108: 'Nội Đan C13',
        109: 'Phá Thiên Đan',
        110: 'Phụ Ma Thạch <sup>C1</sup>',
        111: 'Phụ Ma Thạch <sup>C2</sup>',
        112: 'Phụ Ma Thạch <sup>C3</sup>',
        113: 'Phụ Ma Thạch <sup>C4</sup>',
        114: 'Phụ Ma Thạch <sup>C5</sup>',
        115: 'Phụ Ma Thạch <sup>C6</sup>',
        116: 'Phụ Ma Thạch <sup>C7</sup>',
        117: 'Phụ Ma Thạch <sup>C8</sup>',
        118: 'Tinh Thiết <sup>HP</sup>',
        119: 'Tinh Thiết <sup>TP</sup>',
        120: 'Tinh Thiết <sup>THP</sup>',
        121: 'Tinh Thiết <sup>CP</sup>',
        122: 'Vẫn Thiết <sup>HP</sup>',
        123: 'Vẫn Thiết <sup>TP</sup>',
        124: 'Vẫn Thiết <sup>THP</sup>',
        125: 'Vẫn Thiết <sup>CP</sup>',
        126: 'Khai Thiên Thần Thạch',
        127: 'Vĩnh Hằng Thạch',
        128: 'Hồng Hoang Thạch <sup>HP</sup>',
        129: 'Hồng Hoang Thạch <sup>TP</sup>',
        130: 'Hồng Hoang Thạch <sup>THP</sup>',
        131: 'Hồng Hoang Thạch <sup>CP</sup>',
        132: 'Cửu Thiên Thạch <sup>HP</sup>',
        133: 'Cửu Thiên Thạch <sup>TP</sup>',
        134: 'Cửu Thiên Thạch <sup>THP</sup>',
        135: 'Cửu Thiên Thạch <sup>CP</sup>',
        136: 'Túi Sủng Vật',
        137: 'Túi Phân Bón',
        138: 'Quy Giáp',
        139: 'Thời Gian Chi Thủy',
        140: 'Bái Thiếp',
        141: 'Nhân Sâm Vạn Năm',
        142: 'Uẩn Thiên Đan',
        143: 'Đại Phá Đan',
        144: 'Kiếp Tiên Đan',
        145: 'Địa Tiên Đan',
        146: 'Thiên Tiên Đan',
        147: 'Thượng Tiên Đan',
        148: 'Đại La Kim Tiên Đan',
        149: 'Vĩnh Hằng Đế Đan',
        150: 'Tẩy Tủy Đan Phương',
        151: 'Trúc Cơ Đan Phương',
        152: 'Đại Linh Đan Phương',
        153: 'Độ Hư Đan Phương',
        154: 'Uẩn Kim Thảo',

    };

    if (vps.hasOwnProperty(name)) {
        return vps[name];
    }

    return name;
}
