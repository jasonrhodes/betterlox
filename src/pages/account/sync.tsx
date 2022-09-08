import type { NextPage } from 'next';
import { UserPageTemplate } from '../../components/PageTemplate';
import { Button, Box, Typography, Link, Alert, CircularProgress, Paper } from '@mui/material';
import React, { useState } from 'react';
import { callApi } from '../../hooks/useApi';
import { UserEntriesSyncApiResponse, ApiErrorResponse, UserListsApiResponse } from '../../common/types/api';
import { getErrorAsString } from '../../lib/getErrorAsString';
import { FormatListNumbered, Tv } from '@mui/icons-material';
import { UserPublic } from '../../common/types/db';

type SyncingState = 'none' | 'syncing' | 'success' | 'failed';

interface WatchDataNumSynced {
  watches: number;
  ratings: number;
}

const AccountSyncPage: NextPage = () => {
  const [syncMessage, setSyncMessage] = useState<string>('');
  const [syncState, setSyncState] = useState<SyncingState>('none');

  return (
    <UserPageTemplate title="Account Sync" maxWidth='md'>
      {({ user }) => (
        <>
          <ProgressMessage state={syncState} message={syncMessage} />
          <SyncWatchData user={user} setSyncMessage={setSyncMessage} setSyncState={setSyncState} syncState={syncState} />
          <SyncListData user={user} setSyncMessage={setSyncMessage} setSyncState={setSyncState} syncState={syncState}  />
        </>
      )}
    </UserPageTemplate>
  );
}

interface SyncPanelOptions {
  user: UserPublic;
  setSyncMessage: (v: string) => void;
  syncState: SyncingState; 
  setSyncState: (v: SyncingState) => void;
}

function SyncWatchData({
  user,
  setSyncMessage,
  setSyncState,
  syncState
}: SyncPanelOptions) {
  const handleSyncClick = async (userId: number) => {
    setSyncState("syncing");
    try {
      const response = await callApi<UserEntriesSyncApiResponse | ApiErrorResponse>(`/api/users/${userId}/entries/sync`, {
        method: 'POST'
      });
      if (response.success && 'synced' in response.data) {
        const { synced } = response.data;
        setSyncState("success");
        setSyncMessage(`${synced.ratings.length} ratings and ${synced.watches.length} watches have been updated.`);
      } else {
        setSyncState("failed");
        setSyncMessage("Sync request failed due to a system error. Please try again.")
      }
    } catch (error: unknown) {
      const message = getErrorAsString(error);
      setSyncState("failed");
      setSyncMessage(message);
    }
  };

  return (
    <Paper elevation={5} sx={{ p: 4, mb: 2 }}>
      <Box sx={{ display: 'flex', mb: 1, verticalAlign: 'middle' }}>
        <Box sx={{ mr: 2, position: 'relative', top: '-1px' }}>
          <Tv fontSize="large" />
        </Box>
        <Box sx={{ pb: 1 }}>
          <Typography variant="h5">Watch Data</Typography>
        </Box>
      </Box>
      <Typography sx={{ mb: 1 }} variant="body1" component="div">Manually sync your watch data to retrieve your latest <Link target="_blank" rel="noreferrer" href={`https://letterboxd.com/${user.username}/films/by/date`}>watches</Link> and <Link target="_blank" rel="noreferrer" href={`https://letterboxd.com/${user.username}/films/ratings`}>ratings</Link> from Letterboxd.</Typography>

      <Box sx={{ py: 3 }}>
        <Button 
          disabled={syncState === "syncing"}
          onClick={() => handleSyncClick(user.id)} 
          variant="contained" 
          sx={{ mr: 2 }}
        >
          Sync My Watch Data
        </Button>
      </Box>
    </Paper>
  );
}

function SyncListData({
  user,
  setSyncMessage,
  setSyncState,
  syncState
}: SyncPanelOptions) {
  const handleSyncClick = async (userId: number) => {
    setSyncState("syncing");
    try {
      const response = await callApi<UserListsApiResponse>(`/api/users/${userId}/lists`, {
        method: 'POST'
      });
      if (response.success && 'synced' in response.data) {
        const { synced } = response.data;
        setSyncState("success");
        setSyncMessage(`${synced} lists have been updated.`);
      } else {
        setSyncState("failed");
        setSyncMessage("Sync failed due to a system error.");
      }
    } catch (error: unknown) {
      const message = getErrorAsString(error);
      setSyncState("failed");
      setSyncMessage(message);
    }
  };

  return (
    <Paper elevation={5} sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', mb: 1, verticalAlign: 'middle' }}>
        <Box sx={{ mr: 2, position: 'relative', top: '-1px' }}>
          <FormatListNumbered fontSize="large" />
        </Box>
        <Box sx={{ pb: 1 }}>
          <Typography variant="h5">List Data</Typography>
        </Box>
      </Box>
      <Typography sx={{ mb: 1 }} variant="body1" component="div">Manually sync your list data to retrieve your latest <Link target="_blank" rel="noreferrer" href={`https://letterboxd.com/${user.username}/lists`}>lists</Link> from Letterboxd.</Typography>

      <Box sx={{ py: 3 }}>
        <Button 
          disabled={syncState === "syncing"} 
          onClick={() => handleSyncClick(user.id)} 
          variant="contained" 
          sx={{ mr: 2 }}
        >
          Sync My List Data
        </Button>
      </Box>
    </Paper>
  );
}

function ProgressMessage({ state, message = '' }: { state: SyncingState; message?: string; }) {
  if (state === "none") {
    return null;
  }

  const alertVariant = "filled";
  let alert: JSX.Element | null = null;

  if (state === "syncing") {
    alert = (
      <Alert severity="info" variant={alertVariant} action={<CircularProgress color="primary" size="small" />}>
        Sync in progress, please wait.
      </Alert>
    );
  }
  if (state === "success") {
    alert = (
      <Alert severity="success" variant={alertVariant}>
        <Typography>Sync complete. {message}</Typography>
      </Alert>
    );
  }
  if (state === "failed") {
    alert = (
      <Alert severity="error" variant={alertVariant}>
        <Typography>Sync failed. {message}</Typography>
      </Alert>
    );
  }

  return alert === null ? null : <Box sx={{ mb: 2 }}>{alert}</Box>;
}

export default AccountSyncPage;