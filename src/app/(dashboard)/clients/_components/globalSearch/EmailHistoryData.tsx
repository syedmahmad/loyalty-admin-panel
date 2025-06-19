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
import { InputLabel, TextField, Tooltip } from "@mui/material";
import { useDebounce } from "use-debounce";

export const EmailHistoryData = ({ response, gaid, setGaid, reFetch, template, setTemplate }: any) => {
  const { data } = response;

  const [debouncedGaid] = useDebounce(gaid, 300);
  useEffect(() => {
    reFetch();
  }, [debouncedGaid]);

  const [debouncedTemplate] = useDebounce(template, 300);
    useEffect(() => {
      reFetch();
    }, [debouncedTemplate]);

  const columns = [
    // {
    //   accessorKey: "index",
    //   header: "Seq",
    //   cell: ({ row }: any) => <>{row.index + 1}</>,
    // },
    {
      accessorKey: "clientName",
      header: "Client Name",
      cell: ({ row }: any) => <>{row.original.clientName}</>,
      minSize: 150,
    },
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
        const customerNum: string = row.original.gaid;
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
      cell: ({ row }: any) => <>{row.original.status}</>,
    },
    {
      accessorKey: "unsend_reason",
      header: "Reason",
      cell: ({ row }: any) => (
        <>
          {row.original.unsend_reason === null
            ? "N/A"
            : row.original.unsend_reason}
        </>
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
        <Grid2 xs={7.5} md={3}>
          <InputLabel
            sx={{
              fontSize: "14px",
              fontWeight: 600,
              margin: "10px 0px",
            }}
          >
            By Email
          </InputLabel>
          <TextField
            variant="outlined"
            value={gaid}
            fullWidth
            placeholder="Enter Email or Gaid"
            onChange={(e) => setGaid(e.target.value)}
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
            Template Name
          </InputLabel>
          <TextField
            variant="outlined"
            value={template}
            fullWidth
            placeholder="Enter Template Name"
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
                  <TableCell
                    key={header.id}
                    sx={{
                      fontWeight: "bold",
                      minWidth: header.column.columnDef.minSize || 100,
                    }}
                  >
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
