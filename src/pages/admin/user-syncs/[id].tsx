import { NextPage } from "next";
import { UserPageTemplate } from "../../../components/PageTemplate";
import { useRouter } from "next/router";
import { useApi } from "../../../hooks/useApi";
import { UserSyncApiResponse } from "../../../common/types/api";
import { Box } from "@mui/material";

const AdminViewUserEntrySyncPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const result = useApi<UserSyncApiResponse>(`/api/user-syncs/${id}`, [id]);
  
  return (
    <UserPageTemplate title={`Admin | View User Entry Sync: ${id}`} isAdmin maxWidth='lg'>
      {() => (result === null || !result.data || !result.data.success) ? null : (
        <Box>
          <p>Hello from a view user entry sync page. This page is for sync ID: {id}.</p>
          <pre>
            <code>
              {JSON.stringify(result.data.sync, null, 2)}
            </code>
          </pre>
        </Box>
      )}
    </UserPageTemplate>
  )
}
  
export default AdminViewUserEntrySyncPage;