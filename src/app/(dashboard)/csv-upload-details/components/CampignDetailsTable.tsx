import React, { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Paper from "@mui/material/Paper";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { InputLabel, MenuItem, Select, TextField, Tooltip, Typography } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";

export const CampaignDetailsTable = ({
  response, apiState, campaignName
}: any) => {
  const [data, setData] = useState(response);
  const [isSend, setIsSend] = useState('2');
  const [templateName, setTemplateName] = useState('');

  useEffect(() => {
    if (isSend !== '2' || templateName !== "") {
      const filteredData = response.filter((item: any) => {
        
        if (isSend === '0') return item.isSend === false && item.template?.template_name.toLowerCase().includes(templateName.toLowerCase());
        else if (isSend === '1') return item.isSend === true && item.template?.template_name.toLowerCase().includes(templateName.toLowerCase());;
        return item.template?.template_name.toLowerCase().includes(templateName.toLowerCase());
      });
      
      setData(filteredData);
    } else {
      setData(response);
    }
  }, [isSend, templateName]);
  

  const columns = [
    // {
    //   accessorKey: "index",
    //   header: "Seq",
    //   cell: ({ row }: any) => <>{row.index + 1}</>,
    // },
    {
      accessorKey: "isSend",
      header: "State",
      cell: ({ row }: any) => (
        <>{row.original.isSend === true ? "Processed" : "Processing"}</>
      ),
    },
    {
      accessorKey: 'gaid',
      header: 'User',
      cell: ({ row }: any) => {
        const customerNum: string = apiState === '3' ? row.original.customer_num : row.original.gaid;
        const isTruncated = customerNum?.length > 20;
        const displayValue = isTruncated
          ? customerNum?.slice(0, 20) + '...'
          : customerNum;
        
        
        return (
          <Tooltip title={isTruncated ? customerNum : ''} arrow>
            <span>{displayValue}</span>
          </Tooltip>
        );
      },
    },
    {
      accessorKey: "template.template_name",
      header: "Template",
      cell: ({ row }: any) => (
        <>{row.original.template?.template_name ?? "N/A"}</>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        let statusToShow = "Pending";
        // const phoneRegex = /((\+9665\d{8})|(05\d{8})|(\+91[789]\d{9})|(0[789]\d{9})|([789]\d{9})|(\+923\d{9})|(03\d{9}))\b/;
        // // need to check either sms delivered from infinito or unifonic
        // const smsSentViaUnifonic = phoneRegex.test(row.original.gaid);
        if (apiState === '1') {
          // status logic for email
          if (row.original.status === "Pending" && row.original.retry_limit >= 5) {
            statusToShow = "Failed";
          } else {
            statusToShow = row.original.status;
          }
        } else if (apiState === '2') {
          // status logic for sms
          if (row.original.isSend === true && row.original.response_code === null) {
            statusToShow = "N/A"; // for unifonic or infinito call still not executed.
          } else if (row.original.isSend === true && row.original.response_code === "000") {
            statusToShow = "Successful";
          } else if (row.original.response_code !== "000") {
            statusToShow = "Failed";
          }

        } else if (apiState === '3') {
          if (row.original.response_code === null) {
            statusToShow = "N/A"; // for unifonic or infinito call still not executed.
          } else if (row.original.response_code === "200" && row.original.status === 'success') {
            statusToShow = "Successful";
          } else if ((row.original.response_code === "200" && row.original.response_code === 'failed' && row.original.response_code === 'pending') || row.original.status !== '200') {
            statusToShow = "Failed";
          }
        }

        // TODO: once, we get the unifonic status , we need to update the status here
        // if (smsSentViaUnifonic) {
        //   statusToShow = 'N/A';
        // }

        return <>{statusToShow}</>;
      },
    },
    {
      accessorKey: "unsend_reason",
      header: "Reason",
      cell: ({ row }: any) => {
        let reason = 'N/A'
        if (row.original.unsend_reason) {
          reason = row.original.unsend_reason;
        }
        return(
        <>
          {reason}
        </>
      )},
    },

    {
      accessorKey: apiState === '1' ? 'is_readed' : "sms_gateway",
      header: apiState === '1' ? "Read" : "Gateway",
      cell: ({ row }: any) => <>{apiState === '1' ? (row.original.is_readed ? 'Yes' : 'No') : (apiState === '3' ? row.original.whatsapp_gateway :row.original.sms_gateway ?? "N/A")}</>,
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }: any) => (
        <>{new Date(row.original.createdAt).toLocaleString()}</>
      ),
    },
  ];

  const table = useReactTable({
    data: data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  const { pageSize, pageIndex } = table.getState().pagination;

  return (
    <>
      <Grid2 container spacing={1} columns={15}>
        <Grid2 xs={15}>
          <Typography
            variant="h3"
          >
            Campaign: {campaignName}
          </Typography>
        </Grid2>
        <Grid2 xs={7.5} md={3}>
          <InputLabel
            sx={{
              fontSize: "14px",
              fontWeight: 600,
              margin: "10px 0px",
            }}
          >
            Message State
          </InputLabel>
          <Select
            defaultValue={"2"}
            value={isSend}
            fullWidth
            onChange={(e) => setIsSend(e.target.value)}
          >
            <MenuItem value="2">Select One</MenuItem>
            <MenuItem value="0">Processing</MenuItem>
            <MenuItem value="1">Processed</MenuItem>
          </Select>
        </Grid2>
        <Grid2 xs={7.5} md={3}>
          <InputLabel
            sx={{
              fontSize: "14px",
              fontWeight: 600,
              margin: "10px 0px",
            }}
          >
            Template
          </InputLabel>
          <TextField
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
          />
        </Grid2>
      </Grid2>
      <br />
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="dashboard table">
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell key={header.id} sx={{ fontWeight: "bold" }}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  No data found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, { label: "All", value: data.length }]}
          component="div"
          count={table.getFilteredRowModel().rows.length}
          rowsPerPage={pageSize}
          page={pageIndex}
          onPageChange={(_, page) => table.setPageIndex(page)}
          onRowsPerPageChange={(e) => {
            const size = e.target.value ? Number(e.target.value) : 5;
            table.setPageSize(size);
          }}
        />
      </TableContainer>
    </>
  );
};
