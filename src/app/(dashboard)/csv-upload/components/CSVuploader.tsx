'use client';

import React, { useEffect, useRef, useState } from 'react';
import Papa from 'papaparse';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Typography,
} from '@mui/material';
import { GET, POST } from '@/utils/AxiosUtility';
import { toast } from 'react-toastify';

export default function MuiCsvUploader({
  apiState, selectedTemplate, selectedLang, dynamicFieldsInTemplate, campaignName
}: any) {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [correctRecords, setCorrectRecords] = useState<any[]>([]);
  const [incorrectRecords, setIncorrectRecords] = useState<any[]>([]);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const fieldsToCheckForEmail = [
    "template_id",
    "language_code",
    "cc_email (optional)",
    "mail_attachment_filename",
    "mail_attachment_path"
  ];

  const fieldsToCheckForSMS = [
    "template_id",
    "language_code",
  ];

  const fieldsToCheckForWhatsapp = [
    "template_id",
    "language_code",
  ];

  function isValidBase64String(str: string): boolean {
    const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
    return (
      typeof str === "string" &&
      base64Regex.test(str) &&
      str.length % 4 === 0
    );
  }
  
  const getMismatchedFields = (records: any[], fields: string[]) => {
    if (records.length < 1) return [];
  
    const base = records[0];
    const mismatchedFields = new Set<string>();
  
    for (let i = 1; i < records.length; i++) {
      for (const field of fields) {
        if (records[i][field] !== base[field]) {
          mismatchedFields.add(field);
        }
      }
    }
  
    return Array.from(mismatchedFields);
  };

  useEffect(() => {
    if (csvData.length > 0) {
      const process = async () => {

      const ignoredFieldsForEmails = [
        "cc_email (optional)",
        "mail_attachment_filename",
        "mail_attachment_path",
      ];

      const requiredFieldsForEmails = [
        "to_email",
      ]

      const requiredFieldsForSMS = [
        "to_number",
      ]
      const requiredFieldsForWhatsapp = [
        "to_number",
        "components"
      ]

      const requiredFields = apiState === '1' ? requiredFieldsForEmails : apiState === '2' ? requiredFieldsForSMS : requiredFieldsForWhatsapp;

      const correctData: any = [];
      const incorrectData: any = [];

      csvData.forEach((entry: any, index: number) => {
        const missingKeys = dynamicFieldsInTemplate.filter((key: any) => !(key in entry));
        const requireFieldsKeysInEntry = requiredFields.filter((key: any) => !(key in entry));

        console.log("requireFieldsKeysInEntry", requireFieldsKeysInEntry);
        
        if (requireFieldsKeysInEntry.length > 0) {
          if (index === 0) {
            setHasError(true);
            setErrorMessage(`You've missing required field: ${requireFieldsKeysInEntry.join(', ')}`);
          }
          incorrectData.push(entry);
          return; // ⛔️ Stop processing
        }
        
        if (missingKeys.length > 0) {
          if (index === 0) {
            setHasError(true);
            setErrorMessage(`You've missing required dynamic field: ${missingKeys.join(', ')}`);
          }
          incorrectData.push(entry);
          return; // ⛔️ Stop processing
        }

        const missingValuesForKeys: any= [];
        Object.entries(entry).forEach(([key, value]) => {
          if (ignoredFieldsForEmails.includes(key)) return false;
          if (value === null || value === undefined || value === "") {
            missingValuesForKeys.push(key);
          }
          return value === null || value === undefined || value === "";
        });

        const hasEmptyRequired = missingValuesForKeys.length > 0;

        if (hasEmptyRequired) {
          setHasError(true);
          setErrorMessage(`You've missing a required value for dynamic field : ${missingValuesForKeys.join(', ')}`);
          incorrectData.push(entry);
        } else {
          correctData.push(entry);
        }
      });

      setCorrectRecords(correctData);
      setIncorrectRecords(incorrectData);
      }

      // Check for mismatched fields
      let mismatches: any = [];

      if (apiState === '1') {
        mismatches = getMismatchedFields(csvData, fieldsToCheckForEmail);
      } else if (apiState === '2') {
        mismatches = getMismatchedFields(csvData, fieldsToCheckForSMS);
      } else if (apiState === '3') {
        mismatches = getMismatchedFields(csvData, fieldsToCheckForWhatsapp);
      }

      if (mismatches.length > 0) {
        setHasError(true);
        setErrorMessage(`Following fields should've the same values: ${mismatches.join(', ')}`);
        // toast.error(`Following fields should've the same values: ${mismatches.join(', ')}`);
        setIncorrectRecords(csvData);
      } else {
        process();
      }
     
    }
  }, [csvData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name); // ✅ set file name
      parseCsv(file);
    }
  };

  const parseCsv = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: false,
      complete: (results: any) => {
        setCsvData(results.data);
      },
      error: (err: any) => {
        setHasError(true);
        setErrorMessage('Error parsing CSV file. Please check the format.');
        console.error('Error parsing CSV:', err);
      },
    });
  };

  const handleDownload = () => {
    let headers: any = [Object.keys(incorrectRecords[0])];

    const rows: any = [];

    incorrectRecords.forEach((record: any) => {
      rows.push(Object.values(record));
    })

    const csvContent = [
      headers.join(','), // header row
      ...rows.map((row: any) => row.join(',')), // data rows
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

  const handleReset = () => {
    setFileName(null);
    setCsvData([]);
    setCorrectRecords([]);
    setIncorrectRecords([]);
    setHasError(false);
    setErrorMessage('');
  };

  const handleProcess = async () => {
    try {
      setLoading(true);
      if (apiState === '1') {
        const baseRecord = correctRecords[0];
        const output: any = {
          campaign_name: campaignName,
          template_id: selectedTemplate[0].uuid,
          language_code: selectedLang,
          to: correctRecords.map(e => {
            const dynamic: any = {};
            Object.entries(e).forEach(([key, value]) => {
              if (key.startsWith("dynamic_")) {
                dynamic[key.replace("dynamic_", "")] = value;
              }
            });
            return {
              email: e.to_email,
              dynamic_fields: dynamic
            };
          })
        };

        // Conditionally add cc_email
        const ccEmail = baseRecord["cc_email (optional)"];
        if (ccEmail && ccEmail.trim() !== "") {
          output.cc_email = ccEmail;
        }

        // Conditionally add bcc
        const bccEmail = baseRecord["bcc_email (optional)"];
        if (bccEmail && bccEmail.trim() !== "") {
          output.bcc = bccEmail;
        }

        // Conditionally add mail_attachment
        const filename = baseRecord.mail_attachment_filename;
        const path = baseRecord.mail_attachment_path;

        if ((filename && filename.trim() !== "") || (path && path.trim() !== "")) {
          output.mail_attachment = [
            {
              filename: filename?.trim() || null,
              path: path?.trim() || null
            }
          ];
        }

  
        const response = await POST('/dispatch-mails/bulk', output, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('client-secret')}`,
          },
        })

        console.log("response", response);
        

        if (response?.status === 200 || response?.status === 201) {
          toast.success('Emails dispatched successfully!');
        } else {
          toast.error('Failed to dispatch emails.');
        }

        setLoading(false);
      } else if (apiState === '2') {
        const output = {
          campaign_name: campaignName,
          template_id: selectedTemplate[0].uuid,
          language_code: selectedLang,
          to: correctRecords.map(e => {
            const dynamic: any = {};
            Object.entries(e).forEach(([key, value]) => {
              if (key.startsWith("dynamic_")) {
                dynamic[key.replace("dynamic_", "")] = value;
              }
            });
            return {
              number: e.to_number,
              dynamic_fields: dynamic
            };
          })
        };
  
        const response = await POST('/dispatch-message/bulk', output, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('client-secret')}`,
          },
        })

        if (response?.status === 200 || response?.status === 201) {
          toast.success('SMS dispatched successfully!');
        }
        else {
          toast.error('Failed to dispatch SMS.');
        }

        setLoading(false);
      } else if (apiState === '3') {
        const output = {
          campaign_name: campaignName,
          template_id: selectedTemplate[0].uuid,
          language_code: selectedLang,
          to: correctRecords.map(e => {
            return {
              number: e.to_number,
            };
          }),
          components: JSON.parse(correctRecords[0].components),
        };
  
        const response = await POST('/dispatch-whatsapp/bulk', output, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('client-secret')}`,
          },
        })

        if (response?.status === 200 || response?.status === 201) {
          toast.success('WhatsApp messages dispatched successfully!');
        } else {
          toast.error('Failed to dispatch WhatsApp messages.');
        }

        setLoading(false);
      }
    } catch (error) {
      console.error("Error processing records:", error);
      setHasError(true);
      setErrorMessage('Error processing records. Please try again.');
      setLoading(false);
    }
  }

  return (
    <Box>
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
        <Paper
          elevation={3}
          sx={{
            minWidth: 500,
            p: 4,
            textAlign: 'center',
            border: '2px dashed #1976d2',
            bgcolor: '#e3f2fd',
            cursor: 'pointer',
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          {!fileName && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <Typography variant="h6" color="primary">
                Click to Upload your CSV file here
              </Typography>
            </>
          )}
          {fileName && (
            <>
              <Typography variant="body2" mt={2} color="text.secondary">
                📄 <strong>Uploaded File:</strong> {fileName}
                <br />
                ✅ Correct Rows in data: {correctRecords.length}
                <br />
                {incorrectRecords.length > 0 && (
                  <>
                  ❌ Incorrect Data: {incorrectRecords.length}
                  <br />
                  <br />
                  <span onClick={() => handleDownload()} style={{ cursor: 'pointer', color: 'blueviolet'}}>Download the wrong records file</span>
                  </>
                )}
              </Typography>
              <br />
              {hasError && (
                <Typography variant="body2" mt={2} color="text.secondary">
                  <strong style={{color: 'red'}}>Error</strong>
                  <br />
                  {errorMessage}
                </Typography>
            )}
            </>
          )}
          {fileName && incorrectRecords.length > 0 && (
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button
                size='small'
                variant="outlined"
                onClick={() => {handleReset()}}
              >
                Re-upload CSV
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
      <Box display="flex" justifyContent="flex-end" mt={2}>
      <Button
        sx={{ ml: 2, minWidth: 200 }} // optional: ensures space is consistent during loading
        variant="contained"
        disabled={correctRecords.length === 0 || loading}
        onClick={() => campaignName.trim() === "" ? toast.error("Campaign name is required") : handleProcess()}
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          'Process Correct Records'
        )}
      </Button>
      </Box>
    </Box>
  );
}
