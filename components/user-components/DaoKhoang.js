import React from "react";
import styled from "styled-components";
import DiamondIcon from "@mui/icons-material/Diamond";

const Container = styled.div`
  background: white;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  border-radius: 0;
  margin-bottom: 20px;
  width: 100%;
  border: 1px solid #93b6c8;
  box-sizing: border-box;
  font-size: 16px;
`;

const SectionTitle = styled.h3`
  margin-bottom: 20px;
  text-align: left;
  background-color: white;
  font-size: 18px;
  padding: 11px;
  border: solid 1px #93b6c8;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  gap: 5px;
  margin-top: 0;
`;

const StatusContainer = styled.div`
  background-color: #e0f4e5;
  border: 1px solid #b3d7e8;
  padding: 15px;
  border-radius: 5px;
`;

const Status = styled.p`
  margin: 0;
  color: #333;
  font-size: 16px;
`;

const InstructionContainer = styled.div`
  background-color: #d1e7dd;
  padding: 15px;
  border-radius: 5px;
  margin-top: 10px;
`;

const Instruction = styled.p`
  margin: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.6;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-top: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-sizing: border-box;
  font-size: 16px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 20px;
`;

const Button = styled.button`
  flex: 1;
  padding: 12px 20px;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  text-align: center;

  ${({ color }) => `
    background-color: ${color};

    &:hover {
      background-color: ${darkenColor(color)};
    }
  `}
`;

const DaoKhoang = () => {
  return (
    <>
      <SectionTitle>
        <DiamondIcon /> ĐÀO KHOÁNG
      </SectionTitle>
      <Container>
        <StatusContainer>
          <Status>Phí vào mỏ là 200 bạc/1 giờ.</Status>
          <Status>
            - Để đào khoáng đạo hữu cần có Kim Thương (sẽ mất 1 đồ bên/1h), nếu
            không có thì có thể thuê của hệ thống với giá 50 bạc/giờ.
          </Status>
          <Status>
            - Có nhiều hầm mỏ, hãy chọn cho mình hầm mỏ thích hợp. Tùy vận khí
            của bản thân sẽ đào được nhiều hay ít hoặc không đào được gì.
          </Status>
          <Status>- Càng nhiều người cùng đào, tỉ lệ đào được càng cao.</Status>
        </StatusContainer>
        <Input type="text" placeholder="Số giờ" />
        <ButtonContainer>
          <Button color="#ff7043">Mỏ Linh Cát (đang có 141 người đào)</Button>
          <Button color="#fbc02d">Mỏ Thiên Tân (đang có 9 người đào)</Button>
          <Button color="#42a5f5">Mỏ Nhất Nhật (đang có 1 người đào)</Button>
        </ButtonContainer>
      </Container>
    </>
  );
};

// Utility function to darken the color on hover
const darkenColor = (color) => {
  const darkenAmount = 0.1; // Adjust this value for darker or lighter shades
  let usePound = false;

  if (color[0] === "#") {
    color = color.slice(1);
    usePound = true;
  }

  const num = parseInt(color, 16);
  let r = (num >> 16) - darkenAmount * 255;
  let g = ((num >> 8) & 0x00ff) - darkenAmount * 255;
  let b = (num & 0x0000ff) - darkenAmount * 255;

  if (r < 0) r = 0;
  if (g < 0) g = 0;
  if (b < 0) b = 0;

  const darkenedColor = (r << 16) | (g << 8) | b;
  return (usePound ? "#" : "") + darkenedColor.toString(16).padStart(6, "0");
};

export default DaoKhoang;
