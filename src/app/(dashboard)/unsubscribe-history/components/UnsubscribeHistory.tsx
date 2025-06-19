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
import { InputLabel, MenuItem, Select, TextField, Button, Tooltip, Typography } from "@mui/material";
import { useDebounce } from "use-debounce";
import { PUT } from "@/utils/AxiosUtility";
import { toast } from "react-toastify";

export const UnsubscribeHistoryData = ({
  response,
  reFetch,
  email,
  setEmail,
  number,
  setNumber,
  type,
  setType,
}: any) => {
  console.log("response", response);
  
  const { data } = response;

  const [debouncedEmail] = useDebounce(email, 300);
  useEffect(() => {
    reFetch();
  }, [debouncedEmail]);

  const [debouncedNumber] = useDebounce(number, 300);
  useEffect(() => {
    reFetch();
  }, [debouncedNumber]);

  const [debouncedType] = useDebounce(type, 300);
  useEffect(() => {
    reFetch();
  }, [debouncedType]);

  const columns = [
    // {
    //   accessorKey: "index",
    //   header: "Seq",
    //   cell: ({ row }: any) => <>{row.index + 1}</>,
    // },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }: any) => {
        const customerNum: string = row.original.externalUser.email;
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
      accessorKey: "number",
      header: "Number",
      cell: ({ row }: any) => {
        const customerNum: string = row.original.externalUser.number;
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
      accessorKey: "category.name",
      header: "Category",
      cell: ({ row }: any) => (
        <>{row.original.category.name}</>
      ),
    },
    {
      accessorKey: "type",
      header: "type",
      cell: ({ row }: any) => (
        <>{row.original.type}</>
      ),
    },
    {
      accessorKey: "is_unsubscribed",
      header: "Unsubscribed",
      cell: ({ row }: any) => (
        <>{row.original.is_unsubscribed ? "Yes" : "No"}</>
      ),
    },
    {
      accessorKey: "unsubscribedAt",
      header: "Unsubscribed At",
      cell: ({ row }: any) => (
        <>{new Date(row.original.unsubscribedAt).toLocaleString()}</>
      ),
    },
    {
      accessorKey: "id",
      header: "Subscribe Again",
      cell: ({ row }: any) => (
        <Button variant="contained" onClick={async () => {
          const resp = await PUT(`/unsubscribe/${row.original.id}`, {
            is_unsubscribed: false
          });

          if (resp?.status === 200) {
           toast.success(`User has been subscribed to this email again`)  
          }

          reFetch();
        }}>
          Subscribe Again
        </Button>
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
      <Grid2 container spacing={1} columns={15} justifyContent="space-between">
        <Grid2 xs={7.5} md={3}>
          <Typography
            sx={{
              fontWeight: 600,
              margin: "10px 0px",
            }}
            variant="h4"
          >
            Unsubscribe List
          </Typography>
        </Grid2>
        <Grid2 xs={3} md={3}>
          <Button variant="contained" fullWidth onClick={() => window.location.pathname = '/unsubscribe'}>Unsubscribe User</Button>
        </Grid2>
      </Grid2>
      <br />
      <Grid2 container spacing={1} columns={15}>
        <Grid2 xs={7.5} md={3}>
          <InputLabel
            sx={{
              fontSize: "14px",
              fontWeight: 600,
              margin: "10px 0px",
            }}
          >
            Email
          </InputLabel>
          <TextField
            variant="outlined"
            value={email}
            fullWidth
            placeholder="Search Email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </Grid2>
        <Grid2 xs={7.5} md={3}>
          <InputLabel
            sx={{
              fontSize: "14px",
              fontWeight: 600,
              margin: "10px 0px",
            }}
          >
            Number
          </InputLabel>
          <TextField
            variant="outlined"
            value={number}
            fullWidth
            placeholder="Search Number"
            onChange={(e) => setNumber(e.target.value)}
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
            Type
          </InputLabel>
          <Select
            defaultValue={"3"}
            value={type}
            fullWidth
            onChange={(e) => setType(e.target.value)}
          >
            <MenuItem value="3">Select One</MenuItem>
            <MenuItem value="email">Email</MenuItem>
            <MenuItem value="sms">SMS</MenuItem>
            <MenuItem value="whatsapp">Whatsapp</MenuItem>
          </Select>
        </Grid2>
        {/* <Grid2 xs={7.5} md={2}>
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
        </Grid2> */}
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
