import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import crypto from 'crypto';
import styled from 'styled-components';

const StyledIframe = styled.iframe`
  background: white;
`;

const Home = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const getCboxUrl = () => {
    const secret = process.env.NEXT_PUBLIC_CBOX_SECRET;
    const baseUrl = process.env.NEXT_PUBLIC_CBOX_BASE_URL;
    const boxid = process.env.NEXT_PUBLIC_CBOX_BOXID;
    const boxtag = process.env.NEXT_PUBLIC_CBOX_BOXTAG;
    const params = {
      boxid,
      boxtag,
      nme: user ? user.name : "Guest",
      lnk: '',
      pic: ''
    };

    const queryParams = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    const path = `/box/?${queryParams}`;
    const sig = encodeURIComponent(crypto.createHmac('sha256', secret).update(path).digest('base64'));
    return `${baseUrl}${path}&sig=${sig}`;
  };

  return (
    <Layout>
      {user && (
        <StyledIframe
          src={getCboxUrl()}
          width="100%"
          height="450"
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
