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
import { DetailsModal } from "./DetailsModal";

export const DashboardTableData = ({
  response,
  apiState
}: any) => {
  const data = response;

  // const [debouncedTemplate] = useDebounce(template, 300);
  // useEffect(() => {
  //   reFetch();
  // }, [debouncedTemplate]);

  const columns = [
    // {
    //   accessorKey: "index",
    //   header: "Seq",
    //   cell: ({ row }: any) => <>{row.index + 1}</>,
    // },
    // {
    //   accessorKey: "isSend",
    //   header: "State",
    //   cell: ({ row }: any) => (
    //     <>{row.original.isSend === true ? "Processed" : "Processing"}</>
    //   ),
    // },
    // {
    //   accessorKey: 'gaid',
    //   header: 'User',
    //   cell: ({ row }: any) => {
    //     const customerNum: string = row.original.gaid;
    //     const isTruncated = customerNum?.length > 20;
    //     const displayValue = isTruncated
    //       ? customerNum?.slice(0, 20) + '...'
    //       : customerNum;
        
        
    //     return (
    //       <Tooltip title={isTruncated ? customerNum : ''} arrow>
    //         <span>{displayValue}</span>
    //       </Tooltip>
    //     );
    //   },
    // },
    // {
    //   accessorKey: "status",
    //   header: "Status",
    //   cell: ({ row }: any) => {
    //     let statusToShow = "Pending";
    //     // const phoneRegex = /((\+9665\d{8})|(05\d{8})|(\+91[789]\d{9})|(0[789]\d{9})|([789]\d{9})|(\+923\d{9})|(03\d{9}))\b/;
    //     // // need to check either sms delivered from infinito or unifonic
    //     // const smsSentViaUnifonic = phoneRegex.test(row.original.gaid);
    //     if (apiState === '1') {
    //       // status logic for email
    //       if (row.original.status === "Pending" && row.original.retry_limit >= 5) {
    //         statusToShow = "Failed";
    //       } else {
    //         statusToShow = row.original.status;
    //       }
    //     } else if (apiState === '2') {
    //       // status logic for sms
    //       if (row.original.isSend === true && row.original.response_code === null) {
    //         statusToShow = "N/A"; // for unifonic or infinito call still not executed.
    //       } else if (row.original.isSend === true && row.original.response_code === "000") {
    //         statusToShow = "Successful";
    //       } else if (row.original.response_code !== "000") {
    //         statusToShow = "Failed";
    //       }

    //     } else if (apiState === '3') {
    //       if (row.original.response_code === null) {
    //         statusToShow = "N/A"; // for unifonic or infinito call still not executed.
    //       } else if (row.original.response_code === "200" && row.original.status === 'success') {
    //         statusToShow = "Successful";
    //       } else if ((row.original.response_code === "200" && row.original.response_code === 'failed' && row.original.response_code === 'pending') || row.original.status !== '200') {
    //         statusToShow = "Failed";
    //       }
    //     }

    //     // TODO: once, we get the unifonic status , we need to update the status here
    //     // if (smsSentViaUnifonic) {
    //     //   statusToShow = 'N/A';
    //     // }

    //     return <>{statusToShow}</>;
    //   },
    // },
    // {
    //   accessorKey: "id",
    //   header: "Campaign ID",
    //   cell: ({ row }: any) => {
    //     const customerNum: string = row.original.id;
    //     const isTruncated = customerNum?.length > 20;
    //     const displayValue = isTruncated
    //       ? customerNum?.slice(0, 20) + '...'
    //       : customerNum;
        
        
    //     return (
    //       <Tooltip title={isTruncated ? customerNum : ''} arrow>
    //         <span>{displayValue}</span>
    //       </Tooltip>
    //     );
    //   },
    // },
    {
      accessorKey: "campaign_name",
      header: "Campaign Name",
      cell: ({ row }: any) => (
        <>{row.original.name ?? "N/A"}</>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }: any) => <>{row.original.type ?? "N/A"}</>,
    },
    {
      accessorKey: "isActive",
      header: "Active",
      cell: ({ row }: any) => (
        <>{row.original.isActive ? 'Yes' : 'No'}</>
      ),
    },
    {
      accessorKey: "scheduledAt",
      header: "Scheduled At",
      cell: ({ row }: any) => (
        <>{new Date(row.original.createdAt).toLocaleString()}</>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }: any) => (
        <>{new Date(row.original.createdAt).toLocaleString()}</>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "Actions",
      cell: ({ row }: any) => (
        <Actions row={row} apiState={apiState} />
      ),
    }
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
        {/* <Grid2 xs={7.5} md={2}>
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


const Actions = ({ row, apiState }: any) => {
  const [openModal, setOpenModal] = React.useState(false);
  return (
    <>
     <Button
        variant="contained"
        size="small"
        color="primary"
        onClick={() => {
          setOpenModal(true);
        }}
      >
        Show Details
    </Button>
    <DetailsModal
      openModal={openModal}
      setOpenModal={setOpenModal}
      data={apiState === '1' ? row.original.mailHistories : apiState === '2' ? row.original.smsHistories : row.original.whatsappHistories}
      apiState={apiState}
      campaignName={row.original.name}
    />
    </>
  )
}