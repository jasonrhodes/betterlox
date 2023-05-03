import type { NextPage } from 'next';
import { UserPageTemplate } from '../../components/PageTemplate';
import { Button, Box, Typography, Link, Alert, CircularProgress, Paper } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { callApi } from '../../hooks/useApi';
import { ApiErrorResponse, ApiSuccessResponse, SyncsForUserResponse } from "../../common/types/api";
import { getErrorAsString } from "@rhodesjason/loxdb/dist/lib/getErrorAsString";
import { FormatListNumbered, Tv } from '@mui/icons-material';
import { UserPublic } from "@rhodesjason/loxdb/dist/common/types/db";
import axios from 'axios';
import { response } from 'express';
import { AppLink } from '../../components/AppLink';
import { Sync } from '@rhodesjason/loxdb/dist/db/entities';

type SyncingState = 'none' | 'syncing' | 'success' | 'failed';

const AccountSyncPage: NextPage = () => {
  const [syncMessage, setSyncMessage] = useState<string>('');
  const [syncState, setSyncState] = useState<SyncingState>('none');

  return (
    <UserPageTemplate title="Manual Account Sync" maxWidth='md'>
      {({ user }) => (
        <>
          <ProgressMessage state={syncState} message={syncMessage} />
          <SyncWatchData user={user} setSyncMessage={setSyncMessage} setSyncState={setSyncState} syncState={syncState} />
          <LatestSync user={user} syncMessage={syncMessage} />
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
      const response = await callApi<ApiSuccessResponse | ApiErrorResponse>(`/api/users/${userId}/entries/sync`, {
        method: 'POST'
      });
      if (response.success) {
        setSyncState("success");
        setSyncMessage(`Sync successfully started.`);
      } else {
        setSyncState("failed");
        let message = `Sync request failed due to a system error. Please try again.`;
        if ('message' in response) {
          message += ` [${response.message}]`;
        }
        setSyncMessage(message);
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
          <Typography variant="h5">Re-Sync Watch Data</Typography>
        </Box>
      </Box>
      <Typography sx={{ mb: 1 }} variant="body1" component="div">Manually sync your watch data to retrieve your latest entries from Letterboxd. Entries are collected from <Link target="_blank" rel="noreferrer" href={`https://letterboxd.com/${user.username}/films/by/rated-date/`}>your 'Watches' page</Link> and are periodically refreshed for you. Manually syncing your entires should ONLY be necessary if you seem to be missing entries in Betterlox. <b>Note:</b> This will resync ALL of your watches and will usually take 3-5 minutes or more.</Typography>

      <Box sx={{ py: 3 }}>
        <Button 
          disabled={syncState === "syncing"}
          onClick={() => handleSyncClick(user.id)} 
          variant="contained" 
          sx={{ mr: 2 }}
        >
          Resync My Watch Data
        </Button>
      </Box>
    </Paper>
  );
}

interface AxiosErrorWithResponseData<T> {
  response: {
    data: T
  }
}

function LatestSync({ user, syncMessage }: { user: UserPublic, syncMessage: string }) {
  const [syncs, setSyncs] = useState<Sync[]>([]);
  useEffect(() => {
    async function retrieve() {
      const result = await callApi<SyncsForUserResponse, ApiErrorResponse>(`/api/users/${user.id}/syncs`);
      if ('syncs' in result.data) {
        setSyncs(result.data.syncs);
      }
    }
    retrieve();
  }, [syncMessage]);

  if (syncs.length === 0) {
    return null;
  }

  const sync = syncs[0];

  return (
    <Paper elevation={5} sx={{ p: 4, mb: 2 }}>
      <Box sx={{ mb: 1, verticalAlign: 'middle' }}>
      <Box sx={{ pb: 1 }}>
          <Typography variant="h5">Your Latest User Sync</Typography>
        </Box>
          <Typography><b>Type:</b> {sync.type}</Typography>
          <Typography><b>Status:</b> {sync.status}</Typography>
          <Typography><b>Started:</b> {(new Date(sync.started)).toLocaleString()}</Typography>
          <Typography><b>Finished:</b> {sync.finished ? (new Date(sync.finished)).toLocaleString() : null}</Typography>
          <Typography><b>Number of Entries Synced?:</b> {sync.numSynced || 0}</Typography>
          {sync.errorMessage ? <Typography><b>Error Message:</b> {sync.errorMessage}</Typography> : null}
      </Box>
    </Paper>
  )
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
        <Typography>{message}</Typography>
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