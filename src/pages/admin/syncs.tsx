import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { UserPageTemplate } from '../../components/PageTemplate';
import { Box, Grid, MenuItem, MenuList, Paper, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridValueFormatterParams } from '@mui/x-data-grid';
import { Sync } from '../../db/entities';
import { callApi } from '../../hooks/useApi';
import { SyncsManagementGetResponse } from '../../common/types/api';

function SyncHistoryTable() {
  const [syncs, setSyncs] = useState<Sync[]>([]);
  const [refreshes, setRefreshes] = useState<number>(0);
  useEffect(() => {
    async function retrieve() {
      const { data } = await callApi<SyncsManagementGetResponse>(`/api/syncs`);
      setSyncs(data.syncs);
    }
    retrieve();
  }, [refreshes]);
  return (
    <Box>
      <Typography variant="h6" sx={{ py: 2 }}>Sync History</Typography>
      <DataGrid
        sx={{
          minHeight: 700
        }}
        rows={syncs}
        columns={[
          {
            field: 'id',
            headerName: 'ID',
            width: 75
          },
          {
            field: 'type',
            headerName: 'Type',
            width: 120
          },
          {
            field: 'username',
            headerName: 'Username',
            width: 120
          },
          {
            field: 'status',
            headerName: 'Status',
            width: 100
          },
          {
            field: 'started',
            headerName: 'When Started',
            width: 150,
            valueFormatter: ({ value }: GridValueFormatterParams<string | Date>) => {
              console.log(typeof value, value);
              const d = new Date(value);
              const ds = d.toLocaleDateString();
              const ts = d.toLocaleTimeString();
              return `${ds.substring(0, ds.length - 5)} ${ts}`;
            }
          },
          {
            field: 'finished',
            headerName: 'When Finished',
            width: 150,
            valueFormatter: ({ value }: GridValueFormatterParams<string | Date>) => {
              const d = new Date(value);
              const ds = d.toLocaleDateString();
              const ts = d.toLocaleTimeString();
              return `${ds.substring(0, ds.length - 5)} ${ts}`;
            }
          },
          {
            field: 'numSynced',
            headerName: '# Synced',
            width: 100
          },
          {
            field: 'errorMessage',
            headerName: 'Error Message',
            minWidth: 1000,
            flex: 1
          }
        ]}
      />
    </Box>
  )
}

type TabName = 'history' | 'un-ratings-movies' | 'un-movies-cast' | 'un-movies-crew' | 'un-cast-people' | 'un-crew-people';

function SyncMenu({ currentTab, setCurrentTab }: { currentTab: TabName, setCurrentTab: (t: TabName) => void }) {
  const itemPadding = 1.5;
  return (
    <>
      <Typography variant="h6" sx={{ py: 2 }}>Sync Management</Typography>
      <Paper sx={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}>
        <MenuList>
          <MenuItem sx={{ py: itemPadding }} selected={currentTab === "history"} onClick={() => setCurrentTab("history")}>
            <Typography>Sync History</Typography>
          </MenuItem>
          <MenuItem sx={{ py: itemPadding }} selected={currentTab === "un-ratings-movies"} onClick={() => setCurrentTab("un-ratings-movies")}>
            <Typography>Unsynced Ratings/Movies</Typography>
          </MenuItem>
          <MenuItem sx={{ py: itemPadding }} selected={currentTab === "un-movies-cast"} onClick={() => setCurrentTab("un-movies-cast")}>
            <Typography>Unsynced Movies/Cast</Typography>
          </MenuItem>
          <MenuItem sx={{ py: itemPadding }} selected={currentTab === "un-movies-crew"} onClick={() => setCurrentTab("un-movies-crew")}>
            <Typography>Unsynced Movies/Crew</Typography>
          </MenuItem>
          <MenuItem sx={{ py: itemPadding }} selected={currentTab === "un-cast-people"} onClick={() => setCurrentTab("un-cast-people")}>
            <Typography>Unsynced Cast/People</Typography>
          </MenuItem>
          <MenuItem sx={{ py: itemPadding }} selected={currentTab === "un-crew-people"} onClick={() => setCurrentTab("un-crew-people")}>
            <Typography>Unsynced Crew/People</Typography>
          </MenuItem>
        </MenuList>
      </Paper>
    </>
  )
}

function UnsyncedTable({ type }: { type: Omit<TabName, 'history'> }) {
  return (
    <Box>
      <Typography variant="h6" sx={{ py: 2 }}>{type}</Typography>
    </Box>
  );
}

function CurrentSyncTab({ currentTab }: { currentTab: TabName }) {
  switch (currentTab) {
    case 'history':
      return <SyncHistoryTable />;
    default:
      return <UnsyncedTable type={currentTab} />
  }
}

const AdminSyncsPage: NextPage = () => {
  const [currentTab, setCurrentTab] = useState<TabName>('history');
  return (
    <UserPageTemplate title="Admin | Syncs" isAdmin maxWidth='xl'>
      {({ user }) => (
        <Grid container spacing={8}>
          <Grid item xs={12} md={3}>
            <SyncMenu currentTab={currentTab} setCurrentTab={setCurrentTab} />
          </Grid>
          <Grid item xs={12} md={9}>
            <CurrentSyncTab currentTab={currentTab} />
          </Grid>
        </Grid>
      )}
    </UserPageTemplate>
  )
}

export default AdminSyncsPage;