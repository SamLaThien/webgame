import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  }
`;

export default function App({ Component, pageProps }) {
  console.log('App component is loaded.');
  
  if (typeof window === 'undefined') {
    require('@/jobs/medicineCollector');
    require('@/jobs/mine');

  }

  return (
    <>
      <GlobalStyle />
      <Component {...pageProps} />
    </>
  );
}
