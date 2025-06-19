import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
} from '@mui/material';
import { POST } from '@/utils/AxiosUtility';
import { toast } from 'react-toastify';

type VerifyOtpModalProps = {
  open: boolean;
  onClose: () => void;
  senderId: string;
  onVerified?: () => void;
};

const VerifyOtpModal: React.FC<VerifyOtpModalProps> = ({ open, onClose, senderId, onVerified }) => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // accept only last digit
    setOtp(newOtp);
    setError('');
  };

  const handleVerify = async () => {
    const enteredOtp = otp.join('');
    setLoading(true);
    try {
      const response = await POST('senders/verify-otp', { senderId, otp: enteredOtp });
      if (response?.status === 201) {
        toast.success('OTP verified successfully!');
        onVerified?.();
        setOtp(['', '', '', '']);
        onClose();
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Error verifying OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Verify OTP</DialogTitle>
      <DialogContent>
        <Typography mb={2}>Enter the 4-digit OTP sent to your email.</Typography>
        <Box display="flex" justifyContent="space-between">
          {otp.map((digit, index) => (
            <TextField
              key={index}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              inputProps={{
                maxLength: 1,
                inputMode: 'numeric',
                style: { textAlign: 'center' },
              }}
              sx={{ width: 50 }}
            />
          ))}
        </Box>
        {error && (
          <Typography color="error" mt={2}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleVerify}
          disabled={otp.some((d) => d === '') || loading}
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VerifyOtpModal;
