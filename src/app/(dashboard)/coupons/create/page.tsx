"use client";

import { RichTextEditor } from "@/components/TextEditor";
import {
  COUPON_TYPE,
  COUPON_TYPE_ARRAY,
  discountTypes,
  tooltipMessages,
  tooltipMessagesValidityAfterAssignment,
} from "@/constants/constants";
import { GET, POST } from "@/utils/AxiosUtility";
import { generateRandomCode, getYearsArray } from "@/utils/Index";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
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
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import {
  BusinessUnit,
  CouponFormValues,
  dynamicRows,
  Make,
  Model,
  Tier,
} from "../types";
import { debounce } from "lodash";

const generateId = () => Date.now() + Math.floor(Math.random() * 1000);

const fetchBusinessUnits = async (
  name: string = ""
): Promise<BusinessUnit[]> => {
  const clientInfo = JSON.parse(localStorage.getItem("client-info")!);
  const response = await GET(
    `/business-units/${clientInfo.id}?name=${encodeURIComponent(name)}`
  );
  if (response?.status !== 200) {
    throw new Error("Failed to fetch business units");
  }
  return response.data;
};

const selectAllVariants = { TrimId: "all", Trim: "Select All" };

const CreateCouponForm = ({
  onSuccess,
  handleDrawerWidth,
}: {
  onSuccess: () => void;
  handleDrawerWidth: (selectedCouponType: string) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [benefits, setBenefits] = useState<string>("");
  const [termsAndConditionsEn, setTermsAndConditionsEn] = useState<string>("");
  const [termsAndConditionsAr, setTermsAndConditionsAr] = useState<string>("");
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [makes, setMakes] = useState([]);
  const [selectedCouponType, setSelectedCouponType] = useState("");
  const [selectedCouponTypeId, setSelectedCouponTypeId] = useState<number>();
  const [segments, setSegments] = useState([]);
  const [benefitsInputs, setBenefitsInputs] = useState<string[]>([""]);
  const [translationLoading, setTranslationLoading] = useState<{
    [key: string]: boolean;
  }>({});

  const fetchCustomerSegments = async () => {
    const clientInfo = JSON.parse(localStorage.getItem("client-info")!);
    const res = await GET(`/customer-segments/${clientInfo.id}`);
    setSegments(res?.data || []);
  };

  const [couponTypes, setCouponTypes] = useState([]);
  const [dynamicCouponTypesRows, setDynamicCouponTypesRows] = useState([
    {
      id: generateId(),
      coupon_type: "",
      selectedCouponType: "",
      conditionOfCouponTypes: [],
      dynamicRows: [
        {
          id: generateId(),
          type: "",
          operator: "",
          value: "",
          models: [],
          variants: [],
        },
      ],
      conditions: [],
    },
  ]);

  const created_by =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("client-info") || "{}")?.id ?? 0
      : 0;

  const formik = useFormik<CouponFormValues>({
    initialValues: {
      coupon_title: "",
      coupon_title_ar: "",
      code: "",
      coupon_type: "",
      discount_type: "fixed_discount",
      discount_price: 0,
      usage_limit: 1,
      business_unit_ids: [] as number[],
      once_per_customer: 0,
      max_usage_per_user: 0,
      reuse_interval: 0,
      conditions: {},
      general_error_message_en: "",
      general_error_message_ar: "",
      exception_error_message_en: "",
      exception_error_message_ar: "",
      benefits: "",
      date_from: "",
      date_to: "",
      validity_after_assignment: "",
      is_point_earning_disabled: 0,
      status: 1,
      customer_segment_ids: [] as number[],
      description_en: "",
      description_ar: "",
    },
    validationSchema: Yup.object({
      coupon_title: Yup.string().required("Coupon title is required"),
      code: Yup.string().required("Code is required"),
      discount_price: Yup.number()
        .typeError("Discount price must be a number")
        .min(0, "Discount price cannot be negative"),

      usage_limit: Yup.number().min(1).required("Usage limit is required"),
      max_usage_per_user: Yup.number()
        .min(0)
        .required("Max usage per user is required"),
      business_unit_ids: Yup.array().min(
        1,
        "Select at least one business unit"
      ),
      date_from: Yup.date().required("Start date is required"),
      date_to: Yup.date()
        .min(Yup.ref("date_from"), "End date must be after start date")
        .required("End date is required"),
      validity_after_assignment: Yup.number()
        .typeError("Validity after assign must be a number")
        .min(0, "Validity after assign cannot be negative"),

      status: Yup.number().required(),
    }),
    onSubmit: async (values, { resetForm }) => {
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
    setFieldError,
    setErrors,
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

  const fetchTiers = async (name: string = "") => {
    const clientInfo = JSON.parse(localStorage.getItem("client-info")!);
    const res = await GET(
      `/tiers/${clientInfo.id}?name=${encodeURIComponent(name)}`
    );
    setTiers(res?.data.tiers || []);
  };

  const fetchMakes = async () => {
    const res = await GET(`/coupons/vehicle/makes`);
    setMakes(res?.data?.data || []);
  };

  const fetchModelByMakeId = async (
    rowId: number,
    makeId: number,
    year: number
  ) => {
    const res = await GET(
      `/coupons/vehicle/models?makeId=${makeId}&year=${year}`
    );
    const models = res?.data?.data || [];
    setDynamicCouponTypesRows((prev: any[]) =>
      prev.map((row: any) =>
        row.coupon_type === selectedCouponTypeId
          ? {
              ...row,
              dynamicRows: row.dynamicRows.map((dRow: any) =>
                dRow.id === rowId ? { ...dRow, models: models } : dRow
              ),
            }
          : row
      )
    );
  };

  const fetchVariantByModelId = async (rowId: number, modelId: number) => {
    const res = await GET(`/coupons/vehicle/variants/${modelId}`);
    const variants = res?.data?.data || [];
    setDynamicCouponTypesRows((prev: any[]) =>
      prev.map((row: any) =>
        row.coupon_type === selectedCouponTypeId
          ? {
              ...row,
              dynamicRows: row.dynamicRows.map((dRow: any) =>
                dRow.id === rowId ? { ...dRow, variants: variants } : dRow
              ),
            }
          : row
      )
    );
  };

  useEffect(() => {
    loadData();
    fetchCouponTypes();
    fetchCustomerSegments();
  }, []);

  useEffect(() => {
    if (selectedCouponTypeId) {
      handleDrawerWidth(selectedCouponType);
      if (selectedCouponType === COUPON_TYPE.TIER_BASED) {
        fetchTiers();
      }

      if (selectedCouponType === COUPON_TYPE.VEHICLE_SPECIFIC) {
        fetchMakes();
      }

      const selectedCouponConditionNames: any = couponTypes.find(
        (singleCouponType: any) => {
          if (singleCouponType.id === selectedCouponTypeId) {
            return singleCouponType;
          }
        }
      );

      setDynamicCouponTypesRows((prev: any[]) =>
        prev.map((row: any) =>
          row.coupon_type === selectedCouponTypeId
            ? {
                ...row,
                conditionOfCouponTypes:
                  selectedCouponConditionNames?.conditions || [],
                dynamicRows: [
                  {
                    id: generateId(),
                    type: "",
                    operator: "",
                    value: "",
                    models: [],
                    variants: [],
                  },
                ],
                selectedCouponType: selectedCouponType,
              }
            : row
        )
      );
    }
  }, [selectedCouponTypeId]);

  const handleSubmit = async (
    values: CouponFormValues,
    resetForm: () => void
  ) => {
    /** Simple Coupon Old */
    /*
    const condtionsArr =
      dynamicCouponTypesRows.length > 1
        ? null
        : dynamicCouponTypesRows[0].dynamicRows.map(
            ({ models, variants, ...rest }) => rest
          );
    */

    /** Simple Coupon New */
    let condtionsArr = null;
    switch (dynamicCouponTypesRows[0]?.selectedCouponType) {
      case "BIRTHDAY":
        condtionsArr = null;
        break;

      case "PRODUCT_SPECIFIC":
      case "GEO_TARGETED":
        condtionsArr =
          dynamicCouponTypesRows.length > 1
            ? null
            : dynamicCouponTypesRows[0]?.dynamicRows.map(({ id, type }) => ({
                id,
                type,
              }));
        break;

      default:
        condtionsArr =
          dynamicCouponTypesRows.length > 1
            ? null
            : dynamicCouponTypesRows[0]?.dynamicRows.map(
                ({ models, variants, ...rest }) => rest
              );
        break;
    }

    /** Complex Coupon Old*/
    // const complexCouponArr = dynamicCouponTypesRows.length > 1 ? dynamicCouponTypesRows : null;

    /** Complex Coupon New */
    const complexCouponArr =
      dynamicCouponTypesRows.length > 1
        ? dynamicCouponTypesRows.map((row) => {
            switch (row.selectedCouponType) {
              case "BIRTHDAY":
                return {
                  ...row,
                  dynamicRows: [],
                };

              case "PRODUCT_SPECIFIC":
              case "GEO_TARGETED":
                return {
                  ...row,
                  dynamicRows: row.dynamicRows.map(({ id, type }) => ({
                    id,
                    type,
                  })),
                };

              case "VEHICLE_SPECIFIC":
                return {
                  ...row,
                };

              default:
                return {
                  ...row,
                  dynamicRows: row.dynamicRows.map(
                    ({ models, variants, ...rest }) => rest
                  ),
                };
            }
          })
        : null;

    const coupon_type_id =
      dynamicCouponTypesRows.length > 1
        ? null
        : dynamicCouponTypesRows[0].coupon_type;

    setLoading(true);
    const payloads = values.business_unit_ids.map((buId: number) => ({
      coupon_title: values.coupon_title,
      coupon_title_ar: values.coupon_title_ar,
      code: values.code,
      // coupon_type_id: values.coupon_type,
      // conditions: dynamicRows.map(({ models, variants, ...rest }) => rest),
      coupon_type_id: coupon_type_id,
      complex_coupon: complexCouponArr,
      conditions: condtionsArr,
      errors: {
        general_error_message_en: values.general_error_message_en,
        general_error_message_ar: values.general_error_message_ar,
        exception_error_message_en: values.exception_error_message_en,
        exception_error_message_ar: values.exception_error_message_ar,
      },
      discount_type: values.discount_type,
      discount_price: values.discount_price || 0,
      // once_per_customer: values.once_per_customer,
      max_usage_per_user: values.max_usage_per_user,
      reuse_interval: values.reuse_interval || 0,
      usage_limit: values.usage_limit || 0,
      date_from: values.date_from,
      date_to: values.date_to,
      validity_after_assignment: !values.validity_after_assignment
        ? null
        : values.validity_after_assignment,
      is_point_earning_disabled: values.is_point_earning_disabled || 0,
      status: values.status,
      // benefits: benefits || "",
      benefits: benefitsInputs || [],
      business_unit_id: buId,
      tenant_id: created_by,
      created_by,
      updated_by: created_by,
      customer_segment_ids: values.customer_segment_ids,
      description_en: values.description_en,
      description_ar: values.description_ar,
      terms_and_conditions_en: termsAndConditionsEn || "",
      terms_and_conditions_ar: termsAndConditionsAr || "",
    }));

    const responses = await Promise.all(
      payloads.map(async (payload) => {
        try {
          const res = await POST("/coupons", payload);
          return { success: true, status: res?.status, data: res?.data };
        } catch (error: any) {
          return {
            success: false,
            status: error?.response?.status || 500,
            message: error?.response?.data?.message || "Unknown error",
          };
        }
      })
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
      onSuccess();
    }
  };

  const handleChangeCondition = (
    parentId: number,
    id: number,
    field: string,
    value: number | string | (number | string)[]
  ) => {
    setDynamicCouponTypesRows((prev: any[]) =>
      prev.map((row: any) =>
        row.id === parentId
          ? {
              ...row,
              dynamicRows: row.dynamicRows.map((dRow: any) =>
                dRow.id === id ? { ...dRow, [field]: value } : dRow
              ),
            }
          : row
      )
    );
  };

  const handleAdd = (parentId: any) => {
    const newDynamicRow = {
      id: generateId(),
      type: "",
      operator: "",
      value: "",
      models: [],
      variants: [],
    };

    setDynamicCouponTypesRows((prev) =>
      prev.map((row) => {
        return row.id === parentId
          ? {
              ...row,
              dynamicRows: [...row.dynamicRows, newDynamicRow],
            }
          : row;
      })
    );
  };

  const handleDelete = (parentId: number, idToDelete: number) => {
    setDynamicCouponTypesRows((prev) =>
      prev.map((row) =>
        row.id === parentId
          ? {
              ...row,
              dynamicRows: row.dynamicRows.filter((dr) => dr.id !== idToDelete),
            }
          : row
      )
    );
  };

  const handleAddCouponTypeRows = () => {
    setDynamicCouponTypesRows((prev) => [
      ...prev,
      {
        id: generateId(),
        coupon_type: "",
        selectedCouponType: "",
        conditionOfCouponTypes: [],
        dynamicRows: [],
        conditions: [],
      },
    ]);
  };

  const handleDeleteCouponTypeRows = (idToDelete: number) => {
    setDynamicCouponTypesRows((prev) =>
      prev.filter((c) => c.id !== idToDelete)
    );
  };

  const renderServiceTypeName = (
    conditionType: string,
    row: any,
    dynamicCouponTypesRow: any
  ) => {
    switch (conditionType) {
      case COUPON_TYPE.PRODUCT_SPECIFIC:
      case COUPON_TYPE.SERVICE_BASED:
      case COUPON_TYPE.GEO_TARGETED:
      case COUPON_TYPE.DISCOUNT:
        return (
          <TextField
            label={`Condition Type ${
              conditionType === COUPON_TYPE.GEO_TARGETED
                ? "(eg: You can enter values like Pakistan, != India, or != Karachi. Leave it blank to allow all locations.)"
                : ""
            }`}
            fullWidth
            value={row.type}
            onChange={(e) =>
              handleChangeCondition(
                dynamicCouponTypesRow.id,
                row.id,
                "type",
                e.target.value
              )
            }
            sx={{ minWidth: 150 }}
          />
        );

      case COUPON_TYPE.BIRTHDAY:
        return null;

      default:
        return (
          <TextField
            select
            label="Condition Type"
            fullWidth
            value={row.type}
            onChange={(e) =>
              handleChangeCondition(
                dynamicCouponTypesRow.id,
                row.id,
                "type",
                e.target.value
              )
            }
          >
            {(dynamicCouponTypesRow.conditionOfCouponTypes ?? []).map(
              (option: { name: string }) => (
                <MenuItem key={option.name} value={option.name}>
                  {option.name}
                </MenuItem>
              )
            )}
          </TextField>
        );
    }
  };

  // helper to generate MenuItems
  const getOperatorMenuItems = (includeComparisons: boolean) => {
    const baseOperators = [
      { value: "==", label: "Equal To (==)" },
      { value: "!=", label: "Not Equal (!=)" },
    ];

    const comparisonOperators = [
      { value: ">", label: "Greater Than (>)" },
      { value: ">=", label: "Greater Than or Equal (>=)" },
      { value: "<", label: "Less Than (<)" },
      { value: "<=", label: "Less Than or Equal (<=)" },
    ];

    return [
      ...baseOperators,
      ...(includeComparisons ? comparisonOperators : []),
    ].map((op) => (
      <MenuItem key={op.value} value={op.value}>
        {op.label}
      </MenuItem>
    ));
  };

  const addBenefitInput = () => {
    setBenefitsInputs([...benefitsInputs, ""]);
  };

  const handleArabictranslate = async (
    key: string,
    value: string,
    richEditor: boolean = false
  ) => {
    try {
      setTranslationLoading((prev) => ({ ...prev, [key]: true }));
      const res = await POST("/openai/translate-to-arabic", { value });
      if (res?.data.status) {
        if (richEditor) {
          setTermsAndConditionsAr(res?.data?.data);
        } else {
          setFieldValue(key, res?.data?.data);
        }
      }
    } catch (error: any) {
      return {
        success: false,
        status: error?.response?.status || 500,
        message: error?.response?.data?.message || "Unknown error",
      };
    } finally {
      setTranslationLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          {/* Coupon Title English */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              variant="outlined"
              label="Coupon Title English"
              value={values.coupon_title}
              name="coupon_title"
              onChange={handleChange}
              onBlur={(e) =>
                handleArabictranslate("coupon_title_ar", e.target.value)
              }
              error={!!touched.coupon_title && !!errors.coupon_title}
              helperText={touched.coupon_title && errors.coupon_title}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {translationLoading["coupon_title_ar"] && (
                      <CircularProgress size={20} />
                    )}
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Coupon Title Arabic */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              variant="outlined"
              label="Coupon Title Arabic"
              value={values.coupon_title_ar}
              name="coupon_title_ar"
              onChange={handleChange}
              error={!!touched.coupon_title_ar && !!errors.coupon_title_ar}
              helperText={touched.coupon_title_ar && errors.coupon_title_ar}
            />
          </Grid>

          {/* Coupon Code */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Generate code"
              value={values.code}
              name="code"
              onChange={handleChange}
              disabled
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

          {/* Dynamic CouponType Rows */}
          {dynamicCouponTypesRows.map(
            (dynamicCouponTypesRow, couponTypesRowIndex) => (
              <Grid item xs={12} key={couponTypesRowIndex}>
                <Grid container spacing={1}>
                  <Grid item xs={11}>
                    <Box
                      border={1}
                      borderColor="grey.400"
                      borderRadius={2}
                      padding={2}
                    >
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            select
                            fullWidth
                            name="coupon_type"
                            label="Coupon Type"
                            value={dynamicCouponTypesRow.coupon_type}
                            onChange={(e) => {
                              const selectedId = Number(e.target.value);
                              const updatedRows: any =
                                dynamicCouponTypesRows.map((row, i) =>
                                  i === couponTypesRowIndex
                                    ? { ...row, coupon_type: selectedId }
                                    : row
                                );
                              setDynamicCouponTypesRows(updatedRows);

                              const selectedOption: any =
                                COUPON_TYPE_ARRAY.find(
                                  (option: { id: number }) =>
                                    option.id === selectedId
                                );
                              setSelectedCouponType(selectedOption?.type || "");
                              setSelectedCouponTypeId(selectedId);
                              setFieldValue("conditions", {});
                              setTimeout(() => formik.validateForm(), 0);
                            }}
                            error={
                              !!touched.coupon_type && !!errors.coupon_type
                            }
                            helperText={
                              touched.coupon_type && errors.coupon_type
                            }
                          >
                            {couponTypes.map(
                              (option: { id: number; coupon_type: string }) => {
                                const isAlreadySelected =
                                  dynamicCouponTypesRows.some(
                                    (row, index) =>
                                      Number(row.coupon_type) === option.id &&
                                      index !== couponTypesRowIndex
                                  );
                                return (
                                  <MenuItem
                                    key={option.coupon_type}
                                    value={option.id}
                                    disabled={isAlreadySelected}
                                  >
                                    {option.coupon_type}
                                  </MenuItem>
                                );
                              }
                            )}
                          </TextField>
                        </Grid>

                        {dynamicCouponTypesRow.coupon_type !== "" && (
                          <>
                            {dynamicCouponTypesRow.dynamicRows.map(
                              (row: dynamicRows, index) => (
                                <Grid item xs={12} key={index}>
                                  <Box display="flex" gap={1}>
                                    {/* If TIER_BASED Coupon selected */}
                                    {dynamicCouponTypesRow?.selectedCouponType ===
                                      COUPON_TYPE.TIER_BASED && (
                                      <TextField
                                        select
                                        label="Tier"
                                        value={row.tier || ""}
                                        onChange={(e) =>
                                          handleChangeCondition(
                                            dynamicCouponTypesRow.id,
                                            row.id,
                                            "tier",
                                            e.target.value
                                          )
                                        }
                                        sx={{ minWidth: 150 }}
                                      >
                                        {tiers?.map((tier) => (
                                          <MenuItem
                                            key={tier.id}
                                            value={tier.id}
                                          >
                                            {tier.name} (
                                            {tier?.business_unit?.name})
                                          </MenuItem>
                                        ))}
                                      </TextField>
                                    )}

                                    {/* If VEHICLE_SPECIFIC Coupon selected */}
                                    {dynamicCouponTypesRow?.selectedCouponType ===
                                      COUPON_TYPE.VEHICLE_SPECIFIC && (
                                      <>
                                        <TextField
                                          select
                                          label="Make"
                                          value={row.make || ""}
                                          onChange={(e) => {
                                            const makeId = Number(
                                              e.target.value
                                            );
                                            handleChangeCondition(
                                              dynamicCouponTypesRow.id,
                                              row.id,
                                              "make",
                                              makeId
                                            );
                                          }}
                                          sx={{ minWidth: 150 }}
                                        >
                                          {makes?.map((make: Make) => (
                                            <MenuItem
                                              key={make.MakeId}
                                              value={make.MakeId}
                                            >
                                              {make.Make}
                                            </MenuItem>
                                          ))}
                                        </TextField>

                                        <TextField
                                          fullWidth
                                          label="Year"
                                          variant="outlined"
                                          placeholder="Year"
                                          size="medium"
                                          select
                                          value={row.year || ""}
                                          onChange={(e) => {
                                            const selectedYear = Number(
                                              e.target.value
                                            );
                                            fetchModelByMakeId(
                                              row.id,
                                              row?.make || 0,
                                              selectedYear
                                            );
                                            handleChangeCondition(
                                              dynamicCouponTypesRow.id,
                                              row.id,
                                              "year",
                                              selectedYear
                                            );
                                          }}
                                          sx={{ minWidth: 150 }}
                                        >
                                          {getYearsArray().length &&
                                            getYearsArray().map((item: any) => (
                                              <MenuItem key={item} value={item}>
                                                {item}
                                              </MenuItem>
                                            ))}
                                        </TextField>

                                        {row?.models && (
                                          <TextField
                                            select
                                            label="Model"
                                            value={row.model || ""}
                                            onChange={(e) => {
                                              const modelId = Number(
                                                e.target.value
                                              );
                                              fetchVariantByModelId(
                                                row.id,
                                                modelId
                                              );
                                              handleChangeCondition(
                                                dynamicCouponTypesRow.id,
                                                row.id,
                                                "model",
                                                modelId
                                              );
                                            }}
                                            sx={{ minWidth: 150 }}
                                          >
                                            {row?.models?.map(
                                              (model: Model) => (
                                                <MenuItem
                                                  key={model.ModelId}
                                                  value={model.ModelId}
                                                >
                                                  {model.Model}
                                                </MenuItem>
                                              )
                                            )}
                                          </TextField>
                                        )}

                                        {row?.variants && (
                                          <Autocomplete
                                            multiple
                                            options={[
                                              selectAllVariants,
                                              ...(row.variants || []),
                                            ]}
                                            getOptionLabel={(option) =>
                                              option.Trim || ""
                                            }
                                            value={
                                              Array.isArray(row.variant) &&
                                              row.variant.includes("all")
                                                ? [selectAllVariants]
                                                : row.variants?.filter(
                                                    (variant) =>
                                                      (
                                                        row.variant || []
                                                      ).includes(variant.TrimId)
                                                  ) || []
                                            }
                                            onChange={(event, newValue) => {
                                              const isSelectAllSelected =
                                                newValue.some(
                                                  (v) => v.TrimId === "all"
                                                );

                                              let updatedValues;

                                              if (isSelectAllSelected) {
                                                updatedValues = ["all"];
                                              } else {
                                                updatedValues = newValue.map(
                                                  (v) => v.TrimId
                                                );
                                              }

                                              handleChangeCondition(
                                                dynamicCouponTypesRow.id,
                                                row.id,
                                                "variant",
                                                updatedValues
                                              );
                                            }}
                                            isOptionEqualToValue={(
                                              option,
                                              value
                                            ) => option.TrimId === value.TrimId}
                                            renderInput={(params) => (
                                              <TextField
                                                {...params}
                                                label="Variant"
                                                sx={{ minWidth: 150 }}
                                              />
                                            )}
                                          />
                                        )}
                                      </>
                                    )}

                                    {renderServiceTypeName(
                                      dynamicCouponTypesRow?.selectedCouponType,
                                      row,
                                      dynamicCouponTypesRow
                                    )}

                                    {/* {![
                                      COUPON_TYPE.BIRTHDAY,
                                      COUPON_TYPE.PRODUCT_SPECIFIC,
                                      COUPON_TYPE.GEO_TARGETED,
                                    ].includes(
                                      dynamicCouponTypesRow?.selectedCouponType
                                    ) && (
                                      <>
                                        <TextField
                                          select
                                          fullWidth
                                          label="Condition Operator"
                                          value={row.operator}
                                          onChange={(e) =>
                                            handleChangeCondition(
                                              dynamicCouponTypesRow.id,
                                              row.id,
                                              "operator",
                                              e.target.value
                                            )
                                          }
                                        >
                                          <MenuItem value="==">
                                            Equal To (==)
                                          </MenuItem>
                                          <MenuItem value="!=">
                                            Not Equal (!=)
                                          </MenuItem>

                                          {![
                                            COUPON_TYPE.USER_SPECIFIC,
                                          ].includes(
                                            dynamicCouponTypesRow?.selectedCouponType
                                          ) && (
                                            <div>
                                              <MenuItem value=">">
                                                Greater Than (&gt;)
                                              </MenuItem>
                                              <MenuItem value=">=">
                                                Greater Than or Equal (&gt;=)
                                              </MenuItem>
                                              <MenuItem value="<">
                                                Less Than (&lt;)
                                              </MenuItem>
                                              <MenuItem value="<=">
                                                Less Than or Equal (&lt;=)
                                              </MenuItem>
                                            </div>
                                          )}
                                        </TextField>

                                        <TextField
                                          label="Value"
                                          fullWidth
                                          value={row.value}
                                          onChange={(e) =>
                                            handleChangeCondition(
                                              dynamicCouponTypesRow.id,
                                              row.id,
                                              "value",
                                              e.target.value
                                            )
                                          }
                                        />
                                      </>
                                    )} */}

                                    {![
                                      COUPON_TYPE.BIRTHDAY,
                                      COUPON_TYPE.PRODUCT_SPECIFIC,
                                      COUPON_TYPE.GEO_TARGETED,
                                    ].includes(
                                      dynamicCouponTypesRow?.selectedCouponType
                                    ) && (
                                      <>
                                        <TextField
                                          select
                                          fullWidth
                                          label="Condition Operator"
                                          value={row.operator}
                                          onChange={(e) =>
                                            handleChangeCondition(
                                              dynamicCouponTypesRow.id,
                                              row.id,
                                              "operator",
                                              e.target.value
                                            )
                                          }
                                        >
                                          {getOperatorMenuItems(
                                            ![
                                              COUPON_TYPE.USER_SPECIFIC,
                                            ].includes(
                                              dynamicCouponTypesRow?.selectedCouponType
                                            )
                                          )}
                                        </TextField>

                                        <TextField
                                          label="Value"
                                          fullWidth
                                          value={row.value}
                                          onChange={(e) =>
                                            handleChangeCondition(
                                              dynamicCouponTypesRow.id,
                                              row.id,
                                              "value",
                                              e.target.value
                                            )
                                          }
                                        />
                                      </>
                                    )}

                                    {dynamicCouponTypesRow?.selectedCouponType !==
                                      COUPON_TYPE.BIRTHDAY && (
                                      <>
                                        {index === 0 && (
                                          <IconButton
                                            onClick={() =>
                                              handleAdd(
                                                dynamicCouponTypesRow.id
                                              )
                                            }
                                          >
                                            <AddIcon
                                              fontSize="small"
                                              color="primary"
                                            />
                                          </IconButton>
                                        )}

                                        {index >= 1 && (
                                          <IconButton
                                            onClick={() =>
                                              handleDelete(
                                                dynamicCouponTypesRow.id,
                                                row.id
                                              )
                                            }
                                          >
                                            <DeleteIcon
                                              fontSize="small"
                                              color="error"
                                            />
                                          </IconButton>
                                        )}
                                      </>
                                    )}
                                  </Box>
                                </Grid>
                              )
                            )}
                          </>
                        )}
                      </Grid>
                    </Box>
                  </Grid>

                  <Grid item xs={1}>
                    {couponTypesRowIndex === 0 && (
                      <IconButton onClick={handleAddCouponTypeRows}>
                        <AddIcon fontSize="small" color="primary" />
                      </IconButton>
                    )}

                    {couponTypesRowIndex >= 1 && (
                      <IconButton
                        onClick={() =>
                          handleDeleteCouponTypeRows(dynamicCouponTypesRow.id)
                        }
                      >
                        <DeleteIcon fontSize="small" color="error" />
                      </IconButton>
                    )}
                  </Grid>
                </Grid>
              </Grid>
            )
          )}

          {selectedCouponType !== COUPON_TYPE.TIER_BASED && (
            <>
              {/* Discount Type */}
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  name="discount_type"
                  label="Discount Type"
                  value={values.discount_type}
                  onChange={handleChange}
                  error={!!touched.discount_type && !!errors.discount_type}
                  helperText={touched.discount_type && errors.discount_type}
                >
                  {discountTypes?.map((eachDiscountType) => (
                    <MenuItem
                      key={eachDiscountType.value}
                      value={eachDiscountType.value}
                    >
                      {eachDiscountType.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="discount_price"
                  label="Discount Amount"
                  type="number"
                  inputProps={{ min: 0 }}
                  value={values.discount_price}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: selectedCouponType ? (
                      <InputAdornment position="end">
                        <Tooltip
                          title={
                            tooltipMessages.discountPrice[selectedCouponType] ||
                            ""
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

          {/* Usage Limit */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="usage_limit"
              label="Usage Limit"
              placeholder="Usage Limit"
              type="number"
              inputProps={{ min: 1 }}
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
              error={!!touched.business_unit_ids && !!errors.business_unit_ids}
              helperText={touched.business_unit_ids && errors.business_unit_ids}
            >
              {businessUnits?.map((bu) => (
                <MenuItem key={bu.id} value={bu.id}>
                  {bu.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Customer Segments */}
          <Grid item xs={12}>
            <Autocomplete
              multiple
              options={segments}
              getOptionLabel={(option: any) => option.name}
              value={segments.filter((s: any) =>
                values.customer_segment_ids.includes(s.id)
              )}
              onChange={(event, newValue) => {
                setFieldValue(
                  "customer_segment_ids",
                  newValue.map((item: any) => item.id)
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Customer Segments"
                  error={Boolean(
                    touched.customer_segment_ids && errors.customer_segment_ids
                  )}
                  helperText={
                    touched.customer_segment_ids && errors.customer_segment_ids
                      ? errors.customer_segment_ids
                      : ""
                  }
                />
              )}
            />
          </Grid>

          {/* Max Usage Per User */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              variant="outlined"
              label="Max Usage Per User"
              value={values.max_usage_per_user}
              type="number"
              inputProps={{ min: 0 }}
              name="max_usage_per_user"
              onChange={handleChange}
              error={
                !!touched.max_usage_per_user && !!errors.max_usage_per_user
              }
              helperText={
                touched.max_usage_per_user && errors.max_usage_per_user
              }
            />
          </Grid>

          {/* Reuse Interval (in days) */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              variant="outlined"
              label="Reuse Interval (in days)"
              value={values.reuse_interval}
              type="number"
              inputProps={{ min: 0 }}
              name="reuse_interval"
              onChange={handleChange}
              error={!!touched.reuse_interval && !!errors.reuse_interval}
              helperText={touched.reuse_interval && errors.reuse_interval}
            />
          </Grid>

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

          {/* Validity for user After Assigned */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              variant="outlined"
              label="Valid for (Days) After Assigned to User"
              value={values.validity_after_assignment}
              type="number"
              inputProps={{ min: 0 }}
              name="validity_after_assignment"
              onChange={handleChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={tooltipMessagesValidityAfterAssignment}>
                      <IconButton edge="end">
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
              error={
                !!touched.validity_after_assignment &&
                !!errors.validity_after_assignment
              }
              helperText={
                touched.validity_after_assignment &&
                errors.validity_after_assignment
              }
            />
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
              onBlur={(e) =>
                handleArabictranslate(
                  "general_error_message_ar",
                  e.target.value
                )
              }
              error={
                !!touched.general_error_message_en &&
                !!errors.general_error_message_en
              }
              helperText={
                touched.general_error_message_en &&
                errors.general_error_message_en
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {translationLoading["general_error_message_ar"] && (
                      <CircularProgress size={20} />
                    )}
                  </InputAdornment>
                ),
              }}
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
              onBlur={(e) =>
                handleArabictranslate(
                  "exception_error_message_ar",
                  e.target.value
                )
              }
              error={
                !!touched.exception_error_message_en &&
                !!errors.exception_error_message_en
              }
              helperText={
                touched.exception_error_message_en &&
                errors.exception_error_message_en
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {translationLoading["exception_error_message_ar"] && (
                      <CircularProgress size={20} />
                    )}
                  </InputAdornment>
                ),
              }}
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

          {/* Benefits */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Benefits (optional)
            </Typography>

            {benefitsInputs.map((input, index) => (
              <Box display="flex" gap={1} key={index + 1} mb={2}>
                <TextField
                  fullWidth
                  name="benefits"
                  label={`Benefit ${index + 1}`}
                  value={input}
                  onChange={(e) => {
                    const newInputs = [...benefitsInputs];
                    newInputs[index] = e.target.value;
                    setBenefitsInputs(newInputs);
                  }}
                />
                {index === 0 ? (
                  <IconButton onClick={addBenefitInput}>
                    <AddIcon fontSize="small" color="primary" />
                  </IconButton>
                ) : (
                  <IconButton>
                    <DeleteIcon
                      fontSize="small"
                      color="error"
                      onClick={() => {
                        setBenefitsInputs(
                          benefitsInputs.filter((_, i) => i !== index)
                        );
                      }}
                    />
                  </IconButton>
                )}
              </Box>
            ))}
            {/* <RichTextEditor
              value={benefits}
              setValue={setBenefits}
              language="en"
            /> */}
          </Grid>

          {/* is_point_earning_disabled */}
          <Grid item xs={12}>
            <FormControlLabel
              control={<Checkbox />}
              label="Customers cannot earn points when using this coupon."
              labelPlacement="end"
              name="is_point_earning_disabled"
              onChange={(e: any) =>
                formik.setFieldValue(
                  "is_point_earning_disabled",
                  e.target.checked ? 1 : 0
                )
              }
              checked={formik.values.is_point_earning_disabled === 1}
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

          {/* Description English */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Description (English)
            </Typography>
            <TextField
              label="Description English"
              variant="outlined"
              name="description_en"
              value={values.description_en}
              onChange={handleChange}
              onBlur={(e) =>
                handleArabictranslate("description_ar", e.target.value)
              }
              fullWidth
              multiline
              rows={4}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {translationLoading["description_ar"] && (
                      <CircularProgress size={20} />
                    )}
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Description Arabic */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Description (Arabic)
            </Typography>
            <TextField
              label="Description Arabic"
              variant="outlined"
              name="description_ar"
              value={values.description_ar}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
            />
          </Grid>

          {/* Terms And Conditions English*/}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Terms And Conditions (English)
            </Typography>
            <RichTextEditor
              value={termsAndConditionsEn}
              setValue={setTermsAndConditionsEn}
              language="en"
              height={250}
              onBlur={() =>
                handleArabictranslate(
                  "termsAndConditionsAr",
                  termsAndConditionsEn,
                  true
                )
              }
              translationLoading={translationLoading["termsAndConditionsAr"]}
            />
          </Grid>

          {/* Terms And Conditions Arabic*/}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Terms And Conditions (Arabic)
            </Typography>
            <RichTextEditor
              value={termsAndConditionsAr}
              setValue={setTermsAndConditionsAr}
              language="en"
              height={250}
            />
          </Grid>

          <Grid item xs={12}>
            <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
              <Button
                variant="outlined"
                color="primary"
                type="submit"
                disabled={loading}
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
              >
                {loading ? <CircularProgress size={24} /> : "Create Coupon"}
              </Button>
            </Box>
          </Grid>
          <br />
          <br />
        </Grid>
      </form>
    </>
  );
};

export default CreateCouponForm;
