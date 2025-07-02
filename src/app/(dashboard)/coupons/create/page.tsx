"use client";

import {
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  TextField,
  Typography,
  CircularProgress,
  Box,
  Stack,
  InputAdornment,
  Switch,
  FormControlLabel,
  FormControl,
} from "@mui/material";
import { Formik, Form, FormikTouched, FormikErrors } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import { GET, POST } from "@/utils/AxiosUtility";
import { toast } from "react-toastify";
import { RichTextEditor } from "@/components/TextEditor";
import { useRouter } from "next/navigation";

type BusinessUnit = {
  id: number;
  name: string;
};

const fetchBusinessUnits = async (): Promise<BusinessUnit[]> => {
  const response = await GET("/business-units");
  if (response?.status !== 200) {
    throw new Error("Failed to fetch business units");
  }
  return response.data;
};

const generateRandomCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${result}`;
};

const couponTypes = [
  "DISCOUNT",
  "CASHBACK",
  "TIER_BASED",
  "REFERRAL",
  "BIRTHDAY",
  "USAGE_BASED",
  "GEO_TARGETED",
  "PRODUCT_SPECIFIC",
  "TIME_LIMITED",
  "USER_SPECIFIC",
  "VEHICLE_SPECIFIC",
];

const oncePerCustomer = [
  { name: "Enable", value: true },
  { name: "Disable", value: false },
];

type CouponFormValues = {
  code: string;
  coupon_type: string;
  discount_percentage: string | number;
  discount_price: string | number;
  usage_limit: number;
  business_unit_ids: number[];
  date_from: string;
  date_to: string;
  once_per_customer?: boolean;
  is_active: boolean;
  benefits: string;
  // conditions: {
  //   [key: string]: any;
  // };
  conditions: Record<string, any>;
};

const renderConditionFields = (
  couponType: string,
  values: CouponFormValues,
  handleChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  >,
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void,
  touched: FormikTouched<CouponFormValues>,
  errors: FormikErrors<CouponFormValues>
) => {
  switch (couponType) {
    case "DISCOUNT":
      return (
        <>
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="conditions.discount_percentage"
              label="Discount (%)"
              type="number"
              value={values.conditions?.discount_percentage}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="conditions.discount_price"
              label="Discount Amount"
              type="number"
              value={values.conditions?.discount_price}
              onChange={handleChange}
            />
          </Grid>
        </>
      );

    case "CASHBACK":
      return (
        <>
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="conditions.cashback_price"
              label="Cashback price"
              type="number"
              value={values.conditions?.cashback_price}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="conditions.min_purchase_amount"
              label="Minimum Purchase Amount"
              type="number"
              value={values.conditions?.min_purchase_amount}
              onChange={handleChange}
            />
          </Grid>
        </>
      );

    default:
      return null;
  }
};

const CreateCouponForm = () => {
  const [loading, setLoading] = useState(false);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [benefits, setBenefits] = useState<string>("");

  const router = useRouter();

  const created_by =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("client-info") || "{}")?.id ?? 0
      : 0;

  const loadData = async () => {
    setLoading(true);
    try {
      const [buData] = await Promise.all([
        fetchBusinessUnits(),
      ]);
      setBusinessUnits(buData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getConditionsSchema = (type: string): Yup.ObjectSchema<any> => {
    console.log("Type :::", type);
    switch (type) {
      case "DISCOUNT":
        return Yup.object({
          discountPercentage: Yup.number()
            .min(1)
            .max(100)
            .required("Discount % is required"),
          deductionPrice: Yup.number()
            .min(0)
            .required("Deduction price is required"),
        });

      case "CASHBACK":
        return Yup.object({
          cashbackPrice: Yup.number().required("Cashback amount is required"),
          minPurchaseAmount: Yup.number().required(
            "Minimum purchase amount is required"
          ),
        });

      case "TIME_LIMITED":
        return Yup.object({
          minimumPurchase: Yup.number()
            .min(1)
            .required("Minimum purchase is required"),
          autoApply: Yup.boolean().required("Auto apply must be set"),
        });

      case "BIRTHDAY":
        return Yup.object({
          minimumPurchase: Yup.number().required("Minimum purchase required"),
          userMustVerifyBirthday: Yup.boolean().required(),
          validOnCategories: Yup.array().of(Yup.string()).required(),
          daysBefore: Yup.number().min(0).required("Days before is required"),
          daysAfter: Yup.number().min(0).required("Days after is required"),
          discountPercentage: Yup.number().required("Discount is required"),
        });

      case "USAGE_BASED":
        return Yup.object({
          requiredUsageCount: Yup.number().required("Usage count is required"),
          discountPercentage: Yup.number().required("Discount is required"),
        });

      case "REFERRAL":
        return Yup.object({
          referredUserFirstPurchaseMinAmount: Yup.number().required(),
          referredUserSignupRequired: Yup.boolean().required(),
          referrerMustBeExistingCustomer: Yup.boolean().required(),
          maxReferralsPerUser: Yup.number().min(1).required(),
          referrerRewardType: Yup.string().required(),
          referredUserRewardType: Yup.string().required(),
          referralDiscount: Yup.number(),
          referrerReward: Yup.number(),
          referralDiscountPercentage: Yup.number(),
          referrerRewardPercentage: Yup.number(),
        });

      case "TIER_BASED":
        return Yup.object({
          tiers: Yup.object({
            SILVER: Yup.object({
              discountPercentage: Yup.number().required(),
            }),
            GOLD: Yup.object({
              discountPercentage: Yup.number().required(),
            }),
            PLATINUM: Yup.object({
              discountPercentage: Yup.number().required(),
            }),
          }).required(),
        });

      case "GEO_TARGETED":
        return Yup.object({
          allowedCities: Yup.array().of(Yup.string()).required(),
          allowedZipCodes: Yup.array().of(Yup.string()).required(),
        });

      case "PRODUCT_SPECIFIC":
        return Yup.object({
          applicableProductIds: Yup.array().of(Yup.string()).required(),
          discountPercentage: Yup.number().required(),
        });

      default:
        return Yup.object();
    }
  };

  const initialValues = {
    code: "",
    coupon_type: "",
    discount_percentage: 0,
    discount_price: 0,
    usage_limit: 1,
    business_unit_ids: [] as number[],
    once_per_customer: false,
    conditions: {},
    benefits: "",
    date_from: "",
    date_to: "",
    is_active: true,
  };

  const validationSchema = Yup.object({
    code: Yup.string().required("Coupon code is required"),
    coupon_type: Yup.string().required("Coupon type is required"),
    usage_limit: Yup.number().required("Usage Limit required"),
    business_unit_ids: Yup.array()
      .min(1, "At least one business unit is required")
      .of(Yup.number().required()),
    once_per_customer: Yup.string().required("Once per customer is required"),
    date_from: Yup.string().required("Start date is required"),
    date_to: Yup.string().required("End date is required"),

    // conditions: Yup.lazy((_, context) =>
    //   getConditionsSchema(context.parent?.coupon_type)
    // ),
  });

  const handleSubmit = async (
    values: typeof initialValues,
    resetForm: () => void
  ) => {
    setLoading(true);
    const payloads = values.business_unit_ids.map((buId) => ({
      code: values.code,
      discount_percentage: values.discount_percentage,
      discount_price: values.discount_price,
      usage_limit: values.usage_limit,
      benefits: benefits || "",
      business_unit_id: buId,
      tenant_id: created_by,
      created_by,
      updated_by: created_by,
    }));

    const responses = await Promise.all(
      payloads.map((payload) => POST("/coupons", payload))
    );

    const anyFailed = responses.some((res) => res?.status !== 201);

    if (anyFailed) {
      setLoading(false);
      toast.error("Some coupons failed to create");
    } else {
      toast.success("All coupons created successfully!");
      resetForm();
      setBenefits("");
      setLoading(false);
      router.push("/coupons/view");
    }
  };

  return (
    <Card sx={{ maxWidth: 700, mx: "auto", mt: 4, p: 2, borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          ➕ Create New Coupon
        </Typography>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={(values, { resetForm }) => handleSubmit(values, resetForm)}
        >
          {({ values, errors, touched, handleChange, setFieldValue }) => (
            <Form noValidate>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Generate code"
                    value={values.code}
                    name="code"
                    onChange={handleChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            onClick={() => {
                              const generatedCode = generateRandomCode();
                              setFieldValue("code", generatedCode);
                            }}
                            variant="contained"
                            sx={{
                              height: "100%",
                              borderRadius: 0,
                              padding: "20px 16px",
                              fontWeight: 500,
                            }}
                          >
                            Generate
                          </Button>
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: 2,
                        paddingRight: 0,
                        overflow: "hidden",
                      },
                    }}
                    error={!!touched.code && !!errors.code}
                    helperText={touched.code && errors.code}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    name="coupon_type"
                    label="Coupon Type"
                    value={values.coupon_type}
                    onChange={handleChange}
                    error={!!touched.coupon_type && !!errors.coupon_type}
                    helperText={touched.coupon_type && errors.coupon_type}
                  >
                    {couponTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Dynamic Condition Fields */}
                {renderConditionFields(
                  values.coupon_type,
                  values,
                  handleChange,
                  setFieldValue,
                  touched,
                  errors
                )}

                {/* <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="discount_percentage"
                    label="Discount (%)"
                    value={values.discount_percentage}
                    onChange={handleChange}
                    error={
                      !!touched.discount_percentage &&
                      !!errors.discount_percentage
                    }
                    helperText={
                      touched.discount_percentage && errors.discount_percentage
                    }
                  />
                </Grid> */}

                {/* <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="discount_price"
                    label="Discount Price"
                    type="number"
                    value={values.discount_price}
                    onChange={handleChange}
                    error={!!touched.discount_price && !!errors.discount_price}
                    helperText={touched.discount_price && errors.discount_price}
                  />
                </Grid> */}

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="usage_limit"
                    label="Usage Limit"
                    placeholder="Usage Limit"
                    type="number"
                    value={values.usage_limit}
                    onChange={handleChange}
                    error={!!touched.usage_limit && !!errors.usage_limit}
                    helperText={touched.usage_limit && errors.usage_limit}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    name="business_unit_ids"
                    label="Business Units"
                    SelectProps={{ multiple: true }}
                    value={values.business_unit_ids}
                    onChange={handleChange}
                    error={
                      !!touched.business_unit_ids && !!errors.business_unit_ids
                    }
                    helperText={
                      touched.business_unit_ids && errors.business_unit_ids
                    }
                  >
                    {businessUnits?.map((bu) => (
                      <MenuItem key={bu.id} value={bu.id}>
                        {bu.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    name="once_per_customer"
                    label="Once Per Customer"
                    value={values.once_per_customer}
                    onChange={(e) =>
                      setFieldValue(
                        "once_per_customer",
                        e.target.value === "true"
                      )
                    }
                    error={
                      !!touched.once_per_customer && !!errors.once_per_customer
                    }
                    helperText={
                      touched.once_per_customer && errors.once_per_customer
                    }
                  >
                    {oncePerCustomer?.map((option, index) => (
                      <MenuItem key={option.name} value={String(option.value)}>
                        {option.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Expiry Date (From and To)
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        type="date"
                        fullWidth
                        name="date_from"
                        InputLabelProps={{ shrink: true }}
                        value={values.date_from}
                        onChange={handleChange}
                        error={!!touched.date_from && !!errors.date_from}
                        helperText={touched.date_from && errors.date_from}
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <TextField
                        type="date"
                        fullWidth
                        name="date_to"
                        InputLabelProps={{ shrink: true }}
                        value={values.date_to}
                        onChange={handleChange}
                        error={!!touched.date_to && !!errors.date_to}
                        helperText={touched.date_to && errors.date_to}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item>
                      <Typography variant="subtitle1">Is Active</Typography>
                    </Grid>
                    <Grid item>
                      <Switch
                        name="isActive"
                        color="primary"
                        checked={values.is_active}
                        onChange={(e) =>
                          setFieldValue("is_active", e.target.checked)
                        }
                      />
                    </Grid>
                  </Grid>
                </Grid>

                {/* <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Benefits (optional)
                  </Typography>
                  <RichTextEditor
                    value={benefits}
                    setValue={setBenefits}
                    language="en"
                  />
                </Grid> */}

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{ textTransform: "none", borderRadius: 2 }}
                  >
                    {loading ? <CircularProgress size={24} /> : "Create Coupon"}
                  </Button>
                  <br />
                  <br />
                  <Button
                    variant="contained"
                    color="secondary"
                    fullWidth
                    size="large"
                    onClick={() => router.push("view")}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    Go Back
                  </Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </CardContent>
    </Card>
  );
};

export default CreateCouponForm;
