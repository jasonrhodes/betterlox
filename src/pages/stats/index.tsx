import React, { useState } from 'react';
import type { NextPage } from 'next';
import { UserPageTemplate } from '../../components/PageTemplate';
import { StatModeToggle } from '../../components/stats/StatModeToggle';
import { StatsTab } from '../../components/stats/StatsTab';
import { TabNavPage } from '../../components/TabNavPage';
import { StatMode } from '@rhodesjason/loxdb/dist/common/types/db';

const StatsPage: NextPage = () => {
  const [mode, setMode] = useState<StatMode>('favorite');
  const [value, setValue] = useState<number>(0);

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
          value={value}
          setValue={setValue}
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
              label: 'Writers',
              content: <StatsTab type="writers" mode={mode} />
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