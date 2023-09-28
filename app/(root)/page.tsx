import { fetchThreads } from "@/lib/actions/thread.actions";
import { currentUser } from "@clerk/nextjs";
import ThreadCard from "@/components/cards/ThreadCard";

export default async function Home() {
  const response = await fetchThreads(1, 30);
  const user = await currentUser();

  return (
    <>
      <h1 className="head-text text-left">Home</h1>
      <section className="mt-9 flex flex-col gap-10">
        {response?.threads.length === 0 ? (
            <p className="no-result">No threads found</p>
          ) : (
            <>
              {
                response?.threads.map((thread) => (
                  <ThreadCard
                    id={thread._id}
                    key={thread._id}
                    currentUserId={user?.id || ""}
                    parentId={thread.parentId}
                    content={thread.content}
                    author={thread.author}
                    community={thread.community}
                    createdAt={thread.createdAt}
                    comments={thread.children}
                  />
                ))
              }
            </>
          )}
      </section>
    </>
  )
}
