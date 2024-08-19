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

const ItemList = styled.div`
  margin-top: 20px;
  padding: 10px;
  border: 1px solid #93b6c8;
  border-radius: 8px;
`;

const Item = styled.p`
  margin: 0;
  padding: 10px 0;
  border-bottom: 1px solid #93b6c8;
  
  &:last-child {
    border-bottom: none;
  }
`;

const RadioContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const RadioButton = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
`;

const Input = styled.input`
  padding: 10px;
  width: 100%;
  margin-top: 10px;
  border: 1px solid #93b6c8;
  border-radius: 4px;
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

const LuyenKhiThat = () => {
  return (
    <Container>
      <Section>
        <SectionTitle>🔮 LUYỆN KHÍ</SectionTitle>
        <Content>
          <p>- Đẳng cấp: Luyện khí sư cấp 13 (0%)</p>
          <p>Chuyên luyện đan: Khải Giáp</p>
          <p>
            Hãy chọn 1 trong các phương thức luyện khí sau để bắt đầu:
          </p>
          <RadioContainer>
            <RadioButton>
              <input type="radio" name="luyenKhi" /> Pháp khí 1 (đẳng cấp LKS cần 15 bậc, chưa luyện được)
            </RadioButton>
            <RadioButton>
              <input type="radio" name="luyenKhi" /> Pháp khí 2 (đẳng cấp LKS cần 24 bậc, chưa luyện được)
            </RadioButton>
            {/* Add more RadioButtons here */}
          </RadioContainer>
          <Input type="text" placeholder="Nhập tên pháp khí ở đây" />
          <ImageContainer>
            <Image src="/path/to/your/image.png" alt="Luyện khí"/>
          </ImageContainer>
        </Content>
      </Section>
      
      <Section>
        <SectionTitle>⚒️ CƯỜNG HÓA</SectionTitle>
        <Content>
          <ItemList>
            <Item>Nâng cấp pháp khí đao</Item>
            <Item>Nâng cấp pháp khí thương</Item>
            {/* Add more Items here */}
          </ItemList>
          <LearnButton>Gia Cường</LearnButton>
        </Content>
      </Section>
    </Container>
  );
};

export default LuyenKhiThat;
