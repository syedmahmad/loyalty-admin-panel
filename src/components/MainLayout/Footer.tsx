import { Stack, Typography } from '@mui/material';

const Footer = () => (
  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: '24px 0px 0px', mt: 'auto' }}>
    <Typography variant="caption">&copy; Copyright © 2023, National Auto Trust Company, All Rights
                  Reserved, CR No.: 4030436087, VAT No.: 300000603210003,
                  Unified No.: 7026415450</Typography>
    <Typography variant="caption">&copy; NEED HELP? QCmanagermobileNo@mobileNo.com </Typography>
  </Stack>
);

export default Footer;
