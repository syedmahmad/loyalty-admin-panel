import React, { useEffect } from "react";
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
import Grid2 from "@mui/material/Unstable_Grid2";
import { InputLabel, MenuItem, Select, TextField, Button, Tooltip } from "@mui/material";
import { useDebounce } from "use-debounce";

export const WhatsAppTableData = ({
  response,
  status,
  setStatus,
  gaid,
  setGaid,
  isSend,
  setIsSend,
  reFetch,
  setTemplate,
  template
}: any) => {
  const { data } = response;

  const [debouncedTemplate] = useDebounce(template, 300);
  useEffect(() => {
    reFetch();
  }, [debouncedTemplate]);

  const [debouncedStaus] = useDebounce(status, 300);
  useEffect(() => {
    reFetch();
  }, [debouncedStaus]);

  const [debouncedGaid] = useDebounce(gaid, 300);
  useEffect(() => {
    reFetch();
  }, [debouncedGaid]);

  const [debouncedIsSend] = useDebounce(isSend, 300);
  useEffect(() => {
    reFetch();
  }, [debouncedIsSend]);

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
      accessorKey: 'customer_num',
      header: 'User',
      cell: ({ row }: any) => {
        const customerNum: string = row.original.customer_num;
        const isTruncated = customerNum.length > 20;
        const displayValue = isTruncated
          ? customerNum.slice(0, 20) + '...'
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
        // const phoneRegex = /((\+9665\d{8})|(05\d{8})|(\+91[789]\d{9})|(0[789]\d{9})|([789]\d{9})|(\+923\d{9})|(03\d{9}))\b/;
        // // need to check either sms delivered from infinito or unifonic
        // const smsSentViaUnifonic = phoneRegex.test(row.original.gaid);

        let statusToShow = "Pending";
        if (row.original.response_code === null) {
          statusToShow = "N/A"; // for unifonic or infinito call still not executed.
        } else if (row.original.response_code === "200" && row.original.status === 'success') {
          statusToShow = "Successful";
        } else if ((row.original.response_code === "200" && row.original.response_code === 'failed' && row.original.response_code === 'pending') || row.original.status !== '200') {
          statusToShow = "Failed";
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
      cell: ({ row }: any) => (
        <>
          {!row.original.unsend_reason
            ? "N/A"
            : row.original.unsend_reason}
        </>
      ),
    },

    {
      accessorKey: "whatsapp_gateway",
      header: "Gateway",
      cell: ({ row }: any) => (
        <>{row.original?.whatsapp_gateway?.toUpperCase() ?? "N/A"}</>
      ),
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
        <Grid2 xs={7.5} md={2}>
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
        <Grid2 xs={7.5} md={2}>
          <InputLabel
            sx={{
              fontSize: "14px",
              fontWeight: 600,
              margin: "10px 0px",
            }}
          >
            USER
          </InputLabel>
          <TextField
            variant="outlined"
            value={gaid}
            fullWidth
            placeholder="Search User"
            onChange={(e) => setGaid(e.target.value)}
          />
        </Grid2>
        <Grid2 xs={7.5} md={2}>
          <InputLabel
            sx={{
              fontSize: "14px",
              fontWeight: 600,
              margin: "10px 0px",
            }}
          >
            Status
          </InputLabel>
          <Select
            defaultValue={"3"}
            value={status}
            fullWidth
            onChange={(e) => setStatus(e.target.value)}
          >
            <MenuItem value="3">Select One</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="success">Successful</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
          </Select>
        </Grid2>
        <Grid2 xs={7.5} md={2}>
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
            variant="outlined"
            value={template}
            fullWidth
            placeholder="Search Template"
            onChange={(e) => setTemplate(e.target.value)}
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
