import { Button, Tooltip } from "@mui/material";
import { DataGrid, GridValueFormatterParams } from "@mui/x-data-grid";
import type { LetterboxdUserEntrySync } from "@rhodesjason/loxdb/dist/db/entities";
import { useRouter } from "next/router";
import { UserEntrySyncStatus } from "./UserEntrySyncStatus";

export function UserSyncsTable({ syncs }: { syncs: LetterboxdUserEntrySync[] }) {
  const router = useRouter();
  return (
    <DataGrid
      sx={{
        minHeight: 700,
        cursor: 'pointer'
      }}
      rows={syncs}
      onRowClick={({ row }) => router.push(`/admin/user-syncs/${row.id}`)}
      columns={[
        {
          field: 'id',
          headerName: 'ID',
          width: 75
        },
        {
          field: 'username',
          headerName: 'Username',
          width: 170
        },
        {
          field: 'type',
          headerName: 'Type',
          width: 100
        },
        {
          field: 'lastPageProcessed',
          headerName: 'Last Page',
          width: 80,
          align: 'center'
        },
        {
          field: 'startDate',
          headerName: 'Start Date',
          width: 135,
          valueFormatter: ({ value }: GridValueFormatterParams<string | Date>) => {
            const d = new Date(value);
            const ds = d.toLocaleDateString();
            const ts = d.toLocaleTimeString();
            return `${ds.substring(0, ds.length - 5)} ${ts}`;
          }
        },
        {
          field: 'endDate',
          headerName: 'End Date',
          width: 135,
          valueFormatter: ({ value }: GridValueFormatterParams<string | Date>) => {
            const d = new Date(value);
            const ds = d.toLocaleDateString();
            const ts = d.toLocaleTimeString();
            return `${ds.substring(0, ds.length - 5)} ${ts}`;
          }
        },
        {
          field: 'status',
          headerName: 'Status',
          width: 110,
          align: 'center',
          headerAlign: 'left',
          renderCell: ({ row }) => <UserEntrySyncStatus sync={row} />
        },
        {
          field: 'notes',
          headerName: 'Notes',
          flex: 5,
          renderCell: ({ row }) => (
            row.notes ? <Tooltip title={row.notes}><span>{row.notes}</span></Tooltip> : null
          )
        }
      ]}
    />
  )
}