import { Box, Button, SxProps } from "@mui/material";

interface MobileSwitcherOptions { 
  sx: SxProps; 
  value: number; 
  setValue: (value: number) => void; 
}

export function MobileSwitcher({ sx, value, setValue }: MobileSwitcherOptions) {
  return (
    <Box sx={sx}>
      <ul>
        <li>
          <Button variant={value === 0 ? "outlined" : "text"} onClick={() => setValue(0)}>Actors</Button>
        </li>
        <li>
          <Button variant={value === 1 ? "outlined" : "text"} onClick={() => setValue(1)}>Directors</Button>
        </li>
        <li>
          <Button variant={value === 2 ? "outlined" : "text"} onClick={() => setValue(2)}>Cinematographers</Button>
        </li>
        <li>
          <Button variant={value === 3 ? "outlined" : "text"} onClick={() => setValue(3)}>Editors</Button>
        </li>
        <li>
          <Button variant={value === 4 ? "outlined" : "text"} onClick={() => setValue(4)}>Collections</Button>
        </li>
      </ul>
    </Box>
  )
}