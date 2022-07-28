import { Box, Paper, SxProps } from "@mui/material";
import React from "react";

interface DisplayTableColumnBase<T> {
  name: string;
  sx?: SxProps;
}

interface DisplayTableColumnWithFieldName<T> extends DisplayTableColumnBase<T> {
  field: keyof T;
}

interface DisplayTableColumnWithRenderer<T> extends DisplayTableColumnBase<T> {
  renderCell: (item: T) => React.ReactNode;
}

type DisplayTableColumn<T> = DisplayTableColumnWithFieldName<T> | DisplayTableColumnWithRenderer<T>;

export interface DisplayTableProps<T = unknown> {
  items: T[],
  columns: DisplayTableColumn<T>[];
  getRowId: (item: T) => string | number;
  getRowSx?: (item: T, i: number) => SxProps;
  sx?: SxProps;
}

export function DisplayTable<T>({
  items,
  getRowId,
  getRowSx,
  columns,
  sx
}: DisplayTableProps<T>) {
  const rows = items.map((item, i) => ({
    id: getRowId(item),
    sx: getRowSx ? getRowSx(item, i) : {},
    cells: columns.map((column) => ({
      ...column,
      value: ('field' in column) ? <>{item[column.field]}</> : column.renderCell(item)
    }))
  }));

  return (
    <Paper className="displayTable" sx={sx}>
      <Box>
        {rows.map((row) => (
          <Box className="displayTable_Row" key={row.id} sx={row.sx}>
            {row.cells.map((cell, j) => (
              <Box key={`${row.id}--${cell.name || j}`} className="displayTable_Cell" sx={cell.sx}>
                {cell.value}
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    </Paper>
  )
}