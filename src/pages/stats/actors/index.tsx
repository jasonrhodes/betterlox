import React from 'react';
import type { NextPage } from 'next';
import { ControlledActorsTable } from '../../../components/ActorsTable';
import { PageTemplate } from '../../../components/PageTemplate';

const ActorsPage: NextPage = () => {
  return (
    <PageTemplate title="My Actors">
      <ControlledActorsTable />
    </PageTemplate>
  );
};

export default ActorsPage;