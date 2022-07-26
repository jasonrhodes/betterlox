import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { Box, Chip, Input, LinearProgress } from '@mui/material';
import { GetRatingsForUserResponse } from '../common/types/api';
import { useApi } from '../hooks/useApi';
import { UserPageTemplate } from '../components/PageTemplate';
import { RatingsTable } from '../components/RatingsTable';
import { Rating } from '../db/entities';

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function applyTitleFilter(filterString: string, ratings: Rating[]) {
  return ratings.filter((r) => {
    const spacesReplaced = filterString.replace(' ', '.*')
    const regexp = new RegExp(`.*${spacesReplaced}.*`, 'i');
    return regexp.test(r.movie?.title);
  });
}

function PageContent({ userId }: { userId: number }) {
  const [processedRatings, updateRatings] = useState<Rating[]>([]);
  const [titleFilter, updateTitleFilter] = useState<string>('');
  const { response, errorStatus } = useApi<GetRatingsForUserResponse>(
    `/api/users/${userId}/ratings`
  );
  const errorContent = <p>An error occurred while loading ratings ({errorStatus})</p>;

  useEffect(() => {
    if (!response || !response.ratings) {
      return;
    }
    if (titleFilter.length > 0) {
      const filtered = applyTitleFilter(titleFilter, response.ratings);
      updateRatings(filtered);
    } else {
      updateRatings(response.ratings)
    }
  }, [response, titleFilter])

  const handleChange = React.useCallback<React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>>((event) => {
    updateTitleFilter(escapeRegExp(event.target.value));
  }, []);

  return (
    <Box sx={{ height: 600 }}>
      <Box sx={{ marginBottom: '20px' }}>
        <Chip color="secondary" label={`Showing: ${processedRatings.length} of ${response?.ratings.length} total ratings`} sx={{ marginRight: '10px' }} />
        <Input placeholder="Filter by title" onChange={handleChange} />
      </Box>
      {response ? 
        <RatingsTable ratings={processedRatings} /> : 
        errorStatus ? 
          errorContent : <LinearProgress />
      }
    </Box>
  );
}

const RatingsPage: NextPage = () => {
  return (
    <UserPageTemplate title="My Ratings">
      {(userContext) => {
        if (!userContext.user) {
          return null;
        }
        return <PageContent userId={userContext.user.id} />
      }}
    </UserPageTemplate>
  );
};

export default RatingsPage;