import { extendTheme } from '@chakra-ui/react';

const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  fonts: {
    heading: `'Teko', sans-serif`,
    body: `'Inter', sans-serif`,
  },
  colors: {
    brand: {
      cyan: '#5FF0C0',
      magenta: '#FF4FA0',
      gold: '#E8B94D',
      bronze: '#C68A4E',
      silver: '#B9C2C9',
    },
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' ? '#0E1410' : '#F4F6F2',
        color: props.colorMode === 'dark' ? '#EAF3E9' : '#12180F',
      },
    }),
  },
  components: {
    Heading: {
      baseStyle: { letterSpacing: '0.01em' },
    },
    Button: {
      baseStyle: { borderRadius: 'full', fontWeight: 700 },
    },
  },
});

export default theme;
