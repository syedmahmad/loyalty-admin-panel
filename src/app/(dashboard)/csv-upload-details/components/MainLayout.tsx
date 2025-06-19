'use client'
import { GET } from "@/utils/AxiosUtility";
import { Button, InputLabel, MenuItem, Select } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { DashboardTableData } from "./DashboardTableData";

const MainLayoutCSVPage = () => {
  const [apiState, setApiState] = useState('0');
  const lcData = localStorage.getItem("client-info");
  const parsedLCData = lcData && JSON.parse(lcData);
  const client_id = parsedLCData?.id;
  const [data, setData] = useState<any>([]);

  useEffect(() => {
    const getAllTemplates = async () => {
      if (apiState === '1') {
        const returnedData = await GET(`/mails-history/get-all-campaigns?clientId=${client_id}`);
        if (returnedData?.data.length > 0) {
          setData(returnedData?.data);
        }
        
      } else if (apiState === '2') {
        const returnedData = await GET(`/sms-history/get-all-campaigns?clientId=${client_id}`);
        if (returnedData?.data.length > 0) {
          setData(returnedData?.data);
        }

      } else if (apiState === '3') {
        const returnedData = await GET(`/whatsapp-history/get-all-campaigns?clientId=${client_id}`);
        if (returnedData?.data.length > 0) {
          setData(returnedData?.data);
        }
      } else {
        toast.warning("Please select a valid service");
      }
    }

    if (apiState !== '0') {
      setData([]);
      getAllTemplates();
    }
  }, [apiState]);


  return (
    <>
    <Grid2 container spacing={1} columns={15} alignItems="center">
      <Grid2 xs={7.5} md={3}>
        <InputLabel
          sx={{
            fontSize: "14px",
            fontWeight: 600,
            margin: "10px 0px",
          }}
        >
          Choose Service
        </InputLabel>
        <Select
          defaultValue={"0"}
          value={apiState}
          fullWidth
          onChange={(e) => setApiState(e.target.value)}
        >
          <MenuItem value={'0'}>Select One</MenuItem>
          <MenuItem value={'1'}>Email</MenuItem>
          <MenuItem value={'2'}>SMS</MenuItem>
          <MenuItem value={'3'}>Whatsapp</MenuItem>
        </Select>
      </Grid2>

      <Grid2 xs={0} md={3} />

      {data.length > 0 && (<Grid2 xs={15}>
        <DashboardTableData 
          response={data}
          apiState={apiState}
        />
      </Grid2>)}

      {data.length === 0 && apiState !== '0' && (
        <Grid2 xs={15} mt={5}>
          <h2 style={{textAlign:'center'}}>No Data available for this service</h2>
        </Grid2>
      )}
    </Grid2>
    
    </>
  )
}

export default MainLayoutCSVPage;