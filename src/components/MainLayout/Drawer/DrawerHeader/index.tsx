// material-ui
import { useTheme } from '@mui/material/styles';
import { Link, Typography } from '@mui/material';
// project import
import DrawerHeaderStyled from './DrawerHeaderStyled';
import Image from "next/image";
import logo3 from '@/assets/images/logo3.jpeg';

// types
import { MenuOrientation } from '../../../../types/config';

// ==============================|| DRAWER HEADER ||============================== //

interface Props {
  open: boolean;
}

const DrawerHeader = ({ open }: Props) => {
  const theme = useTheme();

  return (
    <DrawerHeaderStyled
      theme={theme}
      open={open}
      sx={{
        minHeight: '60px',
        width: 'inherit',
        paddingTop: '8px',
        paddingBottom: '8px',
        paddingLeft: 0,
      }}
    >
      <Link href="/">
      {open ? 
      // <Typography width={150} variant='h1'>LOGO</Typography>
      <Image
          src={'/gogo-motor-logo.svg'}
          alt="logo"
          width={150}
          height={35}
        /> 
        : 
        // <Typography width={45} >LOGO</Typography>
        <Image
          src={'/gogo-motor-logo.svg'}
          alt="logo"
          width={45}
          height={35}
        />
      }
        
      </Link>
    </DrawerHeaderStyled>
  );
};

export default DrawerHeader;
