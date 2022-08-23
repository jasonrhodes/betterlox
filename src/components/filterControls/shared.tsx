import React from 'react';
import { CheckBoxOutlineBlank, CheckBox } from "@mui/icons-material";

export const listBoxProps: React.HTMLAttributes<HTMLUListElement> = {
  style: {
    border: '1px solid rgba(255,255,255,0.2)',
    borderTop: 'none',
    borderRadius: '4px',
    boxShadow: '0 3px 6px 8px rgba(0,0,0,0.5)'
  }
}

export const checkboxIcon = <CheckBoxOutlineBlank fontSize="small" />;
export const checkboxIconChecked = <CheckBox fontSize="small" />;