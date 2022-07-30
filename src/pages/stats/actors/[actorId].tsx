import React, { useState } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { MoviesForActorTable } from '../../../components/MoviesForActorTable';
import { useApi } from '../../../hooks/useApi';
import { PageTemplate } from '../../../components/PageTemplate';
import { GetMoviesForActorAndUserResponse } from '../../../common/types/api';
import { LinearProgress } from '@mui/material';

const ActorsPage: NextPage = () => {
  const router = useRouter();
  const { actorId } = router.query;
  const singleActorId = Array.isArray(actorId) ? actorId[0] : actorId;
  const [castOrderThreshold, setCastOrderThreshold] = useState(15);
  const url = `/api/users/1/actors/${singleActorId}?castOrderThreshold=${castOrderThreshold}`;

  const response = useApi<GetMoviesForActorAndUserResponse>(url, [castOrderThreshold, actorId]);

  let title = "";
  let content: React.ReactElement;

  if (!response) {
    title = "Actor: Loading";
    content = <LinearProgress />;
  }

  else if (!response.success) {
    title = "Actor: Error";
    content = <p>An error ({response.status}) occurred. Please try again.</p>;
  }

  else {
    const { data } = response;
    title = `${data.actor.name}`;
    content = (
      <MoviesForActorTable
        castOrderThreshold={castOrderThreshold}
        setCastOrderThreshold={setCastOrderThreshold}
        credits={data.cast_credits}
        ratings={data.ratings}
      />
    );
  }

  return (
    <PageTemplate title={title} avatarUrl={response?.data?.actor.profilePath} backLink={{ url: "/stats/actors", text: "Back to actors" }}>  
      {content}
    </PageTemplate>
  );
};

export default ActorsPage;