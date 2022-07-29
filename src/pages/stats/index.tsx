import React from 'react';
import type { NextPage } from 'next';
import { PageTemplate } from '../../components/PageTemplate';
import { AppLink } from '../../components/AppLink';

const StatsPage: NextPage = () => {
  return (
    <PageTemplate title="My Stats">
      <ul>
        <li><AppLink href="/stats/actors">By Actor</AppLink></li>
      </ul>
    </PageTemplate>
  );
}
  
export default StatsPage;