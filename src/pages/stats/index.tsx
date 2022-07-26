import React from 'react';
import type { NextPage } from 'next';
import Link from 'next/link';
import { PageTemplate } from '../../components/PageTemplate';

const StatsPage: NextPage = () => {
  return (
    <PageTemplate title="My Stats">
      <ul>
        <li><Link href="/stats/actors">By Actor</Link></li>
      </ul>
    </PageTemplate>
  );
}
  
export default StatsPage;