import type { NextPage } from 'next';
import { UserPageTemplate } from '../../components/PageTemplate';
import { Avatar, Button, Box, Typography, Link, Alert, CircularProgress, Grid } from '@mui/material';
import React, { useState } from 'react';
import { callApi } from '../../hooks/useApi';
import { UserRatingsSyncApiResponse, ApiErrorResponse } from '../../common/types/api';
import { getErrorAsString } from '../../lib/getErrorAsString';

type SyncingState = 'none' | 'syncing' | 'success' | 'failed';

interface ResponseMessageProps {
  resyncState: SyncingState;
  numSynced: number;
  syncError: string | null;
}

function ResponseMessage({ resyncState, numSynced, syncError }: ResponseMessageProps) {
  if (resyncState === "none") {
    return null;
  }
  const alertVariant = "filled";
  if (resyncState === "syncing") {
    return (
      <Alert severity="info" variant={alertVariant}>
        <Grid container spacing={2} justifyItems="center" alignItems="center">
          <Grid item><Typography>Sync in progress, please wait.</Typography></Grid>
          <Grid item><CircularProgress /></Grid>
        </Grid>
      </Alert>
    );
  }
  if (resyncState === "success") {
    return (
      <Alert severity="success" variant={alertVariant}>
        <Typography>Sync complete! {numSynced || 0} ratings synced.</Typography>
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
  const [numSynced, setNumSynced] = useState<number>(0);
  const [syncError, setSyncError] = useState<string | null>(null);

  const handleSyncClick = async (userId: number) => {
    setResyncState("syncing");
    try {
      const response = await callApi<UserRatingsSyncApiResponse | ApiErrorResponse>(`/api/users/${userId}/ratings/sync`, {
        method: 'POST'
      });
      if (response.success && 'synced' in response.data) {
        setResyncState("success");
        setNumSynced(response.data.synced.length);
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
    <UserPageTemplate title="Sync Data" maxWidth='lg'>
      {({ user }) => (
        <Box>
          <Avatar src={user.avatarUrl} sx={{ height: 100, width: 100, mb: 2, boxShadow: "0 0 1px rgba(0,0,0,0.8)" }} />
          <Typography sx={{ mb: 5 }} variant="body1" component="div">Syncing your data will gather your latest <Link target="_blank" rel="noreferrer" href={`https://letterboxd.com/${user.username}/films/ratings`}>ratings</Link> and <Link target="_blank" rel="noreferrer" href={`https://letterboxd.com/${user.username}/lists`}>lists</Link> (coming soon) from Letterboxd and make them available here.</Typography>

          <ResponseMessage resyncState={resyncState} numSynced={numSynced} syncError={syncError} />

          <Box sx={{ py: 5 }}>
            {resyncState === "syncing" ? 
              <Button disabled variant="contained" sx={{ mr: 2 }}>Syncing...</Button> : 
              <Button onClick={() => handleSyncClick(user.id)} variant="contained" sx={{ mr: 2 }}>Sync My Letterboxd Data</Button>
            }
            {/* <Button disabled={true}>Remove My Data</Button> */}
          </Box>
        </Box>
      )}
    </UserPageTemplate>
  )
}

export default AccountSyncPage;