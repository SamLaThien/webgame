import React from "react";
import styled from "styled-components";

const Container = styled.div`
  background: white;
  padding: 20px;
  border: solid 1px #93b6c8;
  width: 100%;
  box-sizing: border-box;
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

const InfoContainer = styled.div`
  background-color: #e0f4e5;
  border: 1px solid #b3d7e8;
  padding: 15px;
  margin-bottom: 20px;
`;

const InfoText = styled.p`
  margin: 0;
  color: #333;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 10px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SelectContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
`;

const Select = styled.select`
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  font-size: 14px;
`;

const Button = styled.button`
  padding: 10px 20px;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 16px;
  background-color: ${({ color }) => color};

  &:hover {
    background-color: ${({ hoverColor }) => hoverColor};
  }
`;

const DuocVien = () => {
  return (
    <>
      <SectionTitle> DƯỢC VIÊN</SectionTitle>

      <Container>
        <InfoContainer>
          <InfoText>
            <strong>Linh điền:</strong> giá thuê linh điền tùy thuộc vào số
            lượng linh điền đạo hữu đang thuê. Giá thuê hiện tại của đạo hữu là
            2250 bạc/1 ô linh điền. Hiện tại đã cho thuê tổng cộng 25 linh điền.
          </InfoText>
          <InfoText>
            <strong>Túi hạt giống:</strong> tùy loại hạt giống và số lượng linh
            điền đã trồng loại hạt giống đó mà có giá khác nhau, vui lòng xem
            bên dưới.
          </InfoText>
          <InfoText>
            <strong>Kim thưởng:</strong> để trồng 1 ô linh điền bạn sẽ mất 1 kim
            thưởng, hoặc có thể mua hệ thống với giá 500 bạc.
          </InfoText>
          <InfoText>
            <strong>Tưới nước:</strong> 30 phút linh điền cần phải tưới 1 lần,
            sau 5 lần vẫn chưa thấy đạo hữu mất lần tưới đó, mỗi lần tưới cần
            100 bạc, nếu bạn không muốn tự tưới có thể thuê hệ thống tưới tự
            động, phí 500 bạc/lần tưới.
          </InfoText>
          <InfoText>
            <strong>Bạn có thể sử dụng Tính Nhanh</strong> để tính tổng số bạc
            cần để trồng thảo dược. Lưu ý là giá thay đổi liên tục, nên giữa số
            tính nhanh và số thực sẽ có thể có sự sai số nếu bạn không Gieo hạt
            ngay sau khi tính. Phí cho tính nhanh: 200 bạc.
          </InfoText>
          <InfoText>
            <strong>Dùng Hộ Linh Trận</strong> sẽ chặn đứng các tên trộm thảo
            dược.
          </InfoText>
        </InfoContainer>
        <SelectContainer>
          <Select>
            <option>Ngọc Tủy Chi (2000 bạc/túi. Trồng 3h)</option>
            <option>Trích Tinh Thảo (4540 bạc/túi. Trồng 3h)</option>
            <option>Hóa Long Thảo (4000 bạc/túi. Trồng 4h)</option>
            <option>Thiên Linh Quả (4000 bạc/túi. Trồng 4h)</option>
            <option>Thiên Nguyên Thảo (4000 bạc/túi. Trồng 4h)</option>
            <option>Uẩn Kim Thảo (9564 bạc/túi. Trồng 5h)</option>
            <option>Huyết Tinh Thảo (6000 bạc/túi. Trồng 5h)</option>
            <option>Anh Tâm Thảo (8000 bạc/túi. Trồng 6h)</option>
            <option>Hóa Nguyên Thảo (10020 bạc/túi. Trồng 7h)</option>
            <option>Luyện Thần Thảo (23736 bạc/túi. Trồng 8h)</option>
            <option>Hợp Nguyên Thảo (15820 bạc/túi. Trồng 9h)</option>
            <option>Đại Linh Thảo (16000 bạc/túi. Trồng 10h)</option>
          </Select>

          <Button color="#42a5f5" hoverColor="#1e88e5">
            Gieo hạt
          </Button>
          <Button color="#fbc02d" hoverColor="#f9a825">
            Tính Nhanh
          </Button>
        </SelectContainer>
      </Container>
    </>
  );
};

export default DuocVien;
