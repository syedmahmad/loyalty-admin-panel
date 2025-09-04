import React, { useState, useEffect } from "react";
import { TextField, CircularProgress } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";

export type Option = {
  id: number;
  label: string;
};

type SearchAutoSuggestProps = {
  label?: string;
  inputTextChange: (inputString: string) => void;
  options: Option[];
  selectedValues: Option[];
  setSelectedValues: React.Dispatch<React.SetStateAction<Option[]>>;
  loading: boolean;
};

export default function SearchAutoSuggest({
  label = "search",
  inputTextChange,
  options,
  selectedValues,
  setSelectedValues,
  loading,
}: SearchAutoSuggestProps) {
  const [open, setOpen] = useState(false);
  // const [loading, setLoading] = useState(false);

  return (
    <Autocomplete
      multiple
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={options}
      loading={loading}
      value={selectedValues}
      onChange={(_, newValue) => setSelectedValues(newValue)}
      onInputChange={(_, value) => {
        inputTextChange(value);
      }}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          {" "}
          {/* 👈 unique key here */}
          {option.label}
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}
