import React, { useState } from 'react';
import type { NextPage } from 'next';
import { ActorsTable } from '../../../components/ActorsTable';
import { PageTemplate } from '../../../components/PageTemplate';
import { GetActorsForUserResponse } from '../../../common/types/api';
import CreditControls from '../../../components/CreditControls';
import { useApi } from '../../../hooks/useApi';
import { Box, LinearProgress, Typography } from '@mui/material';

const ActorsPage: NextPage = () => {
  const [castOrderThreshold, setCastOrderThreshold] = useState(15);
  const url = `/api/users/1/actors?castOrderThreshold=${castOrderThreshold}`;
  // const { response, errorStatus } = useApi<GetActorsForUserResponse>(url, [castOrderThreshold]);
  // const errorContent = <p>An error occurred while loading actors ({errorStatus})</p>;

  // console.log(response && response.actors);

  return (
    <PageTemplate title="My Actors">
      <Box maxWidth="lg" sx={{ height: 600 }}>
        <CreditControls castOrderThreshold={castOrderThreshold} setCastOrderThreshold={setCastOrderThreshold} />
        <Typography>Coming soon :)</Typography>
        {/* {response ?
          <ActorsTable actors={response.actors} /> : 
          errorStatus ? 
            errorContent : 
            <LinearProgress />
        } */}
      </Box>
    </PageTemplate>
  );
}

export default ActorsPage;