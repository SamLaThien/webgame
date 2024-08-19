import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 20px;
  background-color: #f9f9f9;
`;

const Section = styled.div`
  flex: 1;
  border: 1px solid #93b6c8;
  border-radius: 8px;
  padding: 20px;
  background-color: white;
`;

const SectionTitle = styled.h3`
  margin-bottom: 20px;
  font-weight: bold;
  font-size: 18px;
  color: #333;
  border-bottom: 1px solid #93b6c8;
  padding-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Content = styled.div`
  margin-top: 10px;
  line-height: 1.6;
  color: #666;
`;

const LearnButton = styled.button`
  background-color: #b3d7e8;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 20px;
  
  &:hover {
    background-color: #93b6c8;
  }
`;

const DanPhuongList = styled.div`
  background-color: #eaf8f4;
  padding: 10px;
  border: 1px solid #93b6c8;
  border-radius: 8px;
  margin-top: 20px;
`;

const Item = styled.p`
  margin: 0;
  padding: 10px 0;
  border-bottom: 1px solid #93b6c8;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ImageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
`;

const Image = styled.img`
  max-width: 100%;
  height: auto;
  border-radius: 8px;
`;

const LuyenDanThat = () => {
  return (
    <Container>
      <Section>
        <SectionTitle>📜 DANH SÁCH ĐAN PHƯƠNG</SectionTitle>
        <Content>
          <p>Bạn không có đan phương nào cả</p>
          <p>
            Tư vi hiện tại của bạn là Hóa Thần Tầng 2, bạn chỉ có thể học được
            các đan phương là...
          </p>
          <LearnButton>Học</LearnButton>
        </Content>
      </Section>
      
      <Section>
        <SectionTitle>🔥 LUYỆN ĐAN</SectionTitle>
        <Content>
          <DanPhuongList>
            <Item>
              Độ thành thục càng cao tỉ lệ thành đan và số lượng đan được nhận càng lớn
            </Item>
            {/* Add more Items here */}
          </DanPhuongList>
          <ImageContainer>
            <Image src="/path/to/your/image.png" alt="Luyện đan"/>
          </ImageContainer>
        </Content>
      </Section>
    </Container>
  );
};

export default LuyenDanThat;
