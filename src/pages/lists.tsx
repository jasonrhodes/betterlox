import { Alert, LinearProgress } from "@mui/material";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { LetterboxdListsForUserApiResponse } from "@rhodesjason/loxdb/dist/common/types/api";
import { UserResponse } from "@rhodesjason/loxdb/dist/common/types/db";
import { AddList } from "../components/lists/AddList";
import { ListsList } from "../components/lists/ListsList";
import { MyTrackedLists } from "../components/lists/TrackedLists";
import { UserPageTemplate } from "../components/PageTemplate";
import { TabNavPage } from "../components/TabNavPage";
import { LetterboxdList } from "@rhodesjason/loxdb/dist/db/entities";
import { callApi } from "../hooks/useApi";

const ListsPage: NextPage = () => {
  // const tracked = useApi(``)
  return (
    <UserPageTemplate title="Lists">
      {({ user }) => <PageContent user={user} />}
    </UserPageTemplate>
  );
};

function PageContent({ user }: { user: UserResponse }) {
  const [tracked, setTracked] = useState<LetterboxdList[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [value, setValue] = useState<number>(0);

  useEffect(() => {
    async function retrieve() {
      if (!user) {
        return;
      }
      setIsLoading(true);
      const response = await callApi<LetterboxdListsForUserApiResponse>(`/api/users/${user.id}/lists/tracking`);
      if (response.data?.success && 'lists' in response.data) {
        setTracked(response.data.lists);
      }
      setIsLoading(false);
    }
    retrieve();
  }, [user]);

  const tabs = [
    {
      label: 'My Lists',
      content: <ListsList scope="user-owned" />
    },
    {
      label: 'Followed Lists',
      content: <ListsList scope="user-following" />
    },
    {
      label: 'Explore',
      content: <ListsList scope="all" />
    },
    {
      label: 'Import List',
      content: <AddList user={user} />
    }
  ];

  if (isLoading || tracked === null) {
    return <LinearProgress />;
  }

  if (tracked.length > 0) {
    tabs.unshift({
      label: 'List Stats',
      content: <MyTrackedLists />
    });
  }

  return (
    <TabNavPage
      tabs={tabs}
      value={value}
      setValue={setValue}
    />
  );
}

export default ListsPage;

