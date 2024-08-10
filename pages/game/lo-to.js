import CboxGeneral from '@/components/CboxGeneral';
import Layout from '@/components/Layout';
import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  width: 100%;
  padding: 20px;
  background: #f5f5f5;
`;

const Sidebar = styled.div`
  width: 25%;
  margin-right: 20px;
`;

const MainContent = styled.div`
  width: 75%;
  display: flex;
  flex-direction: column;
`;

const Section = styled.div`
  background: white;
  border: 1px solid #93b6c8;
  padding: 15px;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  margin-bottom: 15px;
  font-weight: bold;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #ddd;
`;

const TableHeader = styled.th`
  padding: 8px;
  background-color: #eaeaea;
  text-align: left;
`;

const TableData = styled.td`
  padding: 8px;
  text-align: left;
`;

const BuyForm = styled.div`
  display: flex;
  margin-bottom: 20px;
`;

const Input = styled.input`
  padding: 10px;
  margin-right: 10px;
  border: 1px solid #93b6c8;
  width: 200px;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: #FF5733;
  color: white;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: #C70039;
  }
`;

const CboxWrapper = styled.div`
  margin-top: 20px;
`;

const LotoPage = () => {
  const [soLuong, setSoLuong] = useState('');
  const [taiSan, setTaiSan] = useState('');

  const handleBuy = () => {
    // Handle the buy logic here
  };

  return (
    <Layout>
      <Container>
        <Sidebar>
          <Section>
            <SectionTitle>10 Thành viên mua nhiều</SectionTitle>
            <Table>
              <TableRow>
                <TableHeader>Ngoại hiệu</TableHeader>
                <TableHeader>Số vé</TableHeader>
              </TableRow>
              {/* Add dynamic rows here */}
              <TableRow>
                <TableData>Vô Diệm Nguyệt</TableData>
                <TableData>10</TableData>
              </TableRow>
              {/* More rows as needed */}
            </Table>
          </Section>

          <Section>
            <SectionTitle>Danh Sách Trúng Thưởng</SectionTitle>
            {/* Add the logic to display the list of winners */}
          </Section>

          <CboxWrapper>
            <CboxGeneral />
          </CboxWrapper>
        </Sidebar>

        <MainContent>
          <Section>
            <SectionTitle>Loto Đặc Biệt</SectionTitle>
            <p>Để tăng cơ hội trúng thưởng, hãy mua vé càng nhiều càng tốt. Càng nhiều vé, tỷ lệ trúng thưởng càng cao.</p>
            <p>Thời gian mở thưởng Tự Tien Lott từ 0:00, 8:30, 16:30 hàng ngày.</p>
            <p>Giải thưởng Loto Đặc Biệt random từ 0 đến 99999, các điều bạc cho tất cả các vé trúng.</p>
            <p>Giải thưởng: 2,000,000 bạc + 90% tổng số bạc của người chơi đạt nhất sẽ chia đều cho các vé trúng.</p>
            <ul>
              <li>Giải nhất: 30,000 bạc</li>
              <li>Giải nhì: 10,000 bạc</li>
              <li>Giải ba: 5,000 bạc</li>
            </ul>

            <BuyForm>
              <Input
                type="number"
                placeholder="Số lượng vé"
                value={soLuong}
                onChange={(e) => setSoLuong(e.target.value)}
              />
              <Button onClick={handleBuy}>Mua</Button>
            </BuyForm>

            <p><strong>Bạc là vật phẩm ảo, nhận được thông qua làm nhiệm vụ hoặc tu luyện, không thể quy đổi ra tiền mặt.</strong></p>
            <p>Số vé đặc biệt đã mua: 1, 2, 3, 4, 5, 6, 7, 8, 9...</p>
          </Section>
        </MainContent>
      </Container>
    </Layout>
  );
};

export default LotoPage;
