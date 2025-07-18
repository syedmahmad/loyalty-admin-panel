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
} from '@mui/material';
import { useEffect, useState } from 'react';
import { GET } from '@/utils/AxiosUtility';
import { useRouter,useSearchParams } from 'next/navigation';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BaseDrawer from '@/components/drawer/basedrawer';
import CustomerSegmentEditPage from '../edit/[id]/page';


type CustomerSegment = {
  id: number;
  name: string;
  description: string;
  status: number;
};


const CustomerSegmentList = () => {
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
    const drawerOpen = searchParams.get('drawer');
     const drawerId = searchParams.get('id');
     

 const handleCloseDrawer = () => {
    const currentUrl = window.location.pathname;
    router.push(currentUrl);
  };

  const loadSegments = async () => {
    setLoading(true);
    const res = await GET(`/customer-segments/${1}`); // Replace `1` with actual tenant_id
    if (res?.status === 200) {
      setSegments(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSegments();
  }, []);

  return (
    <Box sx={{ mt: '-20px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" fontWeight={600}>
          Customer Segments
        </Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => router.push('/customer-segment/create')}
        >
          Create Segment
        </Button>
      </Box>

      <Paper elevation={3} sx={{ borderRadius: 3 }}>
        {loading ? (
          <Box mt={4} textAlign="center">
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {segments.map((segment) => (
                  <TableRow key={segment.id}>
                    <TableCell>{segment.name}</TableCell>
                    <TableCell>{segment.description}</TableCell>
                    <TableCell>{segment.status === 1 ? 'Active' : 'Inactive'}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Manage Customers">
                        <IconButton
                          onClick={() => router.push(`/customer-segment/view?drawer=edit&id=${segment.id}`)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
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
        )}


           { drawerOpen === 'edit' && drawerId && (
        <BaseDrawer
          open={true}
          onClose={handleCloseDrawer}
          title="Edit Business"
        >
          <CustomerSegmentEditPage  onSuccess={() => {
          handleCloseDrawer(); 
          loadSegments(); 
    }} />
        </BaseDrawer>
           
        )}
      </Paper>
    </Box>
  );
};

export default CustomerSegmentList;
