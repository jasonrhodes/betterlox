import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { UserPageTemplate } from '../../components/PageTemplate';
import { Box, Button, Grid, IconButton, MenuItem, MenuList, Paper, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridValueFormatterParams } from '@mui/x-data-grid';
import { Sync } from '../../db/entities';
import { callApi, useApi } from '../../hooks/useApi';
import { SyncsManagementGetResponse, UsersApiResponse } from '../../common/types/api';
import { useCurrentUser } from '../../hooks/UserContext';
import { UserPublicSafe } from '../../common/types/db';
import { SupervisorAccount, SwitchAccessShortcut } from '@mui/icons-material';

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
  useEffect(() => {
    setTimeout(() => setRefreshes(refreshes + 1), 5000);
  }, [refreshes])
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

function UserManagementPage() {
  const response = useApi<UsersApiResponse>('/api/users?limit=250');
  return (
    <Box>
      <Typography variant="h6" sx={{ py: 2 }}>User Management</Typography>
      <ManageUsersList data={response?.data} />
    </Box>
  );
}

function ManageUsersList({ data }: { data?: UsersApiResponse }) {
  const { user: currentUser, switchUser } = useCurrentUser();

  if (data && !data.success) {
    return <Typography>{data.message}</Typography>
  }

  return (
    <DataGrid
      sx={{
        minHeight: 700
      }}
      loading={!data}
      rows={data?.users || []}
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
        },
        {
          field: 'username',
          headerName: 'Username',
          width: 200
        },
        {
          field: 'isAdmin',
          headerName: '',
          width: 100,
          sortable: false,
          renderCell: ({ row }) => row.isAdmin ? (
            <SupervisorAccount />
          ) : ''
        },
        {
          field: '',
          headerName: '',
          sortable: false,
          width: 100,
          renderCell: ({ row }) => row.id !== currentUser?.id ? (
            <IconButton onClick={() => switchUser(row.id)}><SwitchAccessShortcut /></IconButton>
          ) : ''
        }
      ]}
    />
  )
}

type TabName = 'sync-history' | 'unsynced' | 'user-management';

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
          <MenuItem sx={{ py: itemPadding }} selected={currentTab === "sync-history"} onClick={() => setCurrentTab("sync-history")}>
            <Typography>Sync History</Typography>
          </MenuItem>
          <MenuItem sx={{ py: itemPadding }} selected={currentTab === "unsynced"} onClick={() => setCurrentTab("unsynced")}>
            <Typography>Unsynced Summary</Typography>
          </MenuItem>
        </MenuList>
      </Paper>
    </>
  )
}

function UnsyncedTable({ type }: { type: Omit<TabName, 'sync-history'> }) {
  return (
    <Box>
      <Typography variant="h6" sx={{ py: 2 }}>{type}</Typography>
    </Box>
  );
}

function CurrentAdminTab({ currentTab }: { currentTab: TabName }) {
  switch (currentTab) {
    case 'sync-history':
      return <SyncHistoryTable />;
    case 'user-management':
      return <UserManagementPage />;
    default:
      return <UnsyncedTable type={currentTab} />
  }
}

const AdminPage: NextPage = () => {
  const [currentTab, setCurrentTab] = useState<TabName>('user-management');
  return (
    <UserPageTemplate title="Admin Management" isAdmin maxWidth='xl'>
      {({ user }) => (
        <Grid container spacing={8}>
          <Grid item xs={12} md={3}>
            <AdminMenu currentTab={currentTab} setCurrentTab={setCurrentTab} />
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