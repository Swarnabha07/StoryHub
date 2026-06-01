import Dashboard from "@/components/page/Dashboard";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { fetchUser } from "@/actions/useractions";
import { redirect } from "next/navigation";

const Page = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.username) {
    redirect("/");
  }

  const currentUser = await fetchUser(session.user.username);

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <Dashboard currentUser={currentUser} />
    </div>
  );
};

export default Page;
