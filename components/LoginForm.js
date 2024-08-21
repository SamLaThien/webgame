import { useState } from 'react';
import styled from 'styled-components';
import ReCAPTCHA from 'react-google-recaptcha';
import { useRouter } from 'next/router';

const FormContainer = styled.div`
  background-color: white;  
  padding: 20px;
  border: 1px solid #93B6C8; 
  max-width: 400px;
  width: 100%;
  text-align: center;
  margin: 0 auto;
`;

const Title = styled.h2`
  margin: 0;
  color: black; 
  font-size: 20px;  
`;

const Input = styled.input`
  width: calc(100% - 20px);
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #93B6C8; 
  background-color: #ffffff; 
  color: #333; 
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  background-color: #93B6C8;  
  color: white;
  border: none;
  cursor: pointer;
  margin-top: 10px;

  &:hover {
    background-color: #76A9C2; 
  }
`;

const ErrorMessage = styled.p`
  color: red;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LoginForm = () => {
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const router = useRouter();

  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recaptchaToken) {
      alert('Please complete the CAPTCHA');
      return;
    }

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, recaptchaToken }),
      });

      const result = await response.json();
      if (response.ok) {
        alert('Login successful');
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        router.push('/');
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Login failed');
    }
  };

  return (
    <FormContainer>
      <Title>ĐĂNG NHẬP</Title>
      <p>Hãy đăng nhập để có một trải nghiệm tốt hơn</p>
      <Form onSubmit={handleSubmit}>
        <Input type="text" name="username" placeholder="Nhập tên đăng nhập" onChange={handleChange} />
        <Input type="password" name="password" placeholder="Nhập mật khẩu" onChange={handleChange} />
        <ReCAPTCHA
          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
          onChange={handleRecaptchaChange}
        />
        <Button type="submit">Đăng nhập</Button>
      </Form>
    </FormContainer>
  );
};

export default LoginForm;
