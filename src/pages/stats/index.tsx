import React, { useState } from 'react';
import type { NextPage } from 'next';
import { UserPageTemplate } from '../../components/PageTemplate';
import { StatMode } from '../../common/types/api';
import { StatModeToggle } from '../../components/stats/StatModeToggle';
import { StatsTab } from '../../components/stats/StatsTab';
import { TabNavPage } from '../../components/TabNavPage';

const StatsPage: NextPage = () => {
  const [mode, setMode] = useState<StatMode>('favorite');

  function toggleStatMode() {
    setMode(mode === 'favorite' ? 'most' : 'favorite');
  }

  return (
    <UserPageTemplate 
      title="My Stats" 
      titleLineRightContent={<StatModeToggle mode={mode} toggleMode={toggleStatMode} />}
    >
      {() => (
        <TabNavPage
          tabs={[
            {
              label: 'Actors',
              content: <StatsTab type="actors" mode={mode} />
            },
            {
              label: 'Directors',
              content: <StatsTab type="directors" mode={mode} />
            },
            {
              label: 'Cinematographers',
              content: <StatsTab type="cinematographers" mode={mode} />
            },
            {
              label: 'Editors',
              content: <StatsTab type="editors" mode={mode} />
            }
          ]}
        />
      )}
    </UserPageTemplate>
  );
}
  
export default StatsPage;