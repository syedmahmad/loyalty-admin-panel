"use client";

import { GET, PUT } from "@/utils/AxiosUtility";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import { DateTime } from "luxon";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
// import { RichTextEditor } from "@/components/TextEditor";
import {
  COUPON_TYPE,
  COUPON_TYPE_ARRAY,
  tooltipMessages,
} from "@/constants/constants";
import { generateRandomCode } from "@/utils/Index";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { CouponFormValues } from "../types";

type Tier = {
  id: number;
  name: string;
};

type BusinessUnit = {
  id: number;
  name: string;
};

const oncePerCustomer = [
  { name: "Enable", value: 1 },
  { name: "Disable", value: 0 },
];

const generateId = () => Date.now() + Math.floor(Math.random() * 1000);

const EditCouponForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramId = searchParams.get("id");
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [selectedId, setSelectedId] = useState<string>(paramId || "");
  const [couponData, setCouponData] = useState<any>(null);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [benefits, setBenefits] = useState<string>("");
  const [couponTypes, setCouponTypes] = useState([]);
  const [selectedCouponType, setSelectedCouponType] = useState("");
  const [conditionOfCouponTypes, setConditionOfCouponTypes] = useState<
    { name: string }[]
  >([]);
  const [dynamicRows, setDynamicRows] = useState([
    { id: generateId(), type: "", operator: "", value: "" },
  ]);

  const userId =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("client-info") || "{}")?.id ?? 0
      : 0;

  useEffect(() => {
    const clientInfo = JSON.parse(localStorage.getItem("client-info")!);
    const resolveAllPromises = async () => {
      const fetchTiersAndBUs = async (name: string = "") => {
        const [tierListRes, buRes, couponTypesRes] = await Promise.all([
          GET(`/tiers/${clientInfo.id}?name=${encodeURIComponent(name)}`),
          GET(
            `/business-units/${clientInfo.id}?name=${encodeURIComponent(name)}`
          ),
          GET("/coupon-types"),
        ]);
        setTiers(tierListRes?.data.tiers || []);
        setBusinessUnits(buRes?.data || []);
        setCouponTypes(couponTypesRes?.data.couponTypes || []);

        if (paramId) {
          await fetchCouponById(paramId);
        }

        setInitializing(false);
      };

      await Promise.all([fetchTiersAndBUs()]);
    };

    resolveAllPromises();
  }, [paramId]);

  useEffect(() => {
    const selectedOption: any = COUPON_TYPE_ARRAY.find(
      (option: { id: number }) => option.id === couponData?.coupon_type_id
    );
    setSelectedCouponType(selectedOption?.type || "");
    setDynamicRows(couponData?.conditions);
  }, [couponData?.coupon_type_id]);

  const fetchCouponById = async (id: string) => {
    setLoading(true);
    const res = await GET(`/coupons/edit/${id}`);
    if (!res?.data) {
      toast.error("Coupon not found");
      return;
    }
    setSelectedId(id);
    setCouponData(res.data);
    setBenefits(res.data.benefits || "");
    setLoading(false);
  };

  const formik = useFormik<CouponFormValues>({
    initialValues: {
      code: couponData?.code || "",
      coupon_type: couponData?.coupon_type_id || "",
      discount_percentage: couponData?.discount_percentage || 0,
      discount_price: couponData?.discount_price || 0,
      usage_limit: couponData?.usage_limit || 1,
      business_unit_ids: couponData?.business_unit_id
        ? [couponData.business_unit_id]
        : [],
      once_per_customer: couponData?.once_per_customer || 0,
      reuse_interval: couponData?.reuse_interval || 0,
      conditions: couponData?.conditions || {},
      general_error_message_en:
        couponData?.errors?.general_error_message_en || "",
      general_error_message_ar:
        couponData?.errors?.general_error_message_ar || "",
      exception_error_message_en:
        couponData?.errors?.exception_error_message_en || "",
      exception_error_message_ar:
        couponData?.errors?.exception_error_message_ar || "",
      benefits: "",
      date_from:
        DateTime.fromISO(couponData?.date_from).toFormat("yyyy-MM-dd") || "",
      date_to:
        DateTime.fromISO(couponData?.date_to).toFormat("yyyy-MM-dd") || "",
      status: couponData?.status,
    },
    validationSchema: Yup.object({
      code: Yup.string().required("Code is required"),
      coupon_type: Yup.string().required("Coupon type is required"),
      usage_limit: Yup.number().min(1).required("Usage limit is required"),
      business_unit_ids: Yup.array().min(
        1,
        "Select at least one business unit"
      ),
      date_from: Yup.date().required("Start date is required"),
      date_to: Yup.date()
        .min(Yup.ref("date_from"), "End date must be after start date")
        .required("End date is required"),
      status: Yup.boolean().required(),
    }),
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      console.log("values :::", values);
      console.log("FINAL PAYLOAD::", {
        ...values,
        conditions: dynamicRows,
      });
      await handleSubmit(values);
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

  useEffect(() => {
    const selectedCouponConditionNames: any = couponTypes.find(
      (singleCouponType: any) => {
        if (singleCouponType.id === values.coupon_type) {
          return singleCouponType;
        }
      }
    );
    setConditionOfCouponTypes(selectedCouponConditionNames?.conditions);
  }, [values.coupon_type]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    const payload = {
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
      reuse_interval: values.reuse_interval,
      usage_limit: values.usage_limit,
      date_from: values.date_from,
      date_to: values.date_to,
      status: values.status,
      benefits: benefits || "",
      updated_by: userId,
    };
    const res = await PUT(`/coupons/${selectedId}`, payload);
    if (res?.status !== 200) {
      toast.error("Failed to update coupon");
    } else {
      toast.success("Coupon updated!");
      onSuccess();
    }
    setLoading(false);
  };

  if (initializing) {
    return (
      <Box mt={6} textAlign="center">
        <CircularProgress />
      </Box>
    );
  }

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
    setDynamicRows((prev) => prev.filter((c) => c.id !== idToDelete));
  };

  return (
    <>
      {couponData && (
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
                  const selectedCouponId = Number(e.target.value);
                  const selectedOption: any = COUPON_TYPE_ARRAY.find(
                    (option: { id: number }) => option.id === selectedCouponId
                  );
                  setSelectedCouponType(selectedOption.type || "");
                  setFieldValue("conditions", {});
                  setDynamicRows([
                    { id: generateId(), type: "", operator: "", value: "" },
                  ]);
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
                {dynamicRows?.map(
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
                        {selectedCouponType === COUPON_TYPE.TIER_BASED && (
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
                                {tier.name} ({tier?.business_unit?.name})
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
                      endAdornment: selectedCouponType ? (
                        <InputAdornment position="end">
                          <Tooltip
                            title={
                              tooltipMessages.discountPercentage[
                                selectedCouponType
                              ] || ""
                            }
                          >
                            <IconButton edge="end">
                              <InfoOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ) : null,
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
                      endAdornment: selectedCouponType ? (
                        <InputAdornment position="end">
                          <Tooltip
                            title={
                              tooltipMessages.discountPrice[
                                selectedCouponType
                              ] || ""
                            }
                          >
                            <IconButton edge="end">
                              <InfoOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ) : null,
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

            {/* Business Units */}
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

            {/* Once Per Customer */}
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

            {/* Reuse Interval */}
            {Boolean(values.once_per_customer) && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Reuse Interval (in days)"
                  value={values.reuse_interval}
                  type="number"
                  name="reuse_interval"
                  onChange={handleChange}
                  error={!!touched.reuse_interval && !!errors.reuse_interval}
                  helperText={touched.reuse_interval && errors.reuse_interval}
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

            {/* Is Active */}
            <Grid item xs={12}>
              <Grid container alignItems="center" spacing={2}>
                <Grid item>
                  <Typography variant="subtitle1">Is Active</Typography>
                </Grid>
                <Grid item>
                  <Switch
                    name="isActive"
                    color="primary"
                    checked={values.status === 1}
                    onChange={(e) =>
                      setFieldValue("status", e.target.checked ? 1 : 0)
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
              <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
                <Button
                  type="submit"
                  variant="outlined"
                  disabled={loading}
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                    fontWeight: 600,
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : "Update Coupon"}
                </Button>
              </Box>

              <br />
              <br />
            </Grid>
          </Grid>
        </form>
      )}
    </>
  );
};

export default EditCouponForm;
