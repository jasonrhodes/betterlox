import { ToggleButton, ToggleButtonGroup } from "@mui/lab";
import { StatMode } from "@rhodesjason/loxdb/dist/common/types/db";

export interface StatModeToggleOptions {
  mode: StatMode; 
  toggleMode: () => void;
}

export function StatModeToggle({ mode, toggleMode }: StatModeToggleOptions) {
  return (
    <ToggleButtonGroup
      color="secondary"
      value={mode}
      exclusive
      onChange={toggleMode}
      size="small"
    >
      <ToggleButton value="favorite">Highest Rated</ToggleButton>
      <ToggleButton value="most">Most Watched</ToggleButton>
    </ToggleButtonGroup>
  )
}