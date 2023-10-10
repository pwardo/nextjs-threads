import Link from "next/link";
import Image from "next/image";
import classnames from "classnames";
import { formatDateString } from "@/lib/utils";

interface Props {
  id: string;
  currentUserId: string;
  parentId: string | null;
  content: string;
  author: {
    id: string;
    name: string;
    image: string;
  };
  community: {
    id: string;
    name: string;
    image: string;
  } | null;
  createdAt: string;
  comments: {
    author: {
      image: string;
    }
  }[],
  isComment?: boolean;
}

/**
 * Renders a card representing a thread.
 *
 * @param {string} id - The ID of the thread.
 * @param {string} currentUserId - The ID of the current user.
 * @param {string | null} parentId - The ID of the parent thread, or null if it is a top-level thread.
 * @param {string} content - The content of the thread.
 * @param {object} author - An object containing the ID, name, and image of the author of the thread.
 * @param {object | null} community - An object containing the ID, name, and image of the community the thread belongs to, or null if it doesn't belong to any community.
 * @param {string} createdAt - The creation date of the thread in ISO 8601 format.
 * @param {array} comments - An array of objects representing the comments on the thread, each containing the image of the comment author.
 * @param {boolean} isComment - A flag indicating whether the thread is a comment.
 * @returns {React.Component} - The rendered thread card as a React component.
 */

const ThreadCard = ({
  id,
  currentUserId,
  parentId,
  content,
  author,
  community,
  createdAt,
  comments,
  isComment,
}: Props) => {

  const formattedDateString = formatDateString(createdAt);
  const cardClass = isComment ? `px-0 xs:px-7` : `bg-dark-2 p-7`;

  return (
    <article data-testid="thread-card" className={classnames(
      "flex w-full flex-col rounded-xl bg-dark-2 p-7",
      cardClass,
    )}>
      <div className="flex items-start justify-between">
        <div className="flex w-full flex-1 flex-row gap-4">
          <div className="flex flex-col items-center">
            <Link href={`/profile/${author.id}`} className="relative h-11 w-11">
              <Image
                src={author.image}
                alt="Profile Image"
                fill
                className="cursor-pointer rounded-full"
              />
            </Link>
            <div className="thread-card_bar" />
          </div>

          <div className='flex w-full flex-col'>
            <Link href={`/profile/${author.id}`} className="w-fit">
              <h4 className='cursor-pointer text-base-semibold text-light-1'>
                {author.name}
              </h4>
            </Link>
            <p className="mt-2 text-small-regular text-light-2">{content}</p>
            <div className={`${isComment && 'mb-10'} mt-2 flex flex-col gap-3`}>
              <div className="flex gap-3.5">
                <Image
                  src="/assets/heart-gray.svg"
                  alt="Heart Icon"
                  width={24}
                  height={24}
                  className="cursor-pointer object-contain"
                />
                <Link href={`/thread/${id}`}>
                  <Image
                    src="/assets/reply.svg"
                    alt="Reply Icon"
                    width={24}
                    height={24}
                    className="cursor-pointer object-contain"
                  />
                </Link>
                <Image
                  src="/assets/repost.svg"
                  alt="Repost Icon"
                  width={24}
                  height={24}
                  className="cursor-pointer object-contain"
                />
                <Image
                  src="/assets/share.svg"
                  alt="Share Icon"
                  width={24}
                  height={24}
                  className="cursor-pointer object-contain"
                />
              </div>

              {isComment && comments.length > 0 && (
                <Link href={`/thread/${id}`}>
                  <p className="mt-1 text-subtle-medium text-gray-1">{comments.length} replies</p>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      {!isComment && community && (
        <Link href={`/communities/${community.id}`} className="mt-5 flex items-center">
          <p className="text-subtle-medium text-gray-1">
            {formattedDateString} - {community.name} Community
          </p>
          <Image
            src={community.image}
            alt={community.name}
            width={14}
            height={14}
            className="ml-1 rounded-full object-cover"
          />
        </Link>
      )}
    </article>
  );
};

export default ThreadCard;