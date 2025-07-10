'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogActions,
  InputAdornment,
  Button,
  TablePagination,
  TextField,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import { useRouter,useSearchParams } from 'next/navigation';
import { DELETE, GET } from '@/utils/AxiosUtility';
import BaseDrawer from '@/components/drawer/basedrawer';
import BusinessUnitEditForm from '../edit/page';
import BusinessUnitCreateForm from '../create/page';
import Pagination from '@mui/material/Pagination';

type BusinessUnit = {
  id: number;
  name: string;
  description?: string;
  location?: string;
};

const fetchBusinessUnits = async (name: string = ''): Promise<BusinessUnit[]> => {
  const clientInfo = JSON.parse(localStorage.getItem('client-info')!);
  const response = await GET(`/business-units/${clientInfo.id}?name=${encodeURIComponent(name)}`);
  if (response?.status !== 200) {
    throw new Error('Failed to fetch business units');
  }
  return response.data;
};

const deleteBusinessUnit = async (id: number): Promise<void> => {
  const response = await DELETE(`/business-units/${id}`);
  if (response?.status !== 200) {
    throw new Error('Failed to delete business unit');
  }
};

const BusinessUnitList = () => {
  const [units, setUnits] = useState<BusinessUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [searchName, setSearchName] = useState('');
   const searchParams = useSearchParams();
  const drawerOpen = searchParams.get('drawer');
   const drawerId = searchParams.get('id');
 const count = units.length; // your total data count
  const router = useRouter();
  
   const handleCloseDrawer = () => {
    const currentUrl = window.location.pathname;
    router.push(currentUrl);
  };

  const loadData = async (name = '') => {
    setLoading(true);
    try {
      const data = await fetchBusinessUnits(name);
      setUnits(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      loadData(searchName.trim());
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchName]);

  const handleDelete = async () => {
    if (confirmDeleteId !== null) {
      await deleteBusinessUnit(confirmDeleteId);
      setConfirmDeleteId(null);
      await loadData(searchName.trim());
    }
  };

  const handleChangePage = (_: unknown, newPage: number) =>{setPage(newPage-1);
  };
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedUnits = units.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ backgroundColor: '#F9FAFB',mt:"-25px" }}>
         <Box sx={{ display: 'flex', justifyContent: 'space-between' , alignItems: 'center', mb: 1 }}>
       <Typography
            sx={{
              color: 'rgba(0, 0, 0, 0.87)',
              fontFamily: 'Outfit',
              fontSize: '32px',
              fontWeight:600 ,
               
               
            }}
          >
            Business Units
          </Typography>
        <Button variant="outlined" onClick={() => router.push('/business-units/view?drawer=create')}
           sx={{
    backgroundColor: '#fff',
       fontFamily:'Outfit',
      fontWeight: 600,
  
   
  }}>
          Create
        </Button>
      </Box>
  <Box mb={2}>
  <TextField
   size="small"
    placeholder="Search by name"
    value={searchName}
    onChange={(e) => setSearchName(e.target.value)}
    sx={{
      backgroundColor: '#fff',
      fontFamily: 'Outfit',
      fontWeight: 400,
      fontStyle: 'normal',
      fontSize: '15px',
      lineHeight: '22px',
       borderBottom: '1px solid #e0e0e0',
      borderRadius: 2,
      '& .MuiInputBase-input': {
        fontFamily: 'Outfit',
        fontWeight: 400,
        fontSize: '15px',
        lineHeight: '22px',
      },
    }}
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          <SearchIcon sx={{ color: '#9e9e9e' }} />
        </InputAdornment>
      ),
      sx: {
        borderRadius: 2,
        fontFamily: 'Outfit',
        fontWeight: 400,
      },
    }}
  />
</Box>

     <Paper elevation={3} sx={{  borderRadius: 3, maxWidth: '100%', overflow: 'auto' }}>
     
      {loading ? (
        <Box mt={4} textAlign="center">
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer>
            <Table size="small">
              <TableHead >
                <TableRow>
                  <TableCell >
                    <BusinessIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Name
                  </TableCell>
                  <TableCell >
                    <DescriptionIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Description
                  </TableCell>
                  <TableCell >
                    <LocationOnIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Location
                  </TableCell>
                  <TableCell  align='right'>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUnits.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell >{unit.name}</TableCell>
                    <TableCell >{unit.description || '—'}</TableCell>
                    <TableCell  >{unit.location || '—'}</TableCell>
                    <TableCell align="right" >
                      <Tooltip title="Edit" >
                        <IconButton
                          color="primary"
                          onClick={() => router.push(`/business-units/view?drawer=edit&id=${unit.id}`)
                        }
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          color="error"
                          onClick={() => setConfirmDeleteId(unit.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {units.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No business units found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>



<Box
  sx={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #E0E0E0', // top border line
    paddingY: 2,
    paddingX: 2,
  }}
>
  {/* Previous Button */}
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

  {/* Pagination */}
  <Pagination
    count={count}
    page={page+1}
    onChange={handleChangePage}
    shape="rounded"
    siblingCount={1}
    boundaryCount={1}
    hidePrevButton
    hideNextButton
    sx={{
      '& .MuiPaginationItem-root': {
        borderRadius: '8px',
        fontWeight: 500,
        minWidth: '36px',
        height: '36px'
      }
    }}
  />

  {/* Next Button */}
  <Button
    variant="outlined"
   onClick={() => setPage(prev => prev + 1)}
  disabled={page === count - 1}
 sx={{
      textTransform: 'none',
      borderRadius: 2,
      px: 3,
      minWidth: 100
    }}
  >
    Next →
  </Button>
</Box>
 </>
)}
    

      <Dialog
        open={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
      >
        <DialogTitle>Are you sure you want to delete this business unit?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteId(null)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
     
        <BaseDrawer
        open={drawerOpen === 'create'}
        onClose={handleCloseDrawer}
        title="Create Business"
      >
         <BusinessUnitCreateForm onSuccess={() => {
          loadData();           
          handleCloseDrawer(); 
    }} />
      </BaseDrawer>

      {/* Drawer for Edit */}
      {drawerOpen === 'edit' && drawerId && (
        <BaseDrawer
          open={true}
          onClose={handleCloseDrawer}
          title="Edit Business"
        >
          <BusinessUnitEditForm onSuccess={() => {
          handleCloseDrawer(); 
          loadData(); 
    }} />
        </BaseDrawer>
    
  )}
  </Paper>    
    </Box>
    
    
     
  );
};

export default BusinessUnitList;
