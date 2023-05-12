import { NextPage } from "next";
import { UserPageTemplate } from "../../../components/PageTemplate";
import { useRouter } from "next/router";
import { callApi, useApi } from "../../../hooks/useApi";
import { ApiErrorResponse, UserApiResponse, UserSyncsApiResponse } from "../../../common/types/api";
import { Alert, Box, Button, Typography } from "@mui/material";
import { useState } from "react";
import { LetterboxdUserEntrySyncType } from "@rhodesjason/loxdb/dist/common/types/db";
import { singleQueryParam } from "@rhodesjason/loxdb/dist/lib/queryParams";
import { LoadingButton } from "@mui/lab";
import { Sync } from "@mui/icons-material";
import axios from "axios";

interface AxiosErrorWithData {
  response: {
    data: ApiErrorResponse
  }
}

function isAxiosApiError(value: any): value is AxiosErrorWithData {
  if (!axios.isAxiosError(value)) {
    return false;
  }
  if (!value.response) {
    return false;
  }
  if (!value.response.data) {
    return false;
  }
  if (typeof value.response.data !== "object") {
    return false;
  }
  if (value.response.data === null) {
    return false;
  }

  const keys = Object.keys(value.response.data);
  if (!keys.includes('message')) {
    return false;
  }

  if (!keys.includes('success')) {
    return false;
  }

  return true;
}

const AdminViewUserPage: NextPage = () => {
  const [isRequesting, setIsRequesting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const router = useRouter();
  const username = singleQueryParam(router.query.username)

  async function requestFullSync() {
    setIsRequesting(true);
    try {
      const result = await callApi<UserSyncsApiResponse>('/api/user-syncs', {
        method: 'POST',
        data: {
          type: LetterboxdUserEntrySyncType.FULL,
          username 
        }
      });
      setIsRequesting(false);
      if (!result.success || !result.data.success) {
        throw new Error(result.data.message);
      }
      setSuccessMessage('Full sync successfully requested');
    } catch (error: unknown) {
      setIsRequesting(false);
      let message: string = String(error);
      if (isAxiosApiError(error)) {
        message += ' -- ' + error.response.data.message;
      }
      setErrorMessage(`Request failed - ${message}`);
    }
  }

  const result = useApi<UserApiResponse>(`/api/users/${username}`, [username]);

  return (
    <UserPageTemplate title={`Admin | View User: ${username}`} isAdmin maxWidth='lg'>
      {() => (result === null || !result.data || !result.data.success) ? null : (
        <Box>
          <Box sx={{ marginBottom: '1em' }}>
            <Typography>Hello from a view user page. This page is for user: {username}.</Typography>
          </Box>
          <Box>
            {successMessage ? <Alert severity="success" onClose={() => setSuccessMessage(null)}>{successMessage}</Alert> : null}
            {errorMessage ? <Alert severity="error" onClose={() => setErrorMessage(null)}>{errorMessage}</Alert> : null}
          </Box>
          <Box sx={{ marginTop: '1em' }}>
            <LoadingButton
              loading={isRequesting}
              loadingPosition="start"
              startIcon={<Sync />}
              variant="contained"
              onClick={() => requestFullSync()}
            >
              Request Full Letterboxd Sync
            </LoadingButton>
          </Box>
          <pre>
            <code>
              {JSON.stringify(result.data.user, null, 2)}
            </code>
          </pre>
        </Box>
      )}
    </UserPageTemplate>
  )
}
  
export default AdminViewUserPage;