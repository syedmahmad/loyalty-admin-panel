'use client';

import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  IconButton,
  CircularProgress,
  Tooltip,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Pagination,
  Menu,
  Dialog,
  DialogTitle,
  DialogActions,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { DELETE, GET } from '@/utils/AxiosUtility';
import { useRouter, useSearchParams } from 'next/navigation';
import BaseDrawer from '@/components/drawer/basedrawer';
import CreateCustomerSegment from '../create/page';
import CustomerSegmentEditPage from './components/Edit';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from "@mui/icons-material/MoreVert";

type CustomerSegment = {
  id: number;
  name: string;
  description: string;
  status: number;
};

const CustomerSegmentList = () => {
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [selectedSegmentId, setSelectedSegmentId] = useState<number | null>(null);
  const [selectedSegmentIdForDelete, setSelectedSegmentIdForDelete] = useState<number | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClose = () => {
    setAnchorEl(null);
  }
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [searchName, setSearchName] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const drawerOpen = searchParams.get('drawer');
  const drawerId = searchParams.get('id');

  const handleCloseDrawer = () => {
    router.push('/customer-segment/view');
  };

 const loadSegments = async (name = '') => {
  setLoading(true);
  try {
      const clientInfo = JSON.parse(localStorage.getItem('client-info')!);
    const res = await GET(`/customer-segments/${clientInfo.id}?name=${encodeURIComponent(name)}`);
    if (res?.status === 200) {
      setSegments(res.data);
    }
  } finally {
    setLoading(false);
  }
};

 useEffect(() => {
  const debounce = setTimeout(() => {
    loadSegments(searchName.trim());
  }, 300);
  return () => clearTimeout(debounce);
}, [searchName]);

  const paginatedSegments = viewMode === 'card' ? segments: segments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const totalPages = Math.ceil(segments.length / rowsPerPage);

  return (
    <Box sx={{ mt: '-20px' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography sx={{ fontSize: '32px', fontWeight: 600, fontFamily: 'Outfit' }}>
          Customer Segments
        </Typography>

        <Box sx={{ gap: 1, display: 'flex' }}>
          <Select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as 'card' | 'table')}
            size="small"
            sx={{ backgroundColor: '#fff', fontFamily: 'Outfit', fontWeight: 600 }}
          >
            <MenuItem value="card">Card View</MenuItem>
            <MenuItem value="table">Table View</MenuItem>
          </Select>

          <Button
            variant="outlined"
            onClick={() => router.push('/customer-segment/view?drawer=create')}
            sx={{ backgroundColor: '#fff', fontFamily: 'Outfit', fontWeight: 600 }}
          >
            Create
          </Button>
        </Box>
      </Box>

      <Box mb={2}>
        <TextField
          size="small"
          placeholder="Search by name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          sx={{ backgroundColor: '#fff', borderRadius: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#9e9e9e' }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

 <Paper
  elevation={3}
  sx={{
    borderRadius: 3,
    maxWidth: '100%',
    overflow: 'auto',
    border: 'none',
    transition: 'none',
    bgcolor: '#fafafb',
    boxShadow: viewMode === 'card' ? 'none' : undefined,}}
 >

        {loading ? (
          <Box mt={6} textAlign="center">
            <CircularProgress />
          </Box>
        ) : viewMode === 'card' ? (
          <Grid container spacing={3} sx={{boxShadow:'none'}}>
            {paginatedSegments.map((segment) => (
              <Grid item xs={12} sm={6} md={4} key={segment.id}>
                <Card  sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: 'none',border : 'none',transition : 'none' }}>
                  <CardContent sx={{boxShadow:"none"}}>
                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' , boxShadow: 'none',transition : 'none'}}>
                      <Typography variant="h6" fontWeight={600}>
                        {segment.name}
                      </Typography>
                        <IconButton
                          onClick={(event: any) =>
                             setAnchorEl(event.currentTarget)
                          }
                        >
                           <MoreVertIcon />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={open}
                          onClose={handleClose}
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                          slotProps={{
                          paper: {
                            sx: {
                              boxShadow: 'none',               
                              border: '1px solid #e0e0e0',     
                              mt: 1,                           
                            },
                          },
                          }}
                        >
                          <MenuItem onClick={() =>{ handleClose(); 
                            setSelectedSegmentId(segment.id);
                            }}>
                            <EditIcon fontSize="small" style={{ marginRight: 8 }} /> Edit
                          </MenuItem>
                          <MenuItem onClick={() => { 
                              handleClose();
                              setSelectedSegmentIdForDelete(segment.id);
                          }}>
                            <DeleteIcon fontSize="small" style={{ marginRight: 8 }} />
                              Delete
                          </MenuItem>
                        </Menu>
                    </Box>
                    <Typography variant="body2" mt={1}>
                      {segment.description || 'No Description'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      Status: {segment.status === 1 ? 'Active' : 'Inactive'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {paginatedSegments.length === 0 && (
              <Grid item xs={12}>
                <Typography align="center">No segments found.</Typography>
              </Grid>
            )}
          </Grid>
        ) : (
          <Box component={Paper}>
            <TableContainer>
              <Table size="small"  >
               <TableHead  >
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedSegments.map((segment) => (
                    <TableRow key={segment.id}>
                      <TableCell>{segment.name}</TableCell>
                      <TableCell>{segment.description}</TableCell>
                      <TableCell>{segment.status === 1 ? 'Active' : 'Inactive'}</TableCell>
                      <TableCell align="right">
                          <IconButton
                            onClick={(event: any) =>
                             setAnchorEl(event.currentTarget)
                            }
                          >
                            <MoreVertIcon />
                          </IconButton>
                          <Menu
                          anchorEl={anchorEl}
                          open={open}
                          onClose={handleClose}
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                          slotProps={{
                          paper: {
                            sx: {
                              boxShadow: 'none',               
                              border: '1px solid #e0e0e0',     
                              mt: 1,                           
                            },
                          },
                          }}
                        >
                          <MenuItem onClick={() =>{ handleClose(); 
                            setSelectedSegmentId(segment.id);
                            }}>
                            <EditIcon fontSize="small" style={{ marginRight: 8 }} /> Edit
                          </MenuItem>
                          <MenuItem onClick={() => { 
                              handleClose();
                              setSelectedSegmentIdForDelete(segment.id);
                          }}>
                            <DeleteIcon fontSize="small" style={{ marginRight: 8 }} />
                              Delete
                          </MenuItem>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {segments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No segments found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination Controls */}
            <Box component={Paper}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingY: 2,
                paddingX: 2,
                
              }}
            >
               <Button
                  variant="outlined"
                  onClick={() => setPage(prev => prev - 1)}
                disabled={page === 0} 
                sx={{
                    textTransform: 'none',
                    borderRadius: 2,
                    px: 3,
                    minWidth: 100
                  }}
                >
                  ← Previous
                </Button>

              <Pagination
                count={totalPages}
                page={page + 1}
                onChange={(_, newPage) => setPage(newPage - 1)}
                shape="rounded"
                 hidePrevButton
                   hideNextButton
              />

              <Button
                variant="outlined"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages - 1}
              >
                Next →
              </Button>
            </Box>
          </Box>
        )}

        {/* Drawers */}
        { <BaseDrawer
          open={drawerOpen === 'create'}
          onClose={handleCloseDrawer}
          title="Create Customer Segment"
        >
          <CreateCustomerSegment
            onSuccess={() => {
              loadSegments();
              handleCloseDrawer();
            }}
          />
        </BaseDrawer> }

        {/* {drawerOpen === 'edit' && drawerId && (
          <BaseDrawer
            open={true}
            onClose={handleCloseDrawer}
            title="Edit Customer Segment"
          >
            <CustomerSegmentEditPage
              onSuccess={() => {
                handleCloseDrawer();
                loadSegments();
              }}
            />
          </BaseDrawer>
        )} */}

        

      </Paper>

      {selectedSegmentIdForDelete ? (
        <DeleteSegment
          segmentId={selectedSegmentIdForDelete}
          setSelectedSegmentId={setSelectedSegmentIdForDelete} 
          onSuccess={() => {
            loadSegments();
            setSelectedSegmentIdForDelete(null);
          }}
      />) : null}
      {selectedSegmentId ?<CustomerSegmentEditPage
        segmentId={selectedSegmentId}
        setSelectedSegmentId={setSelectedSegmentId}
      /> : null}
    </Box>
  );
};

export default CustomerSegmentList;


const DeleteSegment = ({ segmentId, onSuccess, setSelectedSegmentId }: { segmentId: number; onSuccess: () => void, setSelectedSegmentId: Dispatch<SetStateAction<number | null>> }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await DELETE(`/customer-segments/${segmentId}/delete`);
      if (res?.status === 200) {
        onSuccess();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
        open={segmentId !== null}
        onClose={() => setSelectedSegmentId(null)}
      >
        <DialogTitle>Are you sure you want to delete this business unit?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setSelectedSegmentId(null)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
  );
}