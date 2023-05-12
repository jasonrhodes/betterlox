import { NextPage } from "next";
import { UserPageTemplate } from "../../../components/PageTemplate";
import { useRouter } from "next/router";

const AdminViewSyncPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  return (
    <UserPageTemplate title="Admin | View Sync" isAdmin maxWidth='lg'>
      {() => (
        <p>Hello from a view sync page. This page is for sync ID: {id}.</p>
      )}
    </UserPageTemplate>
  )
}
  
export default AdminViewSyncPage;