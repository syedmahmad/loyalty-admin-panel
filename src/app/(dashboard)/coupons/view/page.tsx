'use client';

import {
  Box,
  Card,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  TablePagination,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { DELETE, GET } from '@/utils/AxiosUtility';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

type Coupon = {
  id: number;
  code: string;
  discount_percentage: string;
  discount_price: number;
  business_unit?: { name: string };
  usage_limit:number;
  number_of_times_used:number;
  benefits?: string;
};

const htmlToPlainText = (htmlString: string): string => {
  if (!htmlString) return '';
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlString;
  return tempDiv.textContent || tempDiv.innerText || '';
};

const CouponList = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const router = useRouter();

  const fetchCoupons = async () => {
    setLoading(true);
    const res = await GET('/coupons');
    setCoupons(res?.data.coupons || []);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const res = await DELETE(`/coupons/${deleteId}`);
    if (res?.status === 200) {
      toast.success('Coupon deleted!');
      fetchCoupons();
    } else {
      toast.error('Failed to delete coupon');
    }

    setDeleteId(null);
  };

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  if (loading) {
    return (
      <Box textAlign="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  console.log("")

  return (
    <Card sx={{ minWidth: 900, mx: 'auto', mt: 4, p: 2, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: "center"}}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          🎗️ Coupon List
        </Typography>
        <Button sx={{ mb: 2 }} variant='contained' onClick={() => router.push('create')}>
          Create Coupon
        </Button>
      </Box>

      {coupons.length === 0 ? (
        <Typography mt={4} textAlign="center">
          No coupons found.
        </Typography>
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Discount (%)</TableCell>
                  <TableCell>Discount Price</TableCell>
                  <TableCell>Business Unit</TableCell>
                  <TableCell>Usage Limit</TableCell>
                  <TableCell>Number of times used</TableCell>
                  <TableCell>Benefits</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {coupons
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell
                        sx={{
                          maxWidth: 200,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        <Tooltip title={coupon.code}>
                          <span>{coupon.code}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{coupon.discount_percentage}</TableCell>
                      <TableCell>{coupon.discount_price}</TableCell>
                      <TableCell sx={{
                          maxWidth: 200,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          <Tooltip title={coupon.business_unit?.name || '-'}>
                          <span>{coupon.business_unit?.name || '-'}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{coupon.usage_limit}</TableCell>
                      <TableCell>{coupon.number_of_times_used}</TableCell>
                      <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <Tooltip
                        placement="top-start"
                        title={
                          <span
                            dangerouslySetInnerHTML={{
                              __html: DOMPurify.sanitize(marked.parse(coupon.benefits || '-') as string),
                            }}
                          />
                        }
                      >
                         <span>{htmlToPlainText(coupon.benefits || '-')}</span>
                      </Tooltip>
                    </TableCell>
                      <TableCell align="right" sx={{ display: 'flex' }}>
                        <Tooltip title="Edit">
                          <IconButton onClick={() => router.push(`/coupons/edit?id=${coupon.id}`)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete">
                          <IconButton onClick={() => setDeleteId(coupon.id)}>
                            <DeleteIcon fontSize="small" color="error" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={coupons.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </>
      )}

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Are you sure you want to delete this coupon?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default CouponList;
