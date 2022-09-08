import { LinearProgress } from "@mui/material";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { LetterboxdListsForUserApiResponse } from "../common/types/api";
import { UserResponse } from "../common/types/db";
import { MyLists } from "../components/lists/MyLists";
import { MyTrackedLists } from "../components/lists/TrackedLists";
import { UserPageTemplate } from "../components/PageTemplate";
import { TabNavPage } from "../components/TabNavPage";
import { LetterboxdList } from "../db/entities";
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
      content: <MyLists />
    },
    {
      label: 'Followed Lists',
      content: <>Following these ones</>
    },
    {
      label: 'Explore',
      content: <>Explore will be where you add other people's lists and search through all the Lox-loaded lists for ones to follow or track</>
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
    />
  );
}

export default ListsPage;

