import UserCard from "@/components/cards/UserCard";
import Pagination from "@/components/shared/Pagination";
import Searchbar from "@/components/shared/SearchBar";
import { fetchUser, fetchUsers } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo) return redirect("/onboarding");

  // fetch users
  const result = await fetchUsers({
    userId: user.id,
    searchString: searchParams?.q,
    pageNumber: 1,
    pageSize: 20,
    sortOrder: 'desc'
  });

  return (
    <section>
      <h1 className="head-text mb-10">Search</h1>

      <Searchbar routeType='search' />

      <div className="mt-14 flex flex-col gap-9">
        {result.users.length === 0 ? (
          <p className="no-result">No result found</p>
        ) : (
          <>
            {result.users.map((user) => (
              <UserCard
                key={user.id}
                id={user.id}
                name={user.name}
                username={user.username}
                imgUrl={user.image}
                userType="User"
              />
            ))}
          </>
        )}
      </div>
      <Pagination
        path='search'
        pageNumber={searchParams?.page ? +searchParams.page : 1}
        isNext={result.isNext}
      />
    </section>
  )
}

export default Page