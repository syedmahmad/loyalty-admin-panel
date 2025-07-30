import { Box, Button, Grid, Typography } from "@mui/material";
import Image from "next/image";
import logo3 from '../../../../assets/images/gogo.svg';
import logo4 from '../../../../assets/images/micro.svg';
import MicrosoftButton from "@/components/Microsoft";



export default function LoginPage() {

  

  return (
    <Grid
      container
      sx={{
        minHeight: "100vh",
        backgroundColor: "#fff",
        flexDirection: { xs: "column", md: "row" },
      }}
    >
      {/* Left: Login Panel */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          p: { xs: 4, sm: 6, md: 8 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            mb: { xs: 2, md: 3 },
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Image src={logo3} alt="GoGoMotor Logo" width={160} height={48} />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 500,
              fontSize: { xs: "1.5rem", md: "3rem" },
              color: "#BDBDBD",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            CMS
          </Typography>
        </Box>

        {/* Headline */}
        <Typography
          variant="h6"
          sx={{
            mb: 4,
            fontWeight: 500,
            fontSize: { xs: "1rem", sm: "1.2rem", md: "1.5rem" },
            color: "#333",
            maxWidth: 360,
          }}
        >
          Manage News & Blog Content
          <br />
          Seamlessly Across Your Website
        </Typography>
        <MicrosoftButton/>

        {/* Button */}
        {/* <Button
          fullWidth
          variant="contained"
          startIcon={
            <Image
              src={logo4}
              alt="Microsoft Logo"
              width={20}
              height={20}
           
            />
          }
          
          sx={{
            backgroundColor: "#000",
            color: "#fff",
            textTransform: "none",
              fontSize: "17px",
            borderRadius: "12px",
           
             
            px: 4,
            py: 1.5,
            maxWidth: 320,
            "&:hover": {
              backgroundColor: "#000",
              color: "#fff",
            },
          }}
        >
          
          
          Continue with Microsoft
        </Button> */}
      </Grid>

     
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          backgroundColor: "#f7f9fc",
          display: { xs: "flex", md: "flex" },
          justifyContent: "center",
          alignItems: "center",
          p: 4,
          pt: { xs: 0, md: 4 },
        }}
      >
        <Image
          src="/login-img.svg"
          alt="CMS Illustration"
          width={400}
          height={400}
          style={{
            maxWidth: "100%",
            height: "auto",
          }}
        />
      </Grid>
    </Grid>
    
  );
}
