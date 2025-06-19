'use client'
import { GET } from "@/utils/AxiosUtility";
import { Button, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import MuiCsvUploader from "./CSVuploader";

const MainLayoutCSVPage = () => {
  const [apiState, setApiState] = useState('0');
  const [allTemplates, setAllTemplates] = useState([]);
  const [allTemplatesWithName, setAllTemplatesWithName] = useState([]);
  const [selectedLang, setSelectedLang] = useState('0');
  const [selectedTemplateUuid, setSelectedTemplateUuid] = useState('0');
  const [selectedTemplate, setSelectedTemplate] = useState<any>([]);
  const [campaignName, setCampaignName] = useState('');
  const [dynamicFieldsInTemplate, setDynamicFieldsInTemplate] = useState([]);
  const lcData = localStorage.getItem("client-info");
  const parsedLCData = lcData && JSON.parse(lcData);
  const client_id = parsedLCData?.id;

  useEffect(() => {
    const getAllTemplates = async () => {
      if (apiState === '1') {
        const returnedData = await GET(`/templates/all-email?client_id=${client_id}`, {
          headers: {
            'user-token': localStorage.getItem('token')
          }
        });

        console.log("returnedData", returnedData);
        
        const emailTemplates: any = [];

        const TemplatesToUse = returnedData?.data.filter((item: any) => item.translations[0].bulk_enabled === true);

        console.log("TemplatesToUse", TemplatesToUse);
        
        if (TemplatesToUse?.length > 0) {
          TemplatesToUse.map((item: any) => {
            emailTemplates.push({
              key: item.template_name,
              value: item.uuid,
            })
          })
        }

        setAllTemplatesWithName(emailTemplates);
        setAllTemplates(TemplatesToUse);
        
      } else if (apiState === '2') {
        const returnedData = await GET(`/templates/all-sms?client_id=${client_id}`, {
          headers: {
            'user-token': localStorage.getItem('token')
          }
        });

        const TemplatesToUse = returnedData?.data.filter((item: any) => item.translations[0].bulk_enabled === true);

        const smsTemplate: any = [];
        
        if (TemplatesToUse.length > 0) {
          TemplatesToUse.map((item: any) => {
            smsTemplate.push({
              key: item.template_name,
              value: item.uuid,
            })
          })
        }

        setAllTemplatesWithName(smsTemplate);
        setAllTemplates(TemplatesToUse);
      } else if (apiState === '3') {
        const returnedData = await GET(`/templates/all-whatsapp?client_id=${client_id}`, {
          headers: {
            'user-token': localStorage.getItem('token')
          }
        });

        const TemplatesToUse = returnedData?.data.filter((item: any) => item.translations[0].bulk_enabled === true);

        const whatsappTemplates: any = [];
        
        if (TemplatesToUse.length > 0) {
          TemplatesToUse.map((item: any) => {
            whatsappTemplates.push({
              key: item.template_name,
              value: item.uuid,
            })
          })
        }

        setAllTemplatesWithName(whatsappTemplates);
        setAllTemplates(TemplatesToUse);
      } else {
        toast.warning("Please select a valid service");
      }
    }

    setSelectedTemplate([]);
    setAllTemplatesWithName([]);
    setAllTemplates([]);
    setSelectedLang('0');
    setSelectedTemplateUuid('0');
    setDynamicFieldsInTemplate([]);
    setSelectedLang('0');

    if (apiState !== '0') {
      getAllTemplates();
    }
  }, [apiState]);

  useEffect(() => {
    if (selectedTemplateUuid !== '0') {
      const selectedTemplate: any = allTemplates.filter((item: any) => item.uuid === selectedTemplateUuid);
      console.log("selectedTemplate", selectedTemplate, selectedTemplateUuid, allTemplatesWithName);
      
      setSelectedTemplate(selectedTemplate);
      setSelectedLang('0');
      setDynamicFieldsInTemplate([]);
    } else {
      setSelectedTemplate([]);
      setSelectedLang('0');
      setSelectedTemplateUuid('0');
      setDynamicFieldsInTemplate([]);
    }
  }, [selectedTemplateUuid]);

  useEffect(() => {
    if (selectedTemplate.length > 0 && selectedLang !== '0') {
      const data: any = selectedTemplate[0];
      
      let dynamicFields: any = [];

      data.translations.forEach(({ body, language_code }: any) => {
        if (!body || language_code !== selectedLang) return;
        const matches = [...body.matchAll(/{{\s*(\w+)\s*}}/g)];
        console.log("matches", matches);
        
        dynamicFields = [...new Set(matches.map(m => `dynamic_${m[1]}`))];
      });

      setDynamicFieldsInTemplate(dynamicFields);
    }
  }, [selectedTemplate, selectedLang])

  const handleDownload = () => {
    const data: any = selectedTemplate[0];
    let headers: any = [];
    // Dummy CSV content
    if (apiState === '1') {
      // email headers
      headers = [
        'to_email', ...dynamicFieldsInTemplate
      ];
    } else if (apiState === '2') {
      // sms headers
      headers = [
        'to_number', ...dynamicFieldsInTemplate
      ];
    } else if (apiState === '3') {
      // whatsapp headers
      headers = [
        'to_number', 'components'
      ];
    }

    const csvContent = [
      headers.join(','), // header row
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dummy-${apiState === '1' ? 'email' : apiState === '2' ? 'sms' : 'whatsapp'}-${selectedTemplate[0].template_name}-data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


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

      {allTemplatesWithName.length > 0 && (
        <Grid2 xs={7.5} md={3}>
          <InputLabel
            sx={{
              fontSize: "14px",
              fontWeight: 600,
              margin: "10px 0px",
            }}
          >
            Select Template
          </InputLabel>
          <Select
            defaultValue={"0"}
            value={selectedTemplateUuid}
            fullWidth
            onChange={(e) => setSelectedTemplateUuid(e.target.value)}
          >
            <MenuItem value={'0'}>Select One</MenuItem>
            {
              allTemplatesWithName.map((item: any) => {
                return(
                  <MenuItem value={item.value} key={item.key}>{item.key}</MenuItem>
                )
              })
            }
          </Select>
        </Grid2>
      )}

      {allTemplatesWithName.length > 0 && selectedTemplate.length > 0 && (
        <Grid2 xs={7} md={2}>
          <InputLabel
            sx={{
              fontSize: "14px",
              fontWeight: 600,
              margin: "10px 0px",
            }}
          >
            Select Language
          </InputLabel>
          <Select
            defaultValue={"0"}
            value={selectedLang}
            fullWidth
            onChange={(e) => setSelectedLang(e.target.value)}
          >
            <MenuItem value={'0'}>Select One</MenuItem>
            <MenuItem value={'en'}>English</MenuItem>
            <MenuItem value={'ar'}>Arabic</MenuItem>
          </Select>
        </Grid2>
      )}

      <Grid2 xs={0} md={3} />

      {allTemplatesWithName.length > 0 && selectedTemplate.length > 0 && selectedLang !== '0' && (
        <>
        <Grid2 xs={7.5} md={4}>
          <InputLabel
            sx={{
              fontSize: "14px",
              fontWeight: 600,
              margin: "10px 0px",
            }}
          >
            Download CSV Format
          </InputLabel>
          <Button
            fullWidth
            variant="contained"
            onClick={() => {handleDownload()}}
          >
            Download
          </Button>
        </Grid2>

        {allTemplatesWithName.length > 0 && selectedTemplate.length > 0 && selectedLang !== '0' && (
        <Grid2 xs={7.5} md={3}>
        <InputLabel
          sx={{
            fontSize: "14px",
            fontWeight: 600,
            margin: "10px 0px",
          }}
        >
          Campaign Name
        </InputLabel>
        <TextField
          variant="outlined"
          value={campaignName}
          fullWidth
          placeholder="Enter Campaign Name"
          onChange={(e) => setCampaignName(e.target.value)}
        />
        </Grid2>
    )}

        <Grid2 xs={15} mt={5}>
          <MuiCsvUploader
            apiState={apiState}
            selectedTemplate={selectedTemplate}
            selectedLang={selectedLang}
            dynamicFieldsInTemplate={dynamicFieldsInTemplate}
            campaignName={campaignName}
          />
        </Grid2>
      </>
      )}

      {allTemplatesWithName.length === 0 && apiState !== '0' && (
        <Grid2 xs={15} mt={5}>
          <h2 style={{textAlign:'center'}}>No templates available for this service</h2>
        </Grid2>
      )}
    </Grid2>
    
    </>
  )
}

export default MainLayoutCSVPage;