import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
} from "@mui/material";
import { toast } from "react-toastify";
import { CloseCircleOutlined } from "@ant-design/icons";

interface ImageUploadPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  onAccept?: (file: File, imageIndex: number) => void;
  handleDeviceUpload?: (file: File, device: string, langId: string) => void;
  imageFile?: File | null;
  minWidth?: number;
  minHeight?: number;
  allowedTypes?: string[];
  imageIndex?: number;
  device?: string;
  langId?: string;
}

const DEFAULT_ALLOWED_TYPES = ["svg", "avif", "png", "jpg"];

export default function ImageUploadPreviewDialog({
  open,
  onClose,
  onAccept,
  handleDeviceUpload,
  imageFile,
  minWidth = 800,
  minHeight = 600,
  allowedTypes = DEFAULT_ALLOWED_TYPES,
  imageIndex = 0,
  device,
  langId,
}: ImageUploadPreviewDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [fileSize, setFileSize] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean | null>(null);

  /*
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // File size
    const sizeKB = file.size / 1024;
    const sizeMB = sizeKB / 1024;
    setFileSize(
      sizeMB >= 1 ? `${sizeMB.toFixed(2)} MB` : `${sizeKB.toFixed(2)} KB`
    );

    // Get image dimensions
    const img = new Image();
    img.src = url;
    img.onload = () => {
      setDimensions({
        width: img.width,
        height: img.height,
      });
    };
  };
  */

  useEffect(() => {
    if (!imageFile) return;

    console.log("imageFile::::", imageFile);

    const fileExtension = imageFile.name.split(".").pop()?.toLowerCase() || "";
    const isValidType = allowedTypes.some(
      (type) =>
        type.toLowerCase() === fileExtension ||
        imageFile.type.includes(type.toLowerCase())
    );

    if (!isValidType) {
      toast.error(
        `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`
      );
      onClose();
      return;
    }

    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);

    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;

      setDimensions({ width: w, height: h });

      if (w >= minWidth && h >= minHeight) {
        setIsValid(true);
      } else {
        toast.error(
          `Image too small. Minimum size required: ${minWidth}x${minHeight}px`
        );
        onClose();
      }
    };

    // img.onerror = (e) => {
    //   toast.error("Failed to load image 2222");
    //   onClose();
    // };

    img.src = url;

    return () => URL.revokeObjectURL(url);
  }, [imageFile, minWidth, minHeight, onClose, allowedTypes]);

  const handleAccept = () => {
    if (!imageFile) return;
    if (isValid) {
      if (device && langId) {
        handleDeviceUpload?.(imageFile, device, langId);
      } else {
        onAccept?.(imageFile, imageIndex);
      }
    }
  };

  const getCropOffset = (targetRatio: number) => {
    if (!dimensions) return "center";

    const { width, height } = dimensions;
    const imgRatio = width / height;

    if (imgRatio > targetRatio) {
      const cropPercent = ((width - height * targetRatio) / 2 / width) * 100;
      return `${50 - cropPercent}% 50%`;
    }

    const cropPercent = ((height - width / targetRatio) / 2 / height) * 100;
    return `50% ${50 - cropPercent}%`;
  };

  if (isValid !== true) {
    return null;
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            overflow: "hidden",
          },
        }}
      >
        {/* HEADER SECTION */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 3,
            py: 2,
            bgcolor: "#f5f7fa",
            borderBottom: "1px solid #e2e2e2",
          }}
        >
          <Typography sx={{ fontSize: 14 }}>
            Required minimum:{" "}
            <Box component="span" sx={{ color: "error.main", fontWeight: 600 }}>
              {minWidth}×{minHeight}px
            </Box>
          </Typography>

          <Typography sx={{ fontSize: 14 }}>
            Your image:{" "}
            <Box component="span" sx={{ color: "#5A2CA0", fontWeight: 600 }}>
              {dimensions.width}×{dimensions.height}px
            </Box>
          </Typography>

          <IconButton onClick={onClose}>
            <CloseCircleOutlined />
          </IconButton>
        </Box>

        {/* BODY CONTENT */}
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={4} justifyContent="center">
            {/* 4:3 PREVIEW */}
            <Grid item xs={12} sm={6}>
              <Typography
                sx={{
                  textAlign: "center",
                  fontSize: 18,
                  fontWeight: 600,
                  mb: 1,
                }}
              >
                4:3 Preview
              </Typography>

              <Box
                sx={{
                  overflow: "hidden",
                  borderRadius: 3,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                  bgcolor: "#f0f0f0",
                }}
                style={{
                  aspectRatio: "4 / 3",
                  width: "100%",
                }}
              >
                <img
                  src={previewUrl || ""}
                  alt="preview"
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: getCropOffset(4 / 3),
                  }}
                />
              </Box>
            </Grid>

            {/* 1:1 PREVIEW */}
            <Grid item xs={12} sm={6}>
              <Typography
                sx={{
                  textAlign: "center",
                  fontSize: 18,
                  fontWeight: 600,
                  mb: 1,
                }}
              >
                1:1 Preview
              </Typography>

              <Box
                sx={{
                  overflow: "hidden",
                  borderRadius: 3,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                  bgcolor: "#f0f0f0",
                }}
                style={{
                  aspectRatio: "1 / 1",
                  width: "100%",
                }}
              >
                <img
                  src={previewUrl || ""}
                  alt="preview 1:1"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    position: "relative",
                    objectPosition: getCropOffset(1 / 1),
                  }}
                />
              </Box>
            </Grid>
          </Grid>

          {/* DESCRIPTION TEXT */}
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Typography sx={{ color: "#7b4abf", fontWeight: 600 }}>
              These previews show how your image will appear visually.
            </Typography>
            <Typography sx={{ fontSize: 13, color: "gray" }}>
              The original image will be uploaded without any modification.
            </Typography>
          </Box>
        </DialogContent>

        {/* ACTIONS */}
        <DialogActions
          sx={{
            justifyContent: "flex-end",
            px: 3,
            py: 2,
            bgcolor: "#f5f7fa",
            borderTop: "1px solid #e2e2e2",
          }}
        >
          <Button onClick={onClose} sx={{ mr: 1 }}>
            Cancel
          </Button>

          <Button variant="contained" onClick={handleAccept}>
            Accept & Upload
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
