import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { UserPageTemplate } from '../../components/PageTemplate';
import { Box, Button, Divider, FormControlLabel, Grid, IconButton, LinearProgress, MenuItem, MenuList, Paper, Switch, SxProps, ToggleButton, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridValueFormatterParams } from '@mui/x-data-grid';
import type { Sync, LetterboxdUserEntrySync } from "@rhodesjason/loxdb/dist/db/entities";
import { callApi, useApi } from '../../hooks/useApi';
import { ApiErrorResponse, SyncsManagementGetResponse, UserSyncsApiResponse, UserSyncsGetSuccessResponse, UsersApiResponse } from "../../common/types/api";
import { useCurrentUser } from '../../hooks/UserContext';
import { CloudDone, HelpCenter, HourglassTop, LockClock, Schedule, SupervisorAccount, Sync as SyncIcon, SyncProblem } from '@mui/icons-material';
import { UserSyncsTable } from '../../components/UserSyncsTable';
import { AppLink } from '../../components/AppLink';
import { useRouter } from 'next/router';
import { LetterboxdUserEntrySyncStatus, LetterboxdUserEntrySyncType } from '@rhodesjason/loxdb/dist/common/types/db';
import { UserEntrySyncStatus } from '../../components/UserEntrySyncStatus';

async function forceFailSync(id: number) {
  return callApi(`/api/syncs/${id}`, {
    method: 'PATCH',
    data: {
      status: 'Failed'
    }
  });
}

function SyncHistoryTable() {
  const router = useRouter();
  const [syncs, setSyncs] = useState<Sync[]>([]);
  const [refreshes, setRefreshes] = useState<number>(0);
  useEffect(() => {
    async function retrieve() {
      const { data } = await callApi<SyncsManagementGetResponse>(`/api/syncs`);
      setSyncs(data.syncs);
    }
    retrieve();
  }, [refreshes]);
  useEffect(() => {
    setTimeout(() => setRefreshes(refreshes + 1), 5000);
  }, [refreshes])
  return (
    <Box>
      <Typography variant="h6" sx={{ py: 2 }}>Sync History</Typography>
      <DataGrid
        sx={{
          minHeight: 700,
          cursor: 'pointer'
        }}
        onRowClick={({ row }) => router.push(`/admin/syncs/${row.id}`)}
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
            width: 200
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
            field: 'secondaryId',
            headerName: 'Note',
            width: 150
          },
          {
            field: '',
            headerName: '',
            width: 100,
            renderCell: ({ row }) => (row.status === "In Progress" || row.status === "Pending") ? (
              <Button onClick={() => forceFailSync(row.id)}>Force Fail</Button>
            ) : null
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

function UserManagementPage() {
  const response = useApi<UsersApiResponse>('/api/users?limit=250&includeEntrySyncs=true');
  return (
    <Box>
      <Typography variant="h6" sx={{ py: 2 }}>User Management</Typography>
      <ManageUsersList data={response?.data} />
    </Box>
  );
}


function ManageUsersList({ data }: { data?: UsersApiResponse }) {
  const router = useRouter();
  const { user: currentUser, switchUser } = useCurrentUser();

  if (data && !data.success) {
    return <Typography>{data.message}</Typography>
  }

  return (
    <DataGrid
      sx={{
        minHeight: 700,
        cursor: 'pointer'
      }}
      loading={!data}
      rows={data?.users || []}
      onRowClick={({ row }) => router.push(`/admin/users/${row.username}`)}
      columns={[
        {
          field: 'id',
          headerName: 'ID',
          width: 75
        },
        {
          field: 'name',
          headerName: 'Name',
          width: 200
          // renderCell: ({ row }) => (
          //   <AppLink href={`/admin/users/${row.username}`}>{row.username}</AppLink>
          // )
        },
        {
          field: 'username',
          headerName: 'Username',
          width: 200
        },
        {
          field: 'lastLogin',
          headerName: 'Last Login',
          width: 200,
          renderCell: ({ row }) => (
            !row.lastLogin ? null : (new Date(row.lastLogin)).toLocaleString()
          )
        },
        {
          field: 'letterboxdEntrySyncs',
          headerName: 'Last Full Sync',
          width: 150,
          headerAlign: 'center',
          align: 'center',
          renderCell: ({ row }) => {
            const fullSyncs = row.letterboxdEntrySyncs.filter((s) => s.type = LetterboxdUserEntrySyncType.FULL)
            const latestFull = fullSyncs.reduce<LetterboxdUserEntrySync | null>((latest, sync) => {
              if (!latest || !latest.startDate) {
                return sync.startDate === undefined ? null : sync;
              }
              if (sync.startDate === undefined) {
                return latest;
              }
              const latestStart = new Date(latest.startDate);
              const thisStart = new Date(sync.startDate);
              return latestStart.getTime() > thisStart.getTime() ? latest : sync;
            }, null);

            return <UserEntrySyncStatus sync={latestFull} />;
          }
        },
        {
          field: 'isAdmin',
          headerName: '',
          sortable: false,
          align: 'right',
          flex: 5,
          renderCell: ({ row }) => row.isAdmin ? (
            <SupervisorAccount />
          ) : ''
        }
        // {
        //   field: '',
        //   headerName: '',
        //   sortable: false,
        //   width: 100,
        //   renderCell: ({ row }) => row.id !== currentUser?.id ? (
        //     <IconButton onClick={() => switchUser(row.id)}><SwitchAccessShortcut /></IconButton>
        //   ) : ''
        // }
      ]}
    />
  )
}

type TabName = 'system-syncs' | 'user-syncs' | 'user-management';

function AdminMenu({ currentTab, setCurrentTab }: { currentTab: TabName, setCurrentTab: (t: TabName) => void }) {
  const itemPadding = 1.5;
  return (
    <>
      <Typography variant="h6" sx={{ py: 2 }}>Sync Management</Typography>
      <Paper sx={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}>
        <MenuList>
          <MenuItem sx={{ py: itemPadding }} selected={currentTab === "user-management"} onClick={() => setCurrentTab("user-management")}>
            <Typography>User Management</Typography>
          </MenuItem>
          <MenuItem sx={{ py: itemPadding }} selected={currentTab === "user-syncs"} onClick={() => setCurrentTab("user-syncs")}>
            <Typography>User Entry Syncs</Typography>
          </MenuItem>
          <MenuItem sx={{ py: itemPadding }} selected={currentTab === "system-syncs"} onClick={() => setCurrentTab("system-syncs")}>
            <Typography>System Syncs</Typography>
          </MenuItem>
        </MenuList>
      </Paper>
    </>
  )
}

function UserEntrySyncs() {
  const [syncs, setSyncs] = useState<LetterboxdUserEntrySync[]>([]);
  const [refreshes, setRefreshes] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  useEffect(() => {
    async function retrieve() {
      setIsRefreshing(true);
      const { data } = await callApi<UserSyncsGetSuccessResponse | ApiErrorResponse>(`/api/user-syncs`);
      if (data.success) {
        setSyncs(data.syncs);
      }
      setIsRefreshing(false);
    }
    if (autoRefresh) {
      retrieve();
    }
  }, [refreshes, autoRefresh]);

  useEffect(() => {
    setTimeout(() => setRefreshes(refreshes > 100000 ? 0 : refreshes + 1), 5000);
  }, [refreshes])

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ lg: { width: '50%' }}}>
          <Typography variant="h6">User Entry Syncs</Typography>
        </Box>
        <Box sx={{ lg: { width: '50%' }}}>
          <FormControlLabel label="Auto-refresh?" control={<Switch onChange={() => setAutoRefresh(!autoRefresh) } checked={autoRefresh} />} />
        </Box>
      </Box>
      <UserSyncsTable syncs={syncs} />
    </Box>
  )
}

function CurrentAdminTab({ currentTab }: { currentTab: TabName }) {
  switch (currentTab) {
    case 'system-syncs':
      return <SyncHistoryTable />;
    case 'user-management':
      return <UserManagementPage />;
    case 'user-syncs':
      return <UserEntrySyncs />;
    default:
      return <Box><Typography variant="h6">No Tab Selected OOPSIES</Typography></Box>;
  }
}

const validTabs: TabName[] = ['system-syncs', 'user-management', 'user-syncs'];

function isValidTabName(queryParam: string | string[] | undefined): queryParam is TabName {
  if (!queryParam || Array.isArray(queryParam)) {
    return false;
  }

  return validTabs.includes(queryParam as TabName);
}

const AdminPage: NextPage = () => {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState<TabName>(isValidTabName(router.query.tab) ? router.query.tab : 'user-management');
  
  function setCurrentTabAndUpdateQueryString(tab: TabName) {
    router.query = { ...router.query, tab };
    setCurrentTab(tab);
    router.push(router);
  }
  
  return (
    <UserPageTemplate title="Admin Management" isAdmin maxWidth='xl'>
      {({ user }) => (
        <Grid container spacing={8}>
          <Grid item xs={12} md={3}>
            <AdminMenu currentTab={currentTab} setCurrentTab={setCurrentTabAndUpdateQueryString} />
          </Grid>
          <Grid item xs={12} md={9}>
            <CurrentAdminTab currentTab={currentTab} />
          </Grid>
        </Grid>
      )}
    </UserPageTemplate>
  )
}

export default AdminPage;