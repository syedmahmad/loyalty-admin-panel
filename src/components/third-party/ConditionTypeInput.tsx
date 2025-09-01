import React, { useEffect, useState } from "react";
import { Autocomplete, TextField } from "@mui/material";
import { createFilterOptions } from "@mui/material/Autocomplete";
import { createSlug } from "@/utils/Index";

interface ConditionTypeDropdownProps {
  preFilledvalue: string;
  handleConditionTypeDropdownChange: (val: string) => void;
}

const filter = createFilterOptions<any>();

export default function ConditionTypeDropdown({
  preFilledvalue,
  handleConditionTypeDropdownChange,
}: ConditionTypeDropdownProps) {
  const [value, setValue] = useState<any>(null);

  // Map of backend values -> UI labels
  const options = [
    { value: "store_id", label: "store_id" },
    { value: "name", label: "product_name" },
    { value: "quantity", label: "product_quantity" },
  ];

  useEffect(() => {
    if (value) {
      handleConditionTypeDropdownChange(value?.value || value);
    }
  }, [value]);

  return (
    <Autocomplete
      fullWidth
      value={
        options.find((opt) => opt.value === preFilledvalue) ||
        preFilledvalue ||
        null
      }
      onChange={(event, newValue: any) => {
        if (typeof newValue === "string") {
          setValue({ value: newValue, label: newValue });
        } else if (newValue && newValue.inputValue) {
          setValue({ value: newValue.inputValue, label: newValue.inputValue });
        } else {
          setValue(newValue);
        }
      }}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);

        if (
          params.inputValue !== "" &&
          !options.some((opt) => opt.value === params.inputValue)
        ) {
          filtered.push({
            inputValue: params.inputValue,
            label: `Create "${params.inputValue}"`,
            value: params.inputValue,
          });
        }

        return filtered;
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      options={options}
      getOptionLabel={(option) => {
        if (typeof option === "string") {
          return option;
        }
        if (option.inputValue) {
          return option.inputValue;
        }
        return option.label;
      }}
      renderOption={(props, option) => {
        const { key, ...rest } = props;
        return typeof option === "string" ? (
          <li key={key} {...rest}>
            {option}
          </li>
        ) : (
          <li
            key={key}
            {...rest}
            style={{
              fontWeight: option.label?.startsWith("Create")
                ? "bold"
                : "normal",
            }}
          >
            {option.label}
          </li>
        );
      }}
      freeSolo
      renderInput={(params) => (
        <TextField {...params} label="Condition Type" variant="outlined" />
      )}
    />
  );
}
