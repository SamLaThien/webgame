import { useState } from 'react';
import styled from 'styled-components';
import ReCAPTCHA from 'react-google-recaptcha';
import { useRouter } from 'next/router';

const FormContainer = styled.div`
  background: rgba(255, 255, 255, 0.9);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
  text-align: center;
`;

const Title = styled.h2`
  margin-bottom: 20px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;

  &:hover {
    background-color: #45a049;
  }
`;

const LoginForm = () => {
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [formData, setFormData] = useState({ email: '', password: '' });
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
      <Input type="email" name="email" placeholder="Nhập email" onChange={handleChange} />
      <Input type="password" name="password" placeholder="Nhập mật khẩu" onChange={handleChange} />
      <ReCAPTCHA
        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
        onChange={handleRecaptchaChange}
      />
      <Button onClick={handleSubmit}>Đăng nhập</Button>
    </FormContainer>
  );
};

export default LoginForm;
