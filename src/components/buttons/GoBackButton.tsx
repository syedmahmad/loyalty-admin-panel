"use client";

import React from "react";
import { Button, ButtonProps } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/navigation";

interface GoBackButtonProps extends ButtonProps {
  name?: string;
}

const GoBackButton: React.FC<GoBackButtonProps> = ({
  name = "Go Back",
  variant = "contained",
  size = "medium",
  color = "primary",
  ...rest
}) => {
  const router = useRouter();

  return (
    <Button
      variant={variant}
      color={color}
      startIcon={<ArrowBackIcon />}
      onClick={() => router.back()}
      size={size}
      sx={{ marginBottom: 2 }}
      {...rest}
    >
      {name}
    </Button>
  );
};

export default GoBackButton;
