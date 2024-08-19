import { useRouter } from 'next/router';
import HoSo from '@/components/user-components/HoSo';
import TinNhan from '@/components/user-components/TinNhan';
import DoiMatKhau from '@/components/user-components/DoiMatKhau';
import RuongChuaDo from '@/components/user-components/RuongChuaDo';
import DotPha from '@/components/user-components/DotPha';
import QuyThi from '@/components/user-components/QuyThi';
import LuyenDanThat from '@/components/user-components/LuyenDanThat';
import NhiemVuDuong from '@/components/user-components/NhiemVuDuong';
import DaoKhoang from '@/components/user-components/DaoKhoang';
import XinVaoBang from '@/components/user-components/XinVaoBang';
import NghiSuDien from '@/components/user-components/NghiSuDien';
import BaoKhoPhong from '@/components/user-components/BaoKhoPhong';
import LanhSuDuong from '@/components/user-components/LanhSuDuong';
import Layout from '@/components/Layout';
import LuyenKhiThat from '@/components/user-components/LuyenKhiThat';
import DuocVien from '@/components/user-components/DuocVien';

const SectionPage = () => {
  const router = useRouter();
  const { section } = router.query;
  
  const getCurrentComponent = () => {
    switch (section) {
      case 'ho-so':
        return <HoSo />;
      case 'tin-nhan':
        return <TinNhan />;
      case 'doi-mat-khau':
        return <DoiMatKhau />;
      case 'ruong-chua-do':
        return <RuongChuaDo />;
      case 'dot-pha':
        return <DotPha />;
      case 'quy-thi':
        return <QuyThi />;
      case 'luyen-dan-that':
        return <LuyenDanThat />;
        case 'luyen-khi-that':
        return <LuyenKhiThat />;
      case 'nhiem-vu-duong':
        return <NhiemVuDuong />;
      case 'dao-khoang':
        return <DaoKhoang />;
      case 'xin-vao-bang':
        return <XinVaoBang />;
      case 'nghi-su-dien':
        return <NghiSuDien />;
      case 'bao-kho-phong':
        return <BaoKhoPhong />;
      case 'lanh-su-duong':
        return <LanhSuDuong />;
        case 'duoc-vien':
        return <DuocVien />;
      default:
        return <HoSo />;
    }
  };

  return (
    <Layout>
      {getCurrentComponent()}
    </Layout>
  );
};

export default SectionPage;
