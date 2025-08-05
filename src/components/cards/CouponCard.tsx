import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import DeleteIcon from "@mui/icons-material/Delete";
import ClearIcon from "@mui/icons-material/Clear";
import {
  Box,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { htmlToPlainText } from "@/utils/Index";
import moment from "moment";
import { useEffect, useState } from "react";
import { COUPON_TYPE_ARRAY } from "@/constants/constants";

const CouponCard = ({
  couponData,
  setSelectedCoupons,
  selectedCoupons,
}: any) => {
  const [couponTypes, setCouponTypes] = useState<string[]>([]);

  useEffect(() => {
    //If its simple Coupon Not complex one
    if (couponData?.coupon_type_id) {
      const selectedCouponType = COUPON_TYPE_ARRAY.find(
        (item) => item.id === couponData.coupon_type_id
      );
      if (selectedCouponType) {
        setCouponTypes([selectedCouponType.type]);
      }
    }

    //If its complex coupon
    if (couponData?.complex_coupon) {
      const complexCouponTypes = couponData?.complex_coupon.map(
        (singleComplex: { selectedCouponType: string }) => {
          return singleComplex?.selectedCouponType;
        }
      );
      if (complexCouponTypes) {
        setCouponTypes(complexCouponTypes);
      }
    }
  }, [couponData]);

  const handleRemoveSelectedCoupon = (couponId: number) => {
    const updatedCouponData = selectedCoupons.filter(
      (item: { id: number }) => item.id !== couponId
    );
    setSelectedCoupons(updatedCouponData);
  };

  return (
    <Box
      sx={{
        border: "2px dashed #ccc",
        padding: 1,
        width: "100%",
        maxWidth: 300,
        position: "relative",
      }}
    >
      {/* Delete Icon */}
      <IconButton
        size="small"
        sx={{
          position: "absolute",
          top: -7,
          right: -7,
        }}
        onClick={() => handleRemoveSelectedCoupon(couponData.id)}
      >
        <ClearIcon fontSize="small" />
      </IconButton>

      {/* Top Section */}
      <Box
        display={"flex"}
        justifyContent="space-between"
        alignItems="center"
        width="100%"
        gap={1}
      >
        <Box display="flex" alignItems="center">
          <ConfirmationNumberIcon fontSize="small" color="disabled" />
          <Typography
            fontSize={12}
            color="text.secondary"
            whiteSpace="nowrap"
            paddingLeft={1}
          >
            {couponData?.code}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center">
          <AccessTimeIcon fontSize="small" color="disabled" />
          <Typography
            fontSize={12}
            color="text.secondary"
            whiteSpace="nowrap"
            paddingLeft={1}
          >
            {moment(couponData?.date_to).format("MMMM D, YYYY")}
          </Typography>
        </Box>
      </Box>

      {/* Bottom Section */}
      <Box mt={1}>
        <Typography variant="h6" color="primary" fontWeight={600}>
          {couponData?.coupon_title}
        </Typography>
        <Tooltip title={htmlToPlainText(couponData?.benefits || "-")}>
          <Typography fontSize={13} color="text.secondary">
            {htmlToPlainText(couponData?.benefits || "-")}
          </Typography>
        </Tooltip>
      </Box>
      <Box mt={1} display="flex" justifyContent="flex-end">
        <Box
          display="flex"
          flexWrap="wrap"
          gap={1}
          justifyContent="flex-end"
          maxWidth="100%"
        >
          {couponTypes?.map((singleCouponType, index) => (
            <Chip
              label={singleCouponType}
              color="warning"
              size="small"
              key={index}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default CouponCard;
