import { Alert, AlertColor, Box, Button, TextField } from "@mui/material";
import { useCallback, useState } from "react";
import { string } from "yup";
import { LetterboxdListsManagementApiResponse } from "../../common/types/api";
import { UserResponse } from "../../common/types/db";
import { callApi } from "../../hooks/useApi";
import { getErrorAsString } from "../../lib/getErrorAsString";

const letterboxdListRegex = new RegExp(/^https?:\/\/letterboxd.com\/([a-z0-9_]*)\/list\/([^\/]*)\/?$/);

interface PostSubmitState {
  severity: AlertColor; 
  message: string;
}

export function AddList({ user }: { user: UserResponse }) {
  const [value, setValue] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [postSubmitState, setPostSubmitState] = useState<PostSubmitState | null>(null);

  const handleSubmit = useCallback(async () => {
    setPostSubmitState(null);
    if (letterboxdListRegex.test(value)) {
      setIsLoading(true);
      try {
        const response = await callApi<LetterboxdListsManagementApiResponse>('/api/lists/letterboxd', {
          method: 'POST',
          data: {
            url: value
          }
        });

        if (response.data.success) {
          const parts = value.split('/');
          const title = ('list' in response.data) ? response.data.list.title : `${parts[3]}/${parts[5]}`;
          setPostSubmitState({
            severity: 'success',
            message: `List successfully imported: [${title}]`
          });
          setValue('');
        } else {
          setPostSubmitState({
            severity: 'error',
            message: 'List import failed'
          });
        }
      } catch (error: unknown) {
        setPostSubmitState({
          severity: 'error',
          message: getErrorAsString(error)
        });
      }
      setIsLoading(false);
    } else {
      setError('Invalid list URL, format must be https://letterboxd.com/{username}/list/{list-name}');
    }
  }, [value]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    setError('');
    if (event.key === "Enter") {
      handleSubmit();
    }
    if (event.key === "Escape") {
      setValue('');
    }
  }, [handleSubmit, setValue]);

  return (
    <Box>
      <PostSubmitMessage state={postSubmitState} />
      <TextField
        label="Add a Letterboxd list by URL"
        value={value}
        variant="filled"
        placeholder="https://letterboxd.com/{username}/list/{list-name}"
        helperText={error ? error : null}
        error={Boolean(error)}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        sx={{
          width: "100%",
          mb: 2
        }}
      />
      <Box>
        <Button disabled={isLoading} variant="contained" onClick={handleSubmit}>{isLoading ? "Importing..." : "Import"}</Button>
      </Box>
      
    </Box>
  )
}

function PostSubmitMessage({ state }: { state: PostSubmitState | null }) {
  if (state === null) {
    return null;
  }

  return <Alert sx={{ my: 2 }} severity={state.severity}>{state.message}</Alert>;
}