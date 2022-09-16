import { Settings, CloseSharp } from "@mui/icons-material";
import { Box, Chip, Dialog, Typography } from "@mui/material";
import { useState } from "react";
import { useCurrentUser } from "../../hooks/UserContext";
import { UserSettingStatsMinWatched, UserSettingStatsMinCastOrder } from "../settings/settingsFields";

export function StatsSettings({ 
  showMinWatched, 
  showMinCastOrder 
}: { 
  showMinWatched: boolean; 
  showMinCastOrder: boolean; 
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { user } = useCurrentUser();

  if (!user || (!showMinWatched && !showMinCastOrder)) {
    return null;
  }

  return (
    <>
      <Box sx={{ display: { xs: 'none', md: 'flex' }, cursor: "pointer" }} onClick={() => setIsOpen(true)}>
       {showMinWatched ? <Chip 
          size="small" 
          color="secondary"
          variant="outlined"
          sx={{ ml: 1 }} 
          label={`Min Watched: ${user.settings?.statsMinWatched || 'Unset'}`} 
          onClick={() => setIsOpen(true)} 
        /> : null}
        {showMinCastOrder ? <Chip 
          size="small" 
          color="secondary"
          variant="outlined"
          sx={{ ml: 1 }} 
          label={`Lowest Cast Order: ${user.settings?.statsMinCastOrder || 'Unset'}`} 
          onClick={() => setIsOpen(true)} 
        /> : null}
        <Settings color="secondary" fontSize="medium" sx={{ ml: 1 }} />
      </Box>
      <Box
        sx={{ cursor: "pointer", p: 1, display: { xs: 'inherit', md: 'none' } }} 
        onClick={() => setIsOpen(true)}
      >
        <Settings color="secondary" fontSize="medium" />
      </Box>
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        fullWidth={true}
        PaperProps={{
          sx: {
            backgroundColor: "background.default",
            backgroundImage: "none",
            position: "relative"
          }
        }}
      >
        <>  
          <Box sx={{ p: 4 }}>
            <Typography color="primary" component="div" variant="h5" sx={{ marginBottom: 4 }}>Settings</Typography>
            <Box sx={{ mb: 4 }}><UserSettingStatsMinWatched /></Box>
            <Box sx={{ mb: 4 }}><UserSettingStatsMinCastOrder /></Box>
          </Box>
          <Box 
            sx={{ position: 'absolute', top: 0, right: 0, cursor: 'pointer', p: 2 }}
            onClick={() => setIsOpen(false)}
          >
            <CloseSharp />
          </Box>
        </>
      </Dialog>
    </>
  )
}