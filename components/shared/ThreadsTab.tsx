import { redirect } from "next/navigation";
import ThreadCard from "../cards/ThreadCard";
import { fetchUserThreads } from "@/lib/actions/user.actions";
import { fetchCommunityThreads } from "@/lib/actions/community.actions";

export interface ThreadsTabProps {
  currentUserId: string;
  accountId: string;
  accountType: string;
};

/**
 * Renders a list of thread cards based on the account type.
 * Fetches the threads either for a user or a community using the `fetchUserThreads` or `fetchCommunityThreads` functions respectively.
 * The fetched threads are then mapped to `ThreadCard` components and rendered in a section.
 *
 * @param {string} currentUserId - The ID of the current user.
 * @param {string} accountId - The ID of the account.
 * @param {string} accountType - The type of the account, either "User" or "Community".
 * @returns {JSX.Element} - Rendered React components representing the list of thread cards.
 */
const ThreadsTab = async ({
  currentUserId,
  accountId,
  accountType
}: ThreadsTabProps) => {

  let result: any
  if(accountType === "Community") {
    result = await fetchCommunityThreads(accountId);
  } else {
    result = await fetchUserThreads(currentUserId);
  }

  if(!result) redirect("/");

  return (
    <section className='mt-9 flex flex-col gap-10'>
    {result.threads.map((thread: any) => (
      <ThreadCard
        key={thread._id}
        id={thread._id}
        currentUserId={currentUserId}
        parentId={thread.parentId}
        content={thread.content}
        author={
          accountType === "User" ? { 
              name: result.name,
              image: result.image,
              id: result.id
            } : {
              name: thread.author.name,
              image: thread.author.image,
              id: thread.author.id,
            }
        }
        community={
          accountType === "Community" ? {
            name: result.name,
            id: result.id,
            image: result.image
          } : 
          thread.community
        }
        createdAt={thread.createdAt}
        comments={thread.children}
      />
    ))}
  </section>
  )
}

export default ThreadsTab;