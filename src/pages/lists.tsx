import { Typography } from "@mui/material";
import { NextPage } from "next";
import { UserPageTemplate } from "../components/PageTemplate";

function PageContent({ userId }: { userId: number }) {
  return <Typography>Coming Soon</Typography>
}

const ListsPage: NextPage = () => {
  return (
    <UserPageTemplate title="My Lists">
      {(userContext) => {
        if (!userContext.user) {
          return null;
        }
        return <PageContent userId={userContext.user.id} />
      }}
    </UserPageTemplate>
  );
};

export default ListsPage;