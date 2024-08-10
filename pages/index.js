import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import styled from 'styled-components';
import cryptoJs from 'crypto-js';
import axios from 'axios';
import ViewInArOutlinedIcon from '@mui/icons-material/ViewInArOutlined';

const StyledIframe = styled.iframe`
  background: white;
  width: 100%;
  height: 450px;
  border: none;
`;

const SectionTitle = styled.h2`
  margin-bottom: 20px;
  margin-top: 0;
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 18px;
  background-color: white;
  width: 100%;
  padding: 11px 20px;
  border: 1px solid #93b6c8;
  box-sizing: border-box;
  flex-direction: row;
  gap: 5px;
`;

const Home = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
          const { data: userData } = await axios.get(`/api/user/clan/user-info?userId=${storedUser.id}`);
          setUser(userData);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const getCboxUrl = () => {
    const secret = process.env.NEXT_PUBLIC_CBOX_SECRET;
    const baseUrl = process.env.NEXT_PUBLIC_CBOX_BASE_URL;
    const boxid = process.env.NEXT_PUBLIC_CBOX_BOXID;
    const boxtag = process.env.NEXT_PUBLIC_CBOX_BOXTAG;
    const ngoaiHieu = user?.ngoai_hieu || 'Guest';

    const params = {
      boxid,
      boxtag,
      nme: ngoaiHieu,
      lnk: '',  
      pic: ''  
    };

    const queryParams = Object.entries(params)
      .filter(([key, value]) => value)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    const path = `/box/?${queryParams}`;
    const sig = encodeURIComponent(cryptoJs.HmacSHA256(path, secret).toString(cryptoJs.enc.Base64));

    return `${baseUrl}${path}&sig=${sig}`;
  };

  return (
    <Layout>
      {user && (
        <StyledIframe
          src={getCboxUrl()}
          allowTransparency="no"
          allow="autoplay"
          frameBorder="0"
          marginHeight="0"
          marginWidth="0"
          scrolling="auto"
        ></StyledIframe>
      )}
    </Layout>
  );
};

export default Home;
