import { CloudDone, HelpCenter, LockClock, Schedule, SyncProblem, Sync as SyncIcon } from "@mui/icons-material";
import { SxProps, Tooltip } from "@mui/material";
import { LetterboxdUserEntrySyncStatus } from "@rhodesjason/loxdb/dist/common/types/db";
import { LetterboxdUserEntrySync } from "@rhodesjason/loxdb/dist/db/entities";

export function UserEntrySyncStatus({ sync }: { sync: LetterboxdUserEntrySync | null }) {
  const d = (sync !== null && typeof sync.startDate === "string")
    ? new Date(sync.startDate)
    : null;

  return (sync === null || d === null)
    ? <Tooltip title="None in the past 30 days"><HelpCenter fontSize="small" /></Tooltip>
    : (
      <span style={{ position: 'relative' }}>
        <Tooltip title={d.toLocaleTimeString()}>
          <span>{d.toLocaleDateString()}</span>
        </Tooltip>
        <Tooltip title={sync.status}>
          <span>{getSyncStatusIcon(sync.status)}</span>
        </Tooltip>
      </span>
    );
}

function getSyncStatusIcon(status: LetterboxdUserEntrySyncStatus) {
  const sx: SxProps = {
    position: 'relative',
    top: '4px',
    right: '-5px'
  }

  switch (status) {
    case LetterboxdUserEntrySyncStatus.COMPLETE:
      return <CloudDone sx={sx} color="success" fontSize="small" />;
    
    case LetterboxdUserEntrySyncStatus.FAILED:
      return <SyncProblem sx={sx} color="error" fontSize="small" />;
    
    case LetterboxdUserEntrySyncStatus.IN_PROGRESS:
      return <SyncIcon sx={sx} color="secondary" fontSize="small" />;
    
    case LetterboxdUserEntrySyncStatus.QUEUED:
      return <LockClock sx={sx} color="warning" fontSize="small" />;

    case LetterboxdUserEntrySyncStatus.REQUESTED:
      return <Schedule sx={sx} color="warning" fontSize="small" />;

    default:
      return null;
  }
  
}