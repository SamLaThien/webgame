import React from "react";
import styled from "styled-components";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const Container = styled.div`
   background: white;
  padding: 20px;
  border: solid 1px #93b6c8;
  width: 100%;
  box-sizing: border-box;
  
`;

const Title = styled.h2`
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: left;
  
`;

const Label = styled.label`
  width: 100%;
  margin-bottom: 10px;
  font-size: 16px;

  font-weight: bold;
`;

const Input = styled.input`
  width: 100%;
  padding: 11px;
  border: 1px solid #ddd;
  box-sizing: border-box;
  height: 100%;
  font-size: 16px;

  margin-bottom: 10px;
`;

const Button = styled.button`
  padding: 12px 10px;
  background-color: #B3D7E8;
  color: white;
  border: none;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
  width: 15%;
  &:hover {
    background-color: #93B6C8;
  }
`;

const DoiMatKhau = () => {
  return (
    <>
      <Title><LockOutlinedIcon/> THAY ĐỔI MẬT KHẨU</Title>
      <Container>
        <Form>
          <Label htmlFor="newPassword">Nhập mật khẩu mới:</Label>
          <Input
            type="password"
            id="newPassword"
            placeholder="Nhập mật khẩu mới"
          />

          <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới:</Label>
          <Input
            type="password"
            id="confirmPassword"
            placeholder="Xác nhận mật khẩu mới"
          />

          <Button type="submit">Xác nhận</Button>
        </Form>
      </Container>
    </>
  );
};

export default DoiMatKhau;
