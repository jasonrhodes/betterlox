import { Box, CircularProgress, Typography } from "@mui/material";
import { LetterboxdList } from "../../db/entities";

export interface ListProgressCircularChartOptions {
  pct: number;
  isLoading: boolean;
  title?: string;
}

export function ListProgressCircularChart({ pct, isLoading, title }: ListProgressCircularChartOptions) {
  return (
    <Box sx={{ 
      mb: 2, 
      mr: 2, 
      position: "relative", 
      width: 200, 
      height: 200, 
      cursor: 'pointer',
      [':active']: {
        top: '2px'
      }
    }}>
      <CircularProgress
        size={200}
        thickness={1}
        variant="determinate"
        value={100}
        sx={{ color: "rgba(0,0,0,0.3)", position: "absolute", top: 0, left: 0 }}
      />
      <CircularProgress
        size={200}
        thickness={1} 
        color={pct === 100 ? "success" : "secondary"}
        value={pct} 
        variant={isLoading ? "indeterminate" : "determinate"}
        sx={{ position: "absolute", top: 0, left: 0 }}
      />
      <Box sx={{ height: 150, width: 150, position: "absolute", top: 20, left: 25, display: "flex" , alignItems: 'center', alignContent: 'center', flexWrap: 'wrap' }}>
        <Typography sx={{ fontSize: '36px', textAlign: 'center', width: '100%' }}>{pct}<Typography component="span" sx={{ fontSize: '24px', position: 'relative', top: '-4px', left: '2px' }}>%</Typography></Typography>
        {title ? <Typography component="div" sx={{ fontSize: '12px', textAlign: 'center', width: '100%' }}>
          {title}
        </Typography> : null}
      </Box>
    </Box>
  )
}