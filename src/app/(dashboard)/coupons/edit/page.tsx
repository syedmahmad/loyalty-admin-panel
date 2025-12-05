"use client";

import { RichTextEditor } from "@/components/TextEditor";
import {
  COUPON_TYPE,
  COUPON_TYPE_ARRAY,
  discountTypes,
  MAX_USAGE_PER_USER,
  tooltipMessageReuseInterval,
  tooltipMessages,
  tooltipMessagesValidityAfterAssignment,
  tooltipMessageUsageLimit,
  USAGE_LIMIT,
} from "@/constants/constants";
import { openAIService } from "@/services/openAiService";
import { tenantService } from "@/services/tenantService";
import { Language } from "@/types/language.type";
import { UploadingState } from "@/types/offer.type";
import { GET, POST, PUT } from "@/utils/AxiosUtility";
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
type Benefit = {
  name_en: string;
  name_ar: string;
  icon: string;
};

const EditCouponForm = ({ onSuccess, handleDrawerWidth }: any) => {
  const searchParams = useSearchParams();
  const paramId = searchParams.get("id");
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [makes, setMakes] = useState([]);
  const [selectedId, setSelectedId] = useState<string>(paramId || "");
  const [couponData, setCouponData] = useState<any>(null);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [couponTypes, setCouponTypes] = useState([]);
  const [selectedCouponType, setSelectedCouponType] = useState("");
  const [selectedCouponTypeId, setSelectedCouponTypeId] = useState<number>();
  const [segments, setSegments] = useState([]);
  const [translationLoading, setTranslationLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [languages, setLanguages] = useState<Language[]>([]);
  const [couponLocales, setCouponLocales] = useState<any>([]);

  /** multiple benefits with icon */
  const [benefitsInputs, setBenefitsInputs] = useState<Benefit[]>([
    { name_en: "", name_ar: "", icon: "" },
  ]);
  const [file, setFile] = useState<File | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  /** images for Desktop and mobile start */
  const [images, setImages] = useState({
    desktop: { en: "", ar: "" },
    mobile: { en: "", ar: "" },
  });

  const [uploading, setUploading] = useState<UploadingState>({
    desktop: {},
    mobile: {},
  });
  /** images for Desktop and mobile end*/

  const fetchCustomerSegments = async () => {
    const clientInfo = JSON.parse(localStorage.getItem("client-info")!);
    const res = await GET(`/customer-segments/${clientInfo.id}`);
    setSegments(res?.data.data || []);
  };

  const [conditionOfCouponTypes, setConditionOfCouponTypes] = useState<
    { name: string }[]
  >([]);

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
        fetchCustomerSegments();

        if (paramId) {
          await fetchCouponById(paramId);
        }

        setInitializing(false);
      };

      await Promise.all([fetchTiersAndBUs()]);
    };
    resolveAllPromises();

    const getLanguages = async () => {
      try {
        const languageResponse = await tenantService.getTenantById();
        const allLanguages =
          languageResponse?.languages?.map((cl: any) => cl?.language) || [];

        const english = allLanguages.find(
          (lang: { code: string }) => lang.code === "en"
        );

        const others = allLanguages.filter(
          (lang: { code: string }) => lang.code !== "en"
        );
        const englishFirst = english ? [english, ...others] : allLanguages;
        setLanguages(englishFirst);
      } catch (error) {
        console.error("Error fetching country language:", error);
      }
    };
    getLanguages();
  }, [paramId]);

  useEffect(() => {
    const selectedOption: any = COUPON_TYPE_ARRAY.find(
      (option: { id: number }) => option.id === couponData?.coupon_type_id
    );
    setSelectedCouponType(selectedOption?.type || "");
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
        /** For Birthday check */
        // const prefillDynamicRows = await prefillRows(couponData?.conditions);
        const dbCouponConditions = couponData?.conditions
          ? couponData?.conditions
          : [];

        const selectedOption: any = COUPON_TYPE_ARRAY.find(
          (option: { id: number }) => option.id === couponData?.coupon_type_id
        );
        const selectedType = selectedOption?.type || "";

        const prefillDynamicRows = await prefillRows(dbCouponConditions);
        setDynamicCouponTypesRows((prev) =>
          prev.map((row) => {
            return {
              ...row,
              coupon_type: couponData?.coupon_type_id,
              conditionOfCouponTypes: selectedCouponTypeInfo?.conditions || [],
              dynamicRows: prefillDynamicRows
                ? prefillDynamicRows
                : couponData?.conditions,
              selectedCouponType: selectedType,
            };
          })
        );
      };

      fetchPrefilledRows();
    }

    // if this coupon imported from external system
    if (couponData?.external_system_id) {
      console.log("external_system_id", dynamicCouponTypesRows, couponData);
      setSelectedCouponTypeId(10); // value 10 FOR couponTypes = DISCOUNT
      const selectedCouponTypeInfo: any = couponTypes.find(
        (singleCouponType: any) => {
          if (singleCouponType.id === 10) {
            return singleCouponType;
          }
        }
      );

      setDynamicCouponTypesRows((prev) =>
        prev.map((row) => {
          return {
            ...row,
            coupon_type: "10", // value 10 FOR couponTypes = DISCOUNT
            conditionOfCouponTypes: selectedCouponTypeInfo?.conditions || [],
            dynamicRows: [
              {
                id: generateId(),
                type: "Total Purchase Amount",
                operator: ">=",
                value: couponData?.min_transaction_amount || 0,
                model_name: "",
                make_name: "",
                variant_names: [],
                models: [],
                variants: [],
              },
            ],
            selectedCouponType: COUPON_TYPE.DISCOUNT,
          };
        })
      );
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
        let model_name = "";
        let variant_names = [];

        const make_name =
          (makes as { MakeCode: string; Make: string }[])?.find(
            (singleMake) => singleMake.MakeCode === row.make
          )?.Make ?? "";

        if (row.make != null) {
          modelsRes = await GET(
            `/coupons/vehicle/models?makeId=${row.make}&year=${row.year}`
          );

          if (modelsRes?.data?.data.length) {
            const foundModel = modelsRes?.data?.data.find(
              (singleModel: any) => singleModel.ModelId == row.model
            );
            model_name = foundModel?.Model ?? "";
          }
        }

        if (row.model != null) {
          variantsRes = await GET(`/coupons/vehicle/variants/${row.model}`);

          const variantIds = Array.isArray(row.variant)
            ? row.variant
            : [row.variant];

          variant_names = variantsRes?.data?.data
            .filter((variant: { TrimId: string; Trim: string }) =>
              variantIds.includes(variant.TrimId)
            )
            .map((variant: { TrimId: string; Trim: string }) => variant.Trim);
        }

        return {
          ...row,
          model_name: model_name || "",
          make_name: make_name || "",
          variant_names: variant_names || [],
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

    const couponLocales: any = {};
    let benefitFromLocale: any = [];
    res.data.locales.forEach((locale: any) => {
      const langId = locale.language?.id;
      if (langId) {
        couponLocales[langId] = {
          title: locale.title || "",
          description: locale.description || "",
          term_and_condition: locale.term_and_condition || "",
          desktop_image: locale.desktop_image || "",
          mobile_image: locale.mobile_image || "",
          benefits: locale.benefits || [],
          general_error: locale.general_error,
          exception_error: locale.exception_error,
        };
      }
      if (locale?.benefits?.length) {
        benefitFromLocale = locale?.benefits;
      }
    });

    setSelectedId(id);
    setCouponData({
      ...res.data,
      couponBasicInfo: { localesObj: couponLocales },
    });
    setCouponLocales(res?.data?.locales);
    setBenefitsInputs(benefitFromLocale);
    setImages(res?.data?.images);
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
      code: couponData?.code || "",
      coupon_type: couponData?.coupon_type_id || "",
      discount_type: couponData?.discount_type || "fixed_discount",
      discount_price: couponData?.discount_price || 0,
      upto_amount: couponData?.upto_amount || 0,
      usage_limit: couponData?.usage_limit || 1,
      business_unit_ids: couponData?.business_unit_id
        ? [couponData.business_unit_id]
        : [],
      once_per_customer: couponData?.once_per_customer || 0,
      max_usage_per_user: couponData?.max_usage_per_user || 0,
      reuse_interval: couponData?.reuse_interval || 0,
      conditions: couponData?.conditions || {},
      date_from:
        DateTime.fromISO(couponData?.date_from).toFormat("yyyy-MM-dd") || "",
      date_to:
        DateTime.fromISO(couponData?.date_to).toFormat("yyyy-MM-dd") || "",
      validity_after_assignment: couponData?.validity_after_assignment || "",
      is_point_earning_disabled: couponData?.is_point_earning_disabled,
      status: couponData?.status,
      customer_segment_ids:
        couponData?.customerSegments.map((ls: any) => ls.segment.id) || [],
      all_users: couponData?.all_users,
      couponBasicInfo: {
        locales: { ...couponData?.couponBasicInfo?.localesObj },
      },
    },
    validationSchema: Yup.object({
      couponBasicInfo: Yup.object().shape({
        locales: Yup.object().shape(
          Object.fromEntries(
            languages.map((lang) => [
              lang.id,
              Yup.object().shape({
                title: Yup.string().required(
                  `Coupon title (${lang.name}) is required`
                ),
              }),
            ])
          )
        ),
      }),
      code: Yup.string().required("Code is required"),
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
    /** Simple Coupon Old */
    /*const condtionsArr =
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

      case "VEHICLE_SPECIFIC": {
        const prefillDynamicRows = await prefillRows(
          dynamicCouponTypesRows[0]?.dynamicRows
        );
        condtionsArr =
          dynamicCouponTypesRows.length > 1
            ? null
            : prefillDynamicRows.map(({ models, variants, ...rest }) => rest);
        break;
      }

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
    // const complexCouponArr =
    //   dynamicCouponTypesRows.length > 1
    //     ? dynamicCouponTypesRows.map(({ dynamicRows, ...rest }) => ({
    //         ...rest,
    //         dynamicRows: dynamicRows.map(
    //           ({ models, variants, ...cleanedRow }) => cleanedRow
    //         ),
    //       }))
    //     : null;

    /** Complex Coupon New */
    // console.log("complexCouponArr:::", complexCouponArr);
    const complexCouponArr =
      dynamicCouponTypesRows.length > 1
        ? await Promise.all(
            dynamicCouponTypesRows.map(async (row) => {
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

                case "VEHICLE_SPECIFIC": {
                  const prefillDynamicRows = await prefillRows(row.dynamicRows);
                  return { ...row, dynamicRows: prefillDynamicRows };
                }

                default:
                  return {
                    ...row,
                    dynamicRows: row.dynamicRows.map(
                      ({ models, variants, ...rest }) => rest
                    ),
                  };
              }
            })
          )
        : null;

    const coupon_type_id =
      dynamicCouponTypesRows.length > 1
        ? null
        : dynamicCouponTypesRows[0].coupon_type;

    const payloads = values.business_unit_ids.map((buId: number) => ({
      code: values.code,
      // coupon_type_id: values.coupon_type,
      // conditions: dynamicRows.map(({ models, variants, ...rest }) => rest),
      coupon_type_id: coupon_type_id,
      complex_coupon: complexCouponArr,
      conditions: condtionsArr,
      discount_type: values.discount_type,
      discount_price: values.discount_price || 0,
      upto_amount: values.upto_amount || 0,
      // once_per_customer: values.once_per_customer,
      max_usage_per_user: values.max_usage_per_user || 0,
      reuse_interval: values.reuse_interval,
      usage_limit: values.usage_limit,
      business_unit_id: buId,
      date_from: values.date_from,
      date_to: values.date_to,
      validity_after_assignment: !values.validity_after_assignment
        ? null
        : values.validity_after_assignment,
      is_point_earning_disabled: values.is_point_earning_disabled || 0,
      status: values.status,
      updated_by: userId,
      tenant_id: userId,
      created_by: userId,
      customer_segment_ids: values.customer_segment_ids,
      all_users: values.all_users,
      images: images,
      locales: Object.entries(values.couponBasicInfo.locales).map(
        ([languageId, localization]) => ({
          id: couponLocales.find((loc: any) => loc?.language.id === languageId)
            ?.id,
          languageId,
          title: localization.title,
          description: localization.description,
          term_and_condition: localization.term_and_condition,
          desktop_image: localization.desktop_image,
          mobile_image: localization.mobile_image,
          benefits: localization.benefits,
          general_error: localization.general_error,
          exception_error: localization.exception_error,
        })
      ),
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
      case COUPON_TYPE.TIER_BASED:
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
    setBenefitsInputs([
      ...benefitsInputs,
      { name_en: "", name_ar: "", icon: "" },
    ]);
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    const formData = new FormData();
    formData.append("file", selectedFile);
    try {
      setUploadingIndex(index);
      const res = await POST("/tiers/file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res?.data.success) {
        setBenefitsInputs((prev) =>
          prev.map((item, i) =>
            i === index ? { ...item, icon: res?.data.uploaded_url } : item
          )
        );
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploadingIndex(null); // stop loader
    }
  };

  const uploadImageToBucket = async (
    e: React.ChangeEvent<HTMLInputElement>,
    device: "desktop" | "mobile",
    langId: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_SIZE) {
      toast.error("File size should not exceed 5 MB");
      return;
    }

    setUploading((prev) => ({
      ...prev,
      [device]: { ...prev[device], [langId]: true },
    }));

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await POST("/coupons/upload-image-to-bucket", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res?.data.success) {
        setFieldValue(
          `couponBasicInfo.locales.${langId}.${device}_image`,
          res.data.uploaded_url
        );
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading((prev) => ({
        ...prev,
        [device]: { ...prev[device], [langId]: false },
      }));
    }
  };

  const handleTranslateText = async (
    targetLang: string,
    englishText: string
  ): Promise<string> => {
    try {
      setTranslationLoading((prev) => ({ ...prev, [targetLang]: true }));

      const payload = {
        text: englishText,
        targetLanguage: [targetLang],
        sourceLanguage: "en",
      };

      const response = await openAIService.translateText(payload);
      return response.translatedText?.[targetLang] || "";
    } catch (error) {
      console.error(`Translation failed for ${targetLang}:`, error);
      return "";
    } finally {
      setTranslationLoading((prev) => ({ ...prev, [targetLang]: false }));
    }
  };

  return (
    <>
      {couponData && (
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>
            {/* Coupon Title */}
            {languages.length > 0 &&
              languages.map((singleLanguage: Language, index) => {
                const langId = singleLanguage.id;
                const langCode = singleLanguage.code;
                const fieldName = `couponBasicInfo.locales.${langId}.title`;

                return (
                  <Grid item xs={12} key={index}>
                    <TextField
                      fullWidth
                      name={fieldName}
                      label={`Coupon title (${singleLanguage.name})`}
                      value={
                        values.couponBasicInfo.locales[langId]?.title || ""
                      }
                      onChange={handleChange}
                      error={Boolean(
                        errors.couponBasicInfo?.locales?.[langId]?.title
                      )}
                      helperText={
                        errors.couponBasicInfo?.locales?.[langId]?.title
                          ? String(errors.couponBasicInfo.locales[langId].title)
                          : ""
                      }
                      onBlur={async (e) => {
                        if (langCode === "en") {
                          const englishText = e.target.value;
                          if (!englishText.trim()) return;

                          for (const lang of languages) {
                            const targetLangId = lang?.id;
                            const targetLang = lang?.code;
                            if (targetLang !== "en") {
                              try {
                                setTranslationLoading((prev) => ({
                                  ...prev,
                                  [`title_${targetLang}`]: true,
                                }));

                                const translatedText =
                                  await handleTranslateText(
                                    targetLang,
                                    englishText
                                  );
                                setFieldValue(
                                  `couponBasicInfo.locales.${targetLangId}.title`,
                                  translatedText
                                );
                              } catch (err) {
                                console.error(
                                  `Translation failed for ${targetLang}`,
                                  err
                                );
                              } finally {
                                setTranslationLoading((prev) => ({
                                  ...prev,
                                  [`title_${targetLang}`]: false,
                                }));
                              }
                            }
                          }
                        }
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            {translationLoading[`title_${langCode}`] && (
                              <CircularProgress size={20} />
                            )}
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                );
              })}

            {/* Coupon Code */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Generate code"
                value={values.code}
                name="code"
                disabled
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
                        disabled
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
                                    }) => {
                                      const isAlreadySelected =
                                        dynamicCouponTypesRows.some(
                                          (row, index) =>
                                            Number(row.coupon_type) ===
                                              option.id &&
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
                                              sx={{ minWidth: "95%" }}
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
                                            COUPON_TYPE.TIER_BASED,
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

            {/* Discount Type */}
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                name="discount_type"
                label="Discount Type"
                value={values?.discount_type}
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

            {/*  Discount Amount */}
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

            {/* Up to Amount */}
            {values.discount_type === "percentage" && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="upto_amount"
                  label="Up to Amount"
                  type="number"
                  inputProps={{ min: 0 }}
                  value={values.upto_amount}
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
                  error={!!touched.upto_amount && !!errors.upto_amount}
                  helperText={touched.upto_amount && errors.upto_amount}
                />
              </Grid>
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
                InputProps={{
                  endAdornment: selectedCouponType ? (
                    <InputAdornment position="end">
                      <Tooltip title={tooltipMessageUsageLimit || ""}>
                        <IconButton edge="end">
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ) : null,
                }}
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
                inputProps={{ min: 0 }}
                name="max_usage_per_user"
                onChange={handleChange}
                InputProps={{
                  endAdornment: selectedCouponType ? (
                    <InputAdornment position="end">
                      <Tooltip title={MAX_USAGE_PER_USER || ""}>
                        <IconButton edge="end">
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ) : null,
                }}
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
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="start">
                      <Tooltip title={tooltipMessageReuseInterval}>
                        <IconButton edge="end">
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
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
            {/* <Grid item xs={12}>
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
            </Grid> */}

            {/* General failure Error */}
            {/* {languages.length > 0 &&
              languages.map((singleLanguage: Language, index) => {
                const langId = singleLanguage.id;
                const langCode = singleLanguage.code;
                const fieldName = `couponBasicInfo.locales.${langId}.general_error`;

                return (
                  <Grid item xs={12} key={index}>
                    <TextField
                      fullWidth
                      name={fieldName}
                      label={`General failure error (${singleLanguage.name})`}
                      value={
                        values.couponBasicInfo.locales[langId]?.general_error ||
                        ""
                      }
                      onChange={handleChange}
                      error={Boolean(
                        touched.couponBasicInfo?.locales?.[langCode]
                          ?.general_error &&
                          errors.couponBasicInfo?.locales?.[langCode]
                            ?.general_error
                      )}
                      helperText={
                        touched.couponBasicInfo?.locales?.[langId]
                          ?.general_error &&
                        errors.couponBasicInfo?.locales?.[langId]?.general_error
                          ? String(
                              errors.couponBasicInfo.locales[langId]
                                .general_error
                            )
                          : ""
                      }
                      onBlur={async (e) => {
                        if (langCode === "en") {
                          const englishText = e.target.value;
                          if (!englishText.trim()) return;

                          for (const lang of languages) {
                            const targetLangId = lang?.id;
                            const targetLang = lang?.code;
                            if (targetLang !== "en") {
                              try {
                                setTranslationLoading((prev) => ({
                                  ...prev,
                                  [`general_error_${targetLang}`]: true,
                                }));

                                const translatedText =
                                  await handleTranslateText(
                                    targetLang,
                                    englishText
                                  );
                                setFieldValue(
                                  `couponBasicInfo.locales.${targetLangId}.general_error`,
                                  translatedText
                                );
                              } catch (err) {
                                console.error(
                                  `Translation failed for ${targetLang}`,
                                  err
                                );
                              } finally {
                                setTranslationLoading((prev) => ({
                                  ...prev,
                                  [`general_error_${targetLang}`]: false,
                                }));
                              }
                            }
                          }
                        }
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            {translationLoading[
                              `general_error_${langCode}`
                            ] && <CircularProgress size={20} />}
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                );
              })} */}

            {/* Exception Error */}
            {/* {languages.length > 0 &&
              languages.map((singleLanguage: Language, index) => {
                const langId = singleLanguage.id;
                const langCode = singleLanguage.code;
                const fieldName = `couponBasicInfo.locales.${langId}.exception_error`;

                return (
                  <Grid item xs={12} key={index}>
                    <TextField
                      fullWidth
                      name={fieldName}
                      label={`Exception error (${singleLanguage.name})`}
                      value={
                        values.couponBasicInfo.locales[langId]
                          ?.exception_error || ""
                      }
                      onChange={handleChange}
                      error={Boolean(
                        touched.couponBasicInfo?.locales?.[langCode]
                          ?.exception_error &&
                          errors.couponBasicInfo?.locales?.[langCode]
                            ?.exception_error
                      )}
                      helperText={
                        touched.couponBasicInfo?.locales?.[langId]
                          ?.exception_error &&
                        errors.couponBasicInfo?.locales?.[langId]
                          ?.exception_error
                          ? String(
                              errors.couponBasicInfo.locales[langId]
                                .exception_error
                            )
                          : ""
                      }
                      onBlur={async (e) => {
                        if (langCode === "en") {
                          const englishText = e.target.value;
                          if (!englishText.trim()) return;

                          for (const lang of languages) {
                            const targetLangId = lang?.id;
                            const targetLang = lang?.code;
                            if (targetLang !== "en") {
                              try {
                                setTranslationLoading((prev) => ({
                                  ...prev,
                                  [`exception_error_${targetLang}`]: true,
                                }));

                                const translatedText =
                                  await handleTranslateText(
                                    targetLang,
                                    englishText
                                  );
                                setFieldValue(
                                  `couponBasicInfo.locales.${targetLangId}.exception_error`,
                                  translatedText
                                );
                              } catch (err) {
                                console.error(
                                  `Translation failed for ${targetLang}`,
                                  err
                                );
                              } finally {
                                setTranslationLoading((prev) => ({
                                  ...prev,
                                  [`exception_error_${targetLang}`]: false,
                                }));
                              }
                            }
                          }
                        }
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            {translationLoading[
                              `exception_error_${langCode}`
                            ] && <CircularProgress size={20} />}
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                );
              })} */}

            {/* Apply to all users */}
            <Grid item xs={12}>
              <Grid container alignItems="center" spacing={2}>
                <Grid item>
                  <Typography variant="subtitle1">
                    Apply to all users
                  </Typography>
                </Grid>
                <Grid item>
                  <Switch
                    name="all_users"
                    color="primary"
                    checked={values.all_users === 1}
                    onChange={(e) =>
                      setFieldValue("all_users", e.target.checked ? 1 : 0)
                    }
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Customer Segments */}
            {values.all_users === 0 && (
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={segments.filter(
                    (s: any) => !values.customer_segment_ids.includes(s.id)
                  )}
                  getOptionLabel={(option: any) => option?.locales?.[0]?.name}
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
                        touched.customer_segment_ids &&
                          errors.customer_segment_ids
                      )}
                      helperText={
                        touched.customer_segment_ids &&
                        errors.customer_segment_ids
                          ? errors.customer_segment_ids
                          : ""
                      }
                    />
                  )}
                />
              </Grid>
            )}

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

            {/* Benefits */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Benefits (optional)
              </Typography>
              {benefitsInputs.map((input, benefitIndex) => (
                <Box
                  display="flex"
                  alignItems="flex-start"
                  gap={1}
                  key={benefitIndex + 1}
                  mb={2}
                  p={2}
                  border="1px solid #ddd"
                  borderRadius="12px"
                  boxShadow="0 2px 5px rgba(0,0,0,0.05)"
                >
                  <Box display="flex" gap={2} flex={1} flexDirection="column">
                    <Box display="flex" alignItems="center" gap={2}>
                      <Button
                        variant="outlined"
                        component="label"
                        fullWidth
                        size="small"
                        sx={{ width: 150, height: 35 }}
                        disabled={uploadingIndex === benefitIndex}
                      >
                        {uploadingIndex === benefitIndex ? (
                          <CircularProgress size={18} />
                        ) : input.icon ? (
                          "Change Icon"
                        ) : (
                          "Upload Icon"
                        )}
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, benefitIndex)}
                        />
                      </Button>
                      {input.icon && (
                        <Box mt={1}>
                          <img
                            src={input.icon}
                            alt="Benefit Icon"
                            style={{
                              width: 33,
                              height: 33,
                              borderRadius: 2,
                            }}
                          />
                        </Box>
                      )}
                    </Box>

                    {/* Loop for each language */}
                    {languages.length > 0 &&
                      languages.map((singleLanguage: Language, langIndex) => {
                        const langId = singleLanguage.id;
                        const langCode = singleLanguage.code;

                        const benefitName =
                          input[`name_${langCode}` as keyof typeof input] || "";

                        return (
                          <TextField
                            key={`${benefitIndex}-${langId}`}
                            fullWidth
                            label={`Benefit ${benefitIndex + 1} (${
                              singleLanguage.name
                            })`}
                            value={benefitName}
                            onChange={(e) => {
                              const newInputs: any = [...benefitsInputs];
                              newInputs[benefitIndex][`name_${langCode}`] =
                                e.target.value;
                              setBenefitsInputs(newInputs);
                            }}
                            onBlur={async (e) => {
                              if (langCode === "en") {
                                const englishText = e.target.value;
                                if (!englishText.trim()) return;

                                for (const lang of languages) {
                                  const targetLangId = lang?.id;
                                  const targetLang = lang.code;
                                  if (targetLang !== "en") {
                                    try {
                                      setTranslationLoading((prev) => ({
                                        ...prev,
                                        [`benefit_${targetLang}_${benefitIndex}`]:
                                          true,
                                      }));

                                      const translatedText =
                                        await handleTranslateText(
                                          targetLang,
                                          englishText
                                        );

                                      const newInputs: any = [
                                        ...benefitsInputs,
                                      ];
                                      newInputs[benefitIndex][
                                        `name_${targetLang}`
                                      ] = translatedText || "";

                                      setFieldValue(
                                        `couponBasicInfo.locales.${targetLangId}.benefits`,
                                        newInputs
                                      );
                                    } catch (err) {
                                      console.error(
                                        `Translation failed for ${targetLang}`,
                                        err
                                      );
                                    } finally {
                                      setTranslationLoading((prev) => ({
                                        ...prev,
                                        [`benefit_${targetLang}_${benefitIndex}`]:
                                          false,
                                      }));
                                    }
                                  }
                                }
                              }
                            }}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  {translationLoading[
                                    `benefit_${langCode}_${benefitIndex}`
                                  ] && <CircularProgress size={20} />}
                                </InputAdornment>
                              ),
                            }}
                          />
                        );
                      })}
                  </Box>

                  {benefitIndex === 0 ? (
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
                            benefitsInputs.filter((_, i) => i !== benefitIndex)
                          );
                        }}
                      />
                    </IconButton>
                  )}
                </Box>
              ))}
            </Grid>

            {/* Desktop image */}
            {languages.length > 0 &&
              languages.map((singleLanguage: Language, index) => {
                const langId = singleLanguage.id;
                const langCode = singleLanguage.code;

                return (
                  <Grid item xs={12} key={index}>
                    <Typography variant="subtitle1" gutterBottom>
                      {`Desktop image (${singleLanguage.name})`}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Button
                        variant="outlined"
                        component="label"
                        fullWidth
                        size="small"
                        sx={{ width: 150, height: 35 }}
                      >
                        {uploading.desktop?.[langId] ? (
                          <CircularProgress size={18} />
                        ) : values.couponBasicInfo.locales[langId]
                            ?.desktop_image ? (
                          "Change Image"
                        ) : (
                          "Upload Image"
                        )}
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) =>
                            uploadImageToBucket(e, "desktop", langId)
                          }
                        />
                      </Button>

                      {/* Image Preview + Remove */}
                      {values.couponBasicInfo.locales[langId]
                        ?.desktop_image && (
                        <Box mt={1} display="flex" alignItems="center" gap={3}>
                          <img
                            src={
                              values.couponBasicInfo.locales[langId]
                                ?.desktop_image
                            }
                            alt={`Desktop ${singleLanguage.name} Image`}
                            style={{ width: 33, height: 33, borderRadius: 2 }}
                          />
                        </Box>
                      )}
                    </Box>
                  </Grid>
                );
              })}

            {/* Mobile image */}
            {languages.length > 0 &&
              languages.map((singleLanguage: Language, index) => {
                const langId = singleLanguage.id;
                const langCode = singleLanguage.code;

                return (
                  <Grid item xs={12} key={index}>
                    <Typography variant="subtitle1" gutterBottom>
                      {`Mobile image (${singleLanguage.name})`}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Button
                        variant="outlined"
                        component="label"
                        fullWidth
                        size="small"
                        sx={{ width: 150, height: 35 }}
                      >
                        {uploading.mobile?.[langId] ? (
                          <CircularProgress size={18} />
                        ) : values.couponBasicInfo.locales[langId]
                            ?.mobile_image ? (
                          "Change Image"
                        ) : (
                          "Upload Image"
                        )}
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) =>
                            uploadImageToBucket(e, "mobile", langId)
                          }
                        />
                      </Button>

                      {/* Image Preview + Remove */}
                      {values.couponBasicInfo.locales[langId]?.mobile_image && (
                        <Box mt={1} display="flex" alignItems="center" gap={3}>
                          <img
                            src={
                              values.couponBasicInfo.locales[langId]
                                ?.mobile_image
                            }
                            alt={`Mobile ${singleLanguage.name} Image`}
                            style={{ width: 33, height: 33, borderRadius: 2 }}
                          />
                        </Box>
                      )}
                    </Box>
                  </Grid>
                );
              })}

            {/* Description */}
            {languages.length > 0 &&
              languages.map((singleLanguage: Language, index) => {
                const langId = singleLanguage.id;
                const langCode = singleLanguage.code;

                return (
                  <Grid item xs={12} key={index}>
                    <Typography variant="subtitle1" gutterBottom>
                      {`Description (${singleLanguage.name})`}
                    </Typography>

                    <RichTextEditor
                      value={
                        values.couponBasicInfo.locales[langId]?.description ||
                        ""
                      }
                      setValue={(value: string) => {
                        setFieldValue(
                          `couponBasicInfo.locales.${langId}.description`,
                          value
                        );
                      }}
                      language={langCode}
                      onBlur={async () => {
                        if (langCode === "en") {
                          const englishText =
                            values.couponBasicInfo.locales[langId]
                              ?.description || "";
                          if (!englishText.trim()) return;

                          for (const lang of languages) {
                            const targetLang = lang.code;
                            const targetLangId = lang.id;

                            if (targetLang !== "en") {
                              try {
                                setTranslationLoading((prev) => ({
                                  ...prev,
                                  [`description_${targetLang}`]: true,
                                }));

                                const translatedText =
                                  await handleTranslateText(
                                    targetLang,
                                    englishText
                                  );

                                setFieldValue(
                                  `couponBasicInfo.locales.${targetLangId}.description`,
                                  translatedText
                                );
                              } catch (err) {
                                console.error(
                                  `Translation failed for ${targetLang}`,
                                  err
                                );
                              } finally {
                                setTranslationLoading((prev) => ({
                                  ...prev,
                                  [`description_${targetLang}`]: false,
                                }));
                              }
                            }
                          }
                        }
                      }}
                      translationLoading={
                        translationLoading[`description_${langCode}`]
                      }
                    />
                  </Grid>
                );
              })}

            {/* Terms And Conditions*/}
            {languages.length > 0 &&
              languages.map((singleLanguage: Language, index) => {
                const langId = singleLanguage.id;
                const langCode = singleLanguage.code;

                return (
                  <Grid item xs={12} key={index}>
                    <Typography variant="subtitle1" gutterBottom>
                      {`Terms And Conditions  (${singleLanguage.name})`}
                    </Typography>

                    <RichTextEditor
                      value={
                        values.couponBasicInfo.locales[langId]
                          ?.term_and_condition || ""
                      }
                      setValue={(value: string) => {
                        setFieldValue(
                          `couponBasicInfo.locales.${langId}.term_and_condition`,
                          value
                        );
                      }}
                      language={langCode}
                      onBlur={async () => {
                        if (langCode === "en") {
                          const englishText =
                            values.couponBasicInfo.locales[langId]
                              ?.term_and_condition || "";
                          if (!englishText.trim()) return;

                          for (const lang of languages) {
                            const targetLang = lang.code;
                            const targetLangId = lang.id;

                            if (targetLang !== "en") {
                              try {
                                setTranslationLoading((prev) => ({
                                  ...prev,
                                  [`term_and_condition_${targetLang}`]: true,
                                }));

                                const translatedText =
                                  await handleTranslateText(
                                    targetLang,
                                    englishText
                                  );

                                setFieldValue(
                                  `couponBasicInfo.locales.${targetLangId}.term_and_condition`,
                                  translatedText
                                );
                              } catch (err) {
                                console.error(
                                  `Translation failed for ${targetLang}`,
                                  err
                                );
                              } finally {
                                setTranslationLoading((prev) => ({
                                  ...prev,
                                  [`term_and_condition_${targetLang}`]: false,
                                }));
                              }
                            }
                          }
                        }
                      }}
                      translationLoading={
                        translationLoading[`term_and_condition_${langCode}`]
                      }
                    />
                  </Grid>
                );
              })}

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
