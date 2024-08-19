import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  border: 1px solid #93b6c8;
  border-radius: 8px;
  background-color: white;
  width: 100%;
  box-sizing: border-box;
`;

const SectionTitle = styled.h3`
  font-weight: bold;
  font-size: 18px;
  color: #333;
  border-bottom: 1px solid #93b6c8;
  padding-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusContainer = styled.div`
  background-color: #e0f4e5;
  border: 1px solid #b3d7e8;
  padding: 15px;
  border-radius: 8px;
`;

const Status = styled.p`
  margin: 0;
  color: #333;
  font-weight: bold;
  font-size: 16px;
`;

const InstructionContainer = styled.div`
  background-color: #d1e7dd;
  padding: 15px;
  border-radius: 8px;
  margin-top: 10px;
`;

const Instruction = styled.p`
  margin: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.6;
`;

const Button = styled.button`
  padding: 12px 20px;
  background-color: #ffc107;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 20px;
  text-align: center;

  &:hover {
    background-color: #e0a800;
  }
`;

const NhiemVuDuong = () => {
  return (
    <Container>
      <SectionTitle>📋 NHIỆM VỤ ĐƯỜNG</SectionTitle>
      <StatusContainer>
        <Status>Chuỗi nhiệm vụ: 22</Status>
        <Status>Hoàn thành 50 nhiệm vụ nữa có thể nhận thêm 50,000 bạc.</Status>
      </StatusContainer>
      <InstructionContainer>
        <Instruction>- Tùy vận mà đạo hữu sẽ nhận được nhiệm vụ dễ hay khó.</Instruction>
        <Instruction>- Tùy mỗi nhiệm vụ mà thời gian trả nhiệm vụ sẽ khác nhau.</Instruction>
        <Instruction>- Tùy tu vi mà số lần nhận được nhiệm vụ trong ngày sẽ khác nhau.</Instruction>
        <Instruction>- Với mỗi lần hoàn thành nhiệm vụ, đạo hữu sẽ được 1 vào chuỗi nhiệm vụ, khi chuỗi nhiệm vụ đạt tới các mốc 50, 100, 150, ..., đạo hữu sẽ nhận thêm bonus 50k bạc từ hệ thống.</Instruction>
        <Instruction>- Khi hủy hoặc trả nhiệm vụ trễ chuỗi nhiệm vụ đều sẽ bị reset về 0, có thể dùng Băng Hóa Ngọc để miễn làm nhiệm vụ khó và không bị reset chuỗi nhiệm vụ.</Instruction>
      </InstructionContainer>
      <Button>Nhận nhiệm vụ</Button>
    </Container>
  );
};

export default NhiemVuDuong;
