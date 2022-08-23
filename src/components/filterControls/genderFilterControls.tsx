import { FormControlLabel, Switch } from "@mui/material";
import { useGlobalFilters } from "../../hooks/GlobalFiltersContext";

export function OnlyWomenFilterControl() {
  const { globalFilters, setGlobalFilters } = useGlobalFilters();

  return (
    <FormControlLabel 
      control={<Switch />} 
      label="Only consider women"
      checked={globalFilters.onlyWomen}
      value={globalFilters.onlyWomen}
      onChange={(e, value) => setGlobalFilters({ ...globalFilters, onlyWomen: value })}
    />
  );
}

export function OnlyNonBinaryFilterControl() {
  const  { globalFilters, setGlobalFilters } = useGlobalFilters();

  return (
    <FormControlLabel 
      control={<Switch />} 
      label="Only consider non-binary"
      checked={globalFilters.onlyNonBinary}
      value={globalFilters.onlyNonBinary}
      onChange={(e, value) => setGlobalFilters({ ...globalFilters, onlyNonBinary: value })}
    />
  );
}