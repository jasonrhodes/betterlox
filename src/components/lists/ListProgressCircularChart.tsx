import { Box, CircularProgress, Typography, useMediaQuery, useTheme } from "@mui/material";

export interface ListProgressCircularChartOptions {
  pct: number;
  isLoading: boolean;
  title?: string;
  isMobile?: boolean;
}

export function ListProgressCircularChart({ pct, isLoading, title, isMobile }: ListProgressCircularChartOptions) {
  const size = isMobile ? 150 : 200;
  const shiftTextFromTop = isMobile ? '4%' : '10%';
  return (
    <Box sx={{ 
      mb: 2, 
      mr: 2, 
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      width: size, 
      height: size, 
      cursor: 'pointer',
      [':active']: {
        top: '2px'
      }
    }}>
      <CircularProgress
        size={size}
        thickness={1}
        variant="determinate"
        value={100}
        sx={{ color: "rgba(0,0,0,0.3)", position: "absolute", top: 0, left: 0 }}
      />
      <CircularProgress
        size={size}
        thickness={1} 
        color={pct === 100 ? "success" : "secondary"}
        value={pct} 
        variant={isLoading ? "indeterminate" : "determinate"}
        sx={{ position: "absolute", top: 0, left: 0 }}
      />
      <Box sx={{ height: size * 0.75, width: size * 0.75, display: "flex" , alignItems: 'center', alignContent: 'flex-start', justifyContent: 'center', flexWrap: 'wrap', position: 'relative', top: shiftTextFromTop }}>
        <Typography sx={{ fontSize: '36px', textAlign: 'center', width: '100%', position: 'relative', left: '5px' }}>{pct}<Typography component="span" sx={{ fontSize: '24px', position: 'relative', top: '-4px', left: '2px' }}>%</Typography></Typography>
        {title ? <Typography component="div" sx={{ fontSize: '12px', lineHeight: 1.25, textAlign: 'center', width: '100%' }}>
          {title}
        </Typography> : null}
      </Box>
    </Box>
  )
}