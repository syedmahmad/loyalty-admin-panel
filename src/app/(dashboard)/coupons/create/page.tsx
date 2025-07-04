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
  IconButton,
  Tooltip,
} from "@mui/material";
import { Formik, Form, FormikTouched, FormikErrors, useFormik } from "formik";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import { GET, POST } from "@/utils/AxiosUtility";
import { toast } from "react-toastify";
import { RichTextEditor } from "@/components/TextEditor";
import { useRouter } from "next/navigation";
import { DeleteColumnOutlined } from "@ant-design/icons";
import { BusinessUnit, CouponFormValues, Tier } from "../types";
import {
  COUPON_TYPE,
  COUPON_TYPE_ARRAY,
  couponTypesArr,
} from "@/constants/constants";

const tooltipMessages = {
  discountPercentage: {
    DISCOUNT:
      "Enter a percentage-based discount (e.g., 10 for 10% off). Leave blank if using fixed amount.",
    CASHBACK: "This field is ignored for cashback. Leave it as 0.",
    TIER_BASED: "Not required. Discount is defined per user tier.",
    REFERRAL: "Optional: Used when offering percentage-based rewards.",
    BIRTHDAY: "Set the percentage discount for birthday offers.",
    USAGE_BASED: "Used to offer discount after specific usage count.",
    GEO_TARGETED: "Apply discount based on user's location.",
    PRODUCT_SPECIFIC: "Applies percentage discount to specific products.",
    TIME_LIMITED: "Valid within the specified time window.",
  },
  deductionPrice: {
    DISCOUNT:
      "Enter a fixed discount value (e.g., 100 for ₹100 off). Leave blank if using percentage.",
    CASHBACK: "This is the cashback amount the user receives after purchase.",
    REFERRAL: "Fixed cashback or reward amount for referral.",
    TIER_BASED: "Not used here — discount comes from tier mapping.",
    BIRTHDAY: "Fixed discount for birthday-related purchases.",
    USAGE_BASED: "Fixed discount after Nth usage.",
    GEO_TARGETED: "Flat discount based on user’s location.",
    PRODUCT_SPECIFIC: "Flat amount discount for specific products.",
    TIME_LIMITED: "Flat discount available within the active period.",
  },
};

const generateId = () => Date.now() + Math.floor(Math.random() * 1000);

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

const oncePerCustomer = [
  { name: "Enable", value: 1 },
  { name: "Disable", value: 0 },
];

const CreateCouponForm = () => {
  const [loading, setLoading] = useState(false);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [benefits, setBenefits] = useState<string>("");
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [selectedCouponType, setSelectedCouponType] = useState("");
  const [couponTypes, setCouponTypes] = useState([]);
  const [conditionOfCouponTypes, setConditionOfCouponTypes] = useState<
    { name: string }[]
  >([]);
  const [dynamicRows, setDynamicRows] = useState([
    { id: generateId(), type: "", operator: "", value: "" },
  ]);

  const router = useRouter();
  const created_by =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("client-info") || "{}")?.id ?? 0
      : 0;

  const formik = useFormik<CouponFormValues>({
    initialValues: {
      code: "",
      coupon_type: "",
      discount_percentage: 0,
      discount_price: 0,
      usage_limit: 1,
      business_unit_ids: [] as number[],
      once_per_customer: 0,
      conditions: {},
      general_error_message_en: "",
      general_error_message_ar: "",
      exception_error_message_en: "",
      exception_error_message_ar: "",
      benefits: "",
      date_from: "",
      date_to: "",
      is_active: true,
    },
    validationSchema: Yup.object({
      code: Yup.string().required("Code is required"),
      coupon_type: Yup.string().required("Coupon type is required"),
      usage_limit: Yup.number().min(1).required("Usage limit is required"),
      business_unit_ids: Yup.array().min(
        1,
        "Select at least one business unit"
      ),
      // once_per_customer: Yup.number().required(),
      date_from: Yup.date().required("Start date is required"),
      date_to: Yup.date()
        .min(Yup.ref("date_from"), "End date must be after start date")
        .required("End date is required"),
      is_active: Yup.boolean().required(),
    }),
    onSubmit: async (values, { resetForm }) => {
      console.log("values :::", values);
      console.log("FINAL PAYLOAD::", {
        ...values,
        conditions: dynamicRows,
      });
      await handleSubmit(values, resetForm);
    },
  });

  const {
    values,
    errors,
    touched,
    handleChange,
    handleSubmit: onFormSubmit,
    setFieldValue,
    setFieldTouched,
  } = formik;

  const loadData = async () => {
    setLoading(true);
    try {
      const [buData] = await Promise.all([fetchBusinessUnits()]);
      setBusinessUnits(buData);
    } finally {
      setLoading(false);
    }
  };

  const fetchCouponTypes = async () => {
    const res = await GET("/coupon-types");
    setCouponTypes(res?.data.couponTypes || []);
  };

  const fetchTiers = async () => {
    const res = await GET("/tiers");
    setTiers(res?.data.tiers || []);
  };

  useEffect(() => {
    loadData();
    fetchCouponTypes();
  }, []);

  useEffect(() => {
    if (selectedCouponType === COUPON_TYPE.TIER_BASED) {
      fetchTiers();
    }

    const selectedCouponConditionNames = couponTypes.find(
      (singleCouponType: any) => {
        if (singleCouponType.id === values.coupon_type) {
          return singleCouponType;
        }
      }
    );
    setConditionOfCouponTypes(selectedCouponConditionNames?.conditions);
  }, [values.coupon_type]);

  const handleSubmit = async (values: any, resetForm: () => void) => {
    setLoading(true);
    const payloads: any = values.business_unit_ids.map((buId: number) => ({
      code: values.code,
      coupon_type_id: values.coupon_type,
      conditions: dynamicRows,
      errors: {
        general_error_message_en: values.general_error_message_en,
        general_error_message_ar: values.general_error_message_ar,
        exception_error_message_en: values.exception_error_message_en,
        exception_error_message_ar: values.exception_error_message_ar,
      },
      discount_percentage: values.discount_percentage,
      discount_price: values.discount_price,
      once_per_customer: values.once_per_customer,
      usage_limit: values.usage_limit,
      date_from: values.date_from,
      date_to: values.date_to,
      benefits: benefits || "",
      business_unit_id: buId,
      tenant_id: created_by,
      created_by,
      updated_by: created_by,
    }));

    console.log("payloads ::", payloads);

    const responses = await Promise.all(
      payloads.map((payload: any) => POST("/coupons", payload))
    );

    const anyFailed = responses.some((res) => res?.status !== 201);

    if (anyFailed) {
      setLoading(false);
      toast.error("failed to create coupon");
    } else {
      toast.success("coupons created successfully!");
      resetForm();
      setBenefits("");
      setLoading(false);
      router.push("/coupons/view");
    }
  };

  const handleChangeCondition = (id: any, field: string, value: any) => {
    setDynamicRows((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleAdd = () => {
    setDynamicRows((prev) => [
      ...prev,
      { id: generateId(), type: "", operator: "", value: "" },
    ]);
  };

  const handleDelete = (idToDelete: any) => {
    console.log("idToDelete::", idToDelete);
    setDynamicRows((prev) => prev.filter((c) => c.id !== idToDelete));
  };

  console.log("selectedCouponType ::", selectedCouponType);

  return (
    <Card sx={{ maxWidth: 700, mx: "auto", mt: 4, p: 2, borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          ➕ Create New Coupon
        </Typography>

        {/* <pre>{JSON.stringify({ errors, touched, values }, null, 2)}</pre> */}

        <form onSubmit={formik.handleSubmit}>
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
                onChange={(e) => {
                  handleChange(e);
                  const selectedId = Number(e.target.value);
                  const selectedOption: any = COUPON_TYPE_ARRAY.find(
                    (option: { id: number }) => option.id === selectedId
                  );
                  setSelectedCouponType(selectedOption.type || "");
                  setFieldValue("conditions", {});
                  setTimeout(() => formik.validateForm(), 0);
                }}
                error={!!touched.coupon_type && !!errors.coupon_type}
                helperText={touched.coupon_type && errors.coupon_type}
              >
                {couponTypes.map(
                  (option: { id: number; coupon_type: string }) => (
                    <MenuItem key={option.coupon_type} value={option.id}>
                      {option.coupon_type}
                    </MenuItem>
                  )
                )}
              </TextField>
            </Grid>

            {values.coupon_type !== "" && (
              <>
                {dynamicRows.map(
                  (
                    row: {
                      id: any;
                      type: string;
                      operator: string;
                      value: string;
                      tier?: number;
                    },
                    index
                  ) => (
                    <Grid item xs={12} key={index}>
                      <Box display="flex" gap={1}>
                        {selectedCouponType === "TIER_BASED" && (
                          <TextField
                            select
                            label="Tier"
                            value={row.tier || ""}
                            onChange={(e) =>
                              handleChangeCondition(
                                row.id,
                                "tier",
                                e.target.value
                              )
                            }
                            sx={{ minWidth: 150 }}
                          >
                            {tiers?.map((tier) => (
                              <MenuItem key={tier.id} value={tier.id}>
                                {tier.name}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}

                        <TextField
                          select
                          label="Condition Type"
                          fullWidth
                          value={row.type}
                          onChange={(e) =>
                            handleChangeCondition(
                              row.id,
                              "type",
                              e.target.value
                            )
                          }
                        >
                          {(conditionOfCouponTypes ?? []).map(
                            (option: { name: string }) => (
                              <MenuItem key={option.name} value={option.name}>
                                {option.name}
                              </MenuItem>
                            )
                          )}
                        </TextField>

                        <TextField
                          select
                          fullWidth
                          label="Condition Operator"
                          value={row.operator}
                          onChange={(e) =>
                            handleChangeCondition(
                              row.id,
                              "operator",
                              e.target.value
                            )
                          }
                        >
                          <MenuItem value="==">Equal To (==)</MenuItem>
                          <MenuItem value="!=">Not Equal (!=)</MenuItem>
                          <MenuItem value=">">Greater Than (&gt;)</MenuItem>
                          <MenuItem value=">=">
                            Greater Than or Equal (&gt;=)
                          </MenuItem>
                          <MenuItem value="<">Less Than (&lt;)</MenuItem>
                          <MenuItem value="<=">
                            Less Than or Equal (&lt;=)
                          </MenuItem>
                        </TextField>

                        <TextField
                          label="Value"
                          fullWidth
                          value={row.value}
                          onChange={(e) =>
                            handleChangeCondition(
                              row.id,
                              "value",
                              e.target.value
                            )
                          }
                        />

                        {index === 0 && (
                          <IconButton onClick={handleAdd}>
                            <AddIcon fontSize="small" color="primary" />
                          </IconButton>
                        )}

                        {index >= 1 && (
                          <IconButton onClick={() => handleDelete(row.id)}>
                            <DeleteIcon fontSize="small" color="error" />
                          </IconButton>
                        )}
                      </Box>
                    </Grid>
                  )
                )}
              </>
            )}

            {selectedCouponType !== COUPON_TYPE.TIER_BASED && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="discount_percentage"
                    label="Discount (%)"
                    type="number"
                    value={values.discount_percentage}
                    onChange={handleChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="This field is ignored for cashback. Leave it as 0.">
                            <IconButton edge="end">
                              <InfoOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
                    error={
                      !!touched.discount_percentage &&
                      !!errors.discount_percentage
                    }
                    helperText={
                      touched.discount_percentage && errors.discount_percentage
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="discount_price"
                    label="Fixed Discount Amount"
                    type="number"
                    value={values.discount_price}
                    onChange={handleChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="Enter the cashback amount the user will receive after the purchase.">
                            <IconButton edge="end">
                              <InfoOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
                    error={!!touched.discount_price && !!errors.discount_price}
                    helperText={touched.discount_price && errors.discount_price}
                  />
                </Grid>
              </>
            )}

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
                value={values.once_per_customer ? 1 : 0}
                onChange={(e) => {
                  const selected = Number(e.target.value);
                  setFieldValue("once_per_customer", selected === 1);
                }}
                error={
                  !!touched.once_per_customer && !!errors.once_per_customer
                }
                helperText={
                  touched.once_per_customer && errors.once_per_customer
                }
              >
                {oncePerCustomer?.map((option, index) => (
                  <MenuItem key={option.name} value={option.value}>
                    {option.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {Boolean(values.once_per_customer) && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Reuse Interval (in days)"
                  value={values.code}
                  type="number"
                  name="code"
                  onChange={handleChange}
                  error={!!touched.code && !!errors.code}
                  helperText={touched.code && errors.code}
                />
              </Grid>
            )}

            {/* Expiry Date */}
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    type="date"
                    fullWidth
                    label="Date From"
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
                    label="Date To"
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

            {/* General failure Error */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                variant="outlined"
                label="General failure error (English)"
                value={values.general_error_message_en}
                name="general_error_message_en"
                onChange={handleChange}
                error={
                  !!touched.general_error_message_en &&
                  !!errors.general_error_message_en
                }
                helperText={
                  touched.general_error_message_en &&
                  errors.general_error_message_en
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                variant="outlined"
                label="General failure error (Arabic)"
                value={values.general_error_message_ar}
                name="general_error_message_ar"
                onChange={handleChange}
                error={
                  !!touched.general_error_message_ar &&
                  !!errors.general_error_message_ar
                }
                helperText={
                  touched.general_error_message_ar &&
                  errors.general_error_message_ar
                }
              />
            </Grid>

            {/* Exception Error */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                variant="outlined"
                label="Exception error (English)"
                value={values.exception_error_message_en}
                name="exception_error_message_en"
                onChange={handleChange}
                error={
                  !!touched.exception_error_message_en &&
                  !!errors.exception_error_message_en
                }
                helperText={
                  touched.exception_error_message_en &&
                  errors.exception_error_message_en
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                variant="outlined"
                label="Exception error (Arabic)"
                value={values.exception_error_message_ar}
                name="exception_error_message_ar"
                onChange={handleChange}
                error={
                  !!touched.exception_error_message_ar &&
                  !!errors.exception_error_message_ar
                }
                helperText={
                  touched.exception_error_message_ar &&
                  errors.exception_error_message_ar
                }
              />
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
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateCouponForm;
