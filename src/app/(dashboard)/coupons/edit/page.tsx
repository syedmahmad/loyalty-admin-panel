"use client";

import { RichTextEditor } from "@/components/TextEditor";
import {
  COUPON_TYPE,
  COUPON_TYPE_ARRAY,
  tooltipMessages,
  tooltipMessagesValidityAfterAssignment,
} from "@/constants/constants";
import { GET, POST, PUT } from "@/utils/AxiosUtility";
import { generateRandomCode, getYearsArray } from "@/utils/Index";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  Autocomplete,
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
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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

const generateId = () => Date.now() + Math.floor(Math.random() * 1000);
const selectAllVariants = { TrimId: "all", Trim: "Select All" };

const EditCouponForm = ({
  onSuccess,
  handleDrawerWidth,
}: {
  onSuccess: () => void;
  handleDrawerWidth: (selectedCouponType: string) => void;
}) => {
  const searchParams = useSearchParams();
  const paramId = searchParams.get("id");
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [variants, setVariants] = useState([]);
  const [selectedId, setSelectedId] = useState<string>(paramId || "");
  const [couponData, setCouponData] = useState<any>(null);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [benefits, setBenefits] = useState<string>("");
  const [couponTypes, setCouponTypes] = useState([]);
  const [selectedCouponType, setSelectedCouponType] = useState("");
  const [selectedCouponTypeId, setSelectedCouponTypeId] = useState<number>();

  const [conditionOfCouponTypes, setConditionOfCouponTypes] = useState<
    { name: string }[]
  >([]);
  const [dynamicRows, setDynamicRows] = useState([
    {
      id: generateId(),
      type: "",
      operator: "",
      value: "",
      models: [],
      variants: [],
    },
  ]);

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

  const userId =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("client-info") || "{}")?.id ?? 0
      : 0;

  useEffect(() => {
    const clientInfo = JSON.parse(localStorage.getItem("client-info")!);
    const resolveAllPromises = async () => {
      const fetchTiersAndBUs = async (name: string = "") => {
        const [tierListRes, buRes, couponTypesRes, makeRes] = await Promise.all(
          [
            GET(`/tiers/${clientInfo.id}?name=${encodeURIComponent(name)}`),
            GET(
              `/business-units/${clientInfo.id}?name=${encodeURIComponent(
                name
              )}`
            ),
            GET("/coupon-types"),
            GET(`/coupons/vehicle/makes`),
          ]
        );
        setTiers(tierListRes?.data.tiers || []);
        setBusinessUnits(buRes?.data || []);
        setCouponTypes(couponTypesRes?.data.couponTypes || []);
        setMakes(makeRes?.data?.data || []);

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

    // if (couponData?.conditions?.length > 0) {
    //   prefillRows(couponData?.conditions);
    // }
  }, [couponData?.coupon_type_id]);

  useEffect(() => {
    // If complex Coupon
    if (couponData?.complex_coupon) {
      const fetchPrefilledRows = async () => {
        const updatedCoupons = await Promise.all(
          couponData.complex_coupon.map(async (coupon: any) => {
            let prefillDynamicRows;
            if (coupon.selectedCouponType === COUPON_TYPE.VEHICLE_SPECIFIC) {
              setSelectedCouponTypeId(coupon?.coupon_type);
              prefillDynamicRows = await prefillRows(coupon?.dynamicRows);
            }
            const selectedCouponTypeInfo: any = couponTypes.find(
              (type: any) => type.id === coupon.coupon_type
            );

            const newUpdatedDynamicRows = {
              ...coupon,
              conditionOfCouponTypes: selectedCouponTypeInfo?.conditions || [],
            };

            if (prefillDynamicRows) {
              newUpdatedDynamicRows["dynamicRows"] = prefillDynamicRows;
            }

            return newUpdatedDynamicRows;
          })
        );

        setDynamicCouponTypesRows(updatedCoupons);
      };
      fetchPrefilledRows();
    }

    // If simple Coupon
    if (couponData?.coupon_type_id) {
      setSelectedCouponTypeId(couponData?.coupon_type_id);
      const selectedCouponTypeInfo: any = couponTypes.find(
        (singleCouponType: any) => {
          if (singleCouponType.id === couponData?.coupon_type_id) {
            return singleCouponType;
          }
        }
      );

      const fetchPrefilledRows = async () => {
        const prefillDynamicRows = await prefillRows(couponData?.conditions);

        setDynamicCouponTypesRows((prev) =>
          prev.map((row) => {
            return {
              ...row,
              coupon_type: couponData?.coupon_type_id,
              conditionOfCouponTypes: selectedCouponTypeInfo?.conditions || [],
              dynamicRows: prefillDynamicRows
                ? prefillDynamicRows
                : couponData?.conditions,
              selectedCouponType: selectedCouponType,
            };
          })
        );
      };

      fetchPrefilledRows();
    }
  }, [couponData]);

  useEffect(() => {
    if (selectedCouponTypeId) {
      const selectedCouponTypeInfo: any = couponTypes.find(
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
                  selectedCouponTypeInfo?.conditions || [],
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

  const prefillRows = async (rowsFromApi: any[]) => {
    setLoading(true);
    const filledRows = await Promise.all(
      rowsFromApi?.map(async (row) => {
        let modelsRes;
        let variantsRes;

        if (row.make != null) {
          modelsRes = await GET(
            `/coupons/vehicle/models?makeId=${row.make}&year=${row.year}`
          );
        }

        if (row.model != null) {
          variantsRes = await GET(`/coupons/vehicle/variants/${row.model}`);
        }

        return {
          ...row,
          models: modelsRes?.data?.data || [],
          variants: variantsRes?.data?.data || [],
        };
      })
    );
    setLoading(false);
    return filledRows;
  };

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

  const formik = useFormik<CouponFormValues>({
    initialValues: {
      coupon_title: couponData?.coupon_title || "",
      code: couponData?.code || "",
      coupon_type: couponData?.coupon_type_id || "",
      discount_percentage: couponData?.discount_percentage || 0,
      discount_price: couponData?.discount_price || 0,
      usage_limit: couponData?.usage_limit || 1,
      business_unit_ids: couponData?.business_unit_id
        ? [couponData.business_unit_id]
        : [],
      once_per_customer: couponData?.once_per_customer || 0,
      max_usage_per_user: couponData?.max_usage_per_user || 1,
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
      validity_after_assignment: couponData?.validity_after_assignment || 0,
      status: couponData?.status,
    },
    validationSchema: Yup.object({
      coupon_title: Yup.string().required("Coupon title is required"),
      code: Yup.string().required("Code is required"),
      // coupon_type: Yup.string().required("Coupon type is required"),
      discount_percentage: Yup.number()
        .typeError("Discount percentage must be a number")
        .min(0, "Discount percentage cannot be negative"),

      discount_price: Yup.number()
        .typeError("Discount price must be a number")
        .min(0, "Discount price cannot be negative"),
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
    handleDrawerWidth(selectedCouponConditionNames?.coupon_type);
  }, [values.coupon_type]);

  const handleSubmit = async (values: CouponFormValues) => {
    const condtionsArr =
      dynamicCouponTypesRows.length > 1
        ? null
        : dynamicCouponTypesRows[0].dynamicRows.map(
            ({ models, variants, ...rest }) => rest
          );

    const complexCouponArr =
      dynamicCouponTypesRows.length > 1
        ? dynamicCouponTypesRows.map(({ dynamicRows, ...rest }) => ({
            ...rest,
            dynamicRows: dynamicRows.map(
              ({ models, variants, ...cleanedRow }) => cleanedRow
            ),
          }))
        : null;

    const coupon_type_id =
      dynamicCouponTypesRows.length > 1
        ? null
        : dynamicCouponTypesRows[0].coupon_type;

    const payloads = values.business_unit_ids.map((buId: number) => ({
      coupon_title: values.coupon_title,
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
      discount_percentage: values.discount_percentage || 0,
      discount_price: values.discount_price || 0,
      // once_per_customer: values.once_per_customer,
      max_usage_per_user: values.max_usage_per_user || 1,
      reuse_interval: values.reuse_interval,
      usage_limit: values.usage_limit,
      business_unit_id: buId,
      date_from: values.date_from,
      date_to: values.date_to,
      validity_after_assignment: values.validity_after_assignment || 0,
      status: values.status,
      benefits: benefits || "",
      updated_by: userId,
      tenant_id: userId,
      created_by: userId,
    }));

    const responses = await Promise.all(
      payloads.map(async (payload) => {
        if (payload.business_unit_id === couponData.business_unit_id) {
          const res = await PUT(`/coupons/${selectedId}`, payload);
          return { success: true, status: res?.status };
        } else {
          const res = await POST(`/coupons`, payload);
          return { success: true, status: res?.status };
        }
      })
    );

    const anyFailed = !responses.some(
      (res) => res.status === 201 || res.status === 200
    );

    if (anyFailed) {
      setLoading(false);
      toast.error("failed to update coupon");
    } else {
      toast.success("coupons updated successfully!");
      setBenefits("");
      setLoading(false);
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

  return (
    <>
      {couponData && (
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>
            {/* Coupon Title */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                variant="outlined"
                label="Coupon Title"
                value={values.coupon_title}
                name="coupon_title"
                onChange={handleChange}
                error={!!touched.coupon_title && !!errors.coupon_title}
                helperText={touched.coupon_title && errors.coupon_title}
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
                  <Grid container spacing={2}>
                    {loading ? (
                      <CircularProgress size={24} />
                    ) : (
                      <>
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
                                    setSelectedCouponType(
                                      selectedOption?.type || ""
                                    );
                                    setSelectedCouponTypeId(selectedId);
                                    setFieldValue("conditions", {});
                                    setTimeout(() => formik.validateForm(), 0);
                                  }}
                                  error={
                                    !!touched.coupon_type &&
                                    !!errors.coupon_type
                                  }
                                  helperText={
                                    touched.coupon_type && errors.coupon_type
                                  }
                                >
                                  {couponTypes.map(
                                    (option: {
                                      id: number;
                                      coupon_type: string;
                                    }) => (
                                      <MenuItem
                                        key={option.coupon_type}
                                        value={option.id}
                                      >
                                        {option.coupon_type}
                                      </MenuItem>
                                    )
                                  )}
                                </TextField>
                              </Grid>

                              {dynamicCouponTypesRow.coupon_type !== "" && (
                                <>
                                  {dynamicCouponTypesRow.dynamicRows.map(
                                    (row: dynamicRows, index) => (
                                      <Grid item xs={12} key={index}>
                                        <Box display="flex" gap={1}>
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
                                                  getYearsArray().map(
                                                    (item: any) => (
                                                      <MenuItem
                                                        key={item}
                                                        value={item}
                                                      >
                                                        {item}
                                                      </MenuItem>
                                                    )
                                                  )}
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
                                                    Array.isArray(
                                                      row.variant
                                                    ) &&
                                                    row.variant.includes("all")
                                                      ? [selectAllVariants]
                                                      : row.variants?.filter(
                                                          (variant) =>
                                                            (
                                                              row.variant || []
                                                            ).includes(
                                                              variant.TrimId
                                                            )
                                                        ) || []
                                                  }
                                                  onChange={(
                                                    event,
                                                    newValue
                                                  ) => {
                                                    const isSelectAllSelected =
                                                      newValue.some(
                                                        (v) =>
                                                          v.TrimId === "all"
                                                      );

                                                    let updatedValues;

                                                    if (isSelectAllSelected) {
                                                      updatedValues = ["all"];
                                                    } else {
                                                      updatedValues =
                                                        newValue.map(
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
                                                  ) =>
                                                    option.TrimId ===
                                                    value.TrimId
                                                  }
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
                                                <MenuItem value="==">
                                                  Equal To (==)
                                                </MenuItem>
                                                <MenuItem value="!=">
                                                  Not Equal (!=)
                                                </MenuItem>
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
                                handleDeleteCouponTypeRows(
                                  dynamicCouponTypesRow.id
                                )
                              }
                            >
                              <DeleteIcon fontSize="small" color="error" />
                            </IconButton>
                          )}
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Grid>
              )
            )}

            {selectedCouponType !== COUPON_TYPE.TIER_BASED && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="discount_percentage"
                    label="Discount (%)"
                    type="number"
                    inputProps={{ min: 0 }}
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
                    inputProps={{ min: 0 }}
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

            {/* Max Usage Per User */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                variant="outlined"
                label="Max Usage Per User"
                value={values.max_usage_per_user}
                type="number"
                inputProps={{ min: 1 }}
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

            {/* Reuse Interval */}
            {/* {Boolean(values.once_per_customer) && ( */}
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
            {/* )} */}

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

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Benefits (optional)
              </Typography>
              <RichTextEditor
                value={benefits}
                setValue={setBenefits}
                language="en"
              />
            </Grid>

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
