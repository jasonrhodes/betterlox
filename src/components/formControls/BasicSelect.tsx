import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, SelectProps, SxProps } from "@mui/material";

interface OptionMap<T> {
  label: string;
  value: T;
}

export type SelectChangeHandler<T> = (event: SelectChangeEvent<T>) => void;

export interface BasicSelectOptions<T extends string | number | undefined> {
  value: T;
  handleValueChange: SelectChangeHandler<T>;
  sx?: SxProps;
  options: OptionMap<T>[] | T[];
  label?: string;
  labelId?: string;
  id?: string;
  size?: 'small' | 'medium';
  selectOptions?: SelectProps<T>;
  fullWidth?: boolean;
}

export function isOptionMap<T extends string | number | undefined>(value: OptionMap<T> | T): value is OptionMap<T> {
  return (
    typeof value === "object" && 
    value !== null &&
    'label' in value && 
    'value' in value
  );
}

export function BasicSelect<T extends string | number | undefined>({ 
  value, 
  handleValueChange, 
  options,
  sx = {},
  label,
  labelId,
  id,
  size = 'medium',
  selectOptions = {},
  fullWidth
}: BasicSelectOptions<T>) {
  const optionsMap = options.map((option) => isOptionMap<T>(option) ? option : { label: String(option), value: option });
  return (
    <FormControl sx={sx} size={size} fullWidth={fullWidth}>
      {label ? <InputLabel id={labelId}>{label}</InputLabel> : null}
      <Select
        labelId={labelId}
        id={id}
        value={value}
        label={label}
        autoWidth={fullWidth ? false : true}
        fullWidth={fullWidth}
        onChange={handleValueChange}
        {...selectOptions}
      >
        {optionsMap.map((option) => (
          <MenuItem key={option.label} selected={value === option.value} value={option.value}>{option.label}</MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}