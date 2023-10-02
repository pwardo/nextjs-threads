import { fetchUserThreads } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import ThreadCard from "../cards/ThreadCard";
import { fetchCommunityThreads } from "@/lib/actions/community.actions";

interface Props {
  currentUserId: string;
  accountId: string;
  accountType: string;
};

const ThreadsTab = async ({
  currentUserId,
  accountId,
  accountType
}: Props) => {

  let result: any
  if(accountType === "Community") {
    result = await fetchCommunityThreads(accountId);
  } else {
    result = await fetchUserThreads(currentUserId);
  }
  console.log("accountType:::: ", accountType);
  console.log("result:::: ", result);

  if(!result) redirect("/")

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