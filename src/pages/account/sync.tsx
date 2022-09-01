import type { NextPage } from 'next';
import { UserPageTemplate } from '../../components/PageTemplate';
import { Avatar, Button, Box, Typography, Link, Alert, CircularProgress, Grid, Paper } from '@mui/material';
import React, { useState } from 'react';
import { callApi } from '../../hooks/useApi';
import { UserEntriesSyncApiResponse, ApiErrorResponse } from '../../common/types/api';
import { getErrorAsString } from '../../lib/getErrorAsString';

type SyncingState = 'none' | 'syncing' | 'success' | 'failed';

interface NumSynced {
  watches: number;
  ratings: number;
}

interface ResponseMessageProps {
  resyncState: SyncingState;
  numSynced: NumSynced;
  syncError: string | null;
}

function ResponseMessage({ resyncState, numSynced, syncError }: ResponseMessageProps) {
  if (resyncState === "none") {
    return null;
  }
  const alertVariant = "filled";
  if (resyncState === "syncing") {
    return (
      <Alert severity="info" variant={alertVariant} action={<CircularProgress color="primary" size="small" />}>
        Sync in progress, please wait.
      </Alert>
    );
  }
  if (resyncState === "success") {
    return (
      <Alert severity="success" variant={alertVariant}>
        <Typography>Sync complete! {numSynced.ratings} ratings and {numSynced.watches} watches synced.</Typography>
      </Alert>
    );
  }
  if (resyncState === "failed") {
    return (
      <Alert severity="error" variant={alertVariant}>
        <Typography>Sync failed. {syncError}</Typography>
      </Alert>
    );
  }

  return null;
}

const AccountSyncPage: NextPage = () => {
  const [resyncState, setResyncState] = useState<SyncingState>('none');
  const [numSynced, setNumSynced] = useState<NumSynced>({ watches: 0, ratings: 0 });
  const [syncError, setSyncError] = useState<string | null>(null);

  const handleSyncClick = async (userId: number) => {
    setResyncState("syncing");
    try {
      const response = await callApi<UserEntriesSyncApiResponse | ApiErrorResponse>(`/api/users/${userId}/entries/sync`, {
        method: 'POST'
      });
      if (response.success && 'synced' in response.data) {
        const { synced } = response.data;
        setResyncState("success");
        setNumSynced({ ratings: synced.ratings.length, watches: synced.watches.length });
      } else {
        setResyncState("failed");
        setSyncError("Sync may have failed")
      }
    } catch (error: unknown) {
      const message = getErrorAsString(error);
      setResyncState("failed");
      setSyncError(message);
    }
  };

  return (
    <UserPageTemplate title="Sync Data" maxWidth='md'>
      {({ user }) => (
        <Paper elevation={5} sx={{ p: 5 }}>
          <Avatar src={user.avatarUrl} sx={{ height: 100, width: 100, mb: 2, boxShadow: "0 0 1px rgba(0,0,0,0.8)" }} />
          <Typography sx={{ mb: 5 }} variant="body1" component="div">Syncing your data will gather your latest <Link target="_blank" rel="noreferrer" href={`https://letterboxd.com/${user.username}/films/by/date`}>watches</Link>, <Link target="_blank" rel="noreferrer" href={`https://letterboxd.com/${user.username}/films/ratings`}>ratings</Link>, and <Link target="_blank" rel="noreferrer" href={`https://letterboxd.com/${user.username}/lists`}>lists</Link> (coming soon) from Letterboxd and make them available here.</Typography>

          <ResponseMessage resyncState={resyncState} numSynced={numSynced} syncError={syncError} />

          <Box sx={{ py: 5 }}>
            {resyncState === "syncing" ? 
              <Button disabled variant="contained" sx={{ mr: 2 }}>Syncing...</Button> : 
              <Button onClick={() => handleSyncClick(user.id)} variant="contained" sx={{ mr: 2 }}>Sync My Letterboxd Data</Button>
            }
            {/* <Button disabled={true}>Remove My Data</Button> */}
          </Box>
        </Paper>
      )}
    </UserPageTemplate>
  )
}

export default AccountSyncPage;