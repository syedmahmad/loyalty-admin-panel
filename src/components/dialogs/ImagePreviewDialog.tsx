import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
} from "@mui/material";

interface ImagePreviewDialogProps {
  open: boolean;
  onClose: () => void;
  url: string | null;
  width?: number;
  height?: number;
  size?: string;
  fileName?: string;
}

export default function ImagePreviewDialog({
  open,
  onClose,
  url,
  width,
  height,
  size,
  fileName,
}: ImagePreviewDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <strong>Image Preview</strong>
      </DialogTitle>

      <DialogContent>
        {url && (
          <Box>
            {/* Image Preview */}
            <Box
              component="img"
              src={url}
              alt="Preview"
              sx={{
                width: "100%",
                height: "auto",
                borderRadius: 2,
                border: "1px solid #ccc",
                mb: 2,
              }}
            />

            {/* Details */}
            <Box>
              {width && height && (
                <Typography>
                  📏 <strong>Dimensions:</strong> {width} × {height}px
                </Typography>
              )}

              {size && (
                <Typography>
                  💾 <strong>Size:</strong> {size}
                </Typography>
              )}

              {fileName && (
                <Typography>
                  📝 <strong>Name:</strong> {fileName}
                </Typography>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
