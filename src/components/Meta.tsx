import { Box, Typography } from "@mui/material";

export function Meta({ label, icon }: { label: string | JSX.Element; icon?: JSX.Element }) {
  return (
    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
    {icon ? <Box sx={{ mr: 1 }}>{icon}</Box> : null}
    {label}
    </Typography>
  );
}