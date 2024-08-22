// components/CboxGeneral.js
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import cryptoJs from 'crypto-js';
import axios from 'axios';
import jwt from 'jsonwebtoken';

const StyledIframe = styled.iframe`
  background: white;
  width: 100%;
  height: 80vh;
  border: none;
`;

const CboxGeneral = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const decodedToken = jwt.decode(token);
          if (decodedToken && decodedToken.userId) {
            const { data: userData } = await axios.get(`/api/user/clan/user-info?userId=${decodedToken.userId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setUser(userData);
          }
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
    const ngoaiHieu = user.ngoai_hieu ? user.ngoai_hieu : user.username;

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
    user && (
      <StyledIframe
        src={getCboxUrl()}
        allowTransparency="no"
        allow="autoplay"
        frameBorder="0"
        marginHeight="0"
        marginWidth="0"
        scrolling="auto"
      ></StyledIframe>
    )
  );
};

export default CboxGeneral;
