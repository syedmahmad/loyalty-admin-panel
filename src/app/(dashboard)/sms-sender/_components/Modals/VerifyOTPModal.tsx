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

type OtpModalProps = {
  open: boolean;
  onClose: () => void;
  setOpenCreateSender: any;
  senderId: any;
  reFetch: any
};

const OtpModal: React.FC<OtpModalProps> = ({ open, onClose, senderId, setOpenCreateSender, reFetch }) => {
  const [step, setStep] = useState<'send' | 'enter'>('enter');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = () => {
          setStep('enter');
  };

  const handleChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // only last digit
    setOtp(newOtp);
    setError('');
  };

  const handleVerify = async () => {
    const enteredOtp = otp.join('');
    try {
      const response = await POST("senders/verify-otp", { senderId, otp: enteredOtp });

      if (response?.status === 201) {
        toast.success('OTP verified successfully!');
        reFetch();
        setStep('send');
        setOtp(['', '', '', '']);
        onClose();
        setOpenCreateSender(false);
      } else {
        toast.error('Invalid OTP. Please try again.');
        setError('Invalid OTP. Please try again.');
        reFetch();
      }
    } catch (error) {
      toast.error('An error occurred while verifying the OTP. Please try again.');
      console.error('Error verifying OTP:', error);
      reFetch();
      setError('An error occurred while verifying the OTP. Please try again.');
    }
    
  };

  return (
    <Dialog open={open} onClose={() => {onClose(), setOpenCreateSender(false)}} fullWidth maxWidth="xs">
      <DialogTitle>{step === 'send' ? 'OTP Sent' : 'Enter OTP'}</DialogTitle>
      <DialogContent>
        {step === 'send' ? (
          <Typography>Click the button below to verify an OTP that is sent to selected sender email.</Typography>
        ) : (
          <>
            <Typography>Enter the 4-digit OTP sent to your selected sender email.</Typography>
            <Box display="flex" justifyContent="space-between" mt={2}>
              {otp.map((digit, i) => (
                <TextField
                  key={i}
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, i)}
                  inputProps={{ maxLength: 1, inputMode: 'numeric', style: { textAlign: 'center' } }}
                  sx={{ width: 50 }}
                />
              ))}
            </Box>
            {error && <Typography color="error" mt={2}>{error}</Typography>}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => {onClose(), setOpenCreateSender(false)}}>Cancel</Button>
        {step === 'send' ? (
          <Button onClick={handleSendOtp} disabled={loading}>
            {loading ? 'Sending...' : 'Enter OTP'}
          </Button>
        ) : (
          <Button onClick={handleVerify} disabled={otp.some(d => d === '')}>
            Verify OTP
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default OtpModal;
