import Image from "next/image";
import Link from "next/link";

export interface ProfileHeaderProps {
  accountId: string;
  authUserId: string;
  name: string;
  username: string;
  imgUrl: string;
  bio: string;
  type: "User" | "Community";
}

/**
 * Renders a user's profile header.
 * 
 * @component
 * 
 * @param {string} accountId - The ID of the user's account.
 * @param {string} authUserId - The ID of the authenticated user.
 * @param {string} name - The name of the user.
 * @param {string} username - The username of the user.
 * @param {string} imgUrl - The URL of the user's profile picture.
 * @param {string} bio - The bio of the user.
 * @param {("User" | "Community")} [type="User"] - The type of the user. Defaults to "User".
 * 
 * @returns {JSX.Element} The rendered profile header component.
 */
const ProfileHeader = ({
  accountId,
  authUserId,
  name,
  username,
  imgUrl,
  bio,
  type = "User"
}: ProfileHeaderProps) => {
  return (
    <section className="flex w-full flex-col justify-start">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-20 h-20 object-cover">
            <Image
              src={imgUrl}
              alt={`Profile picture of ${name}`}
              fill
              className="rounded-full object-cover shadow-2xl"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-left text-heading3-bold text-light-1">{name || 'Name'}</h2>
            <p className="text-base-medium text-gray-1">@{username || 'Username'}</p>
          </div>
        </div>
        {accountId === authUserId && type !== "Community" && (
          <Link href='/profile/edit'>
            <a className='flex cursor-pointer gap-3 rounded-lg bg-dark-3 px-4 py-2'>
              <Image
                src='/assets/edit.svg'
                alt='edit profile'
                width={16}
                height={16}
              />
              <p className='text-light-2 max-sm:hidden'>Edit</p>
            </a>
          </Link>
        )}
      </div>
      <p className="mt-6 max-w-lg text-base-regular text-light-2">{bio}</p>
      <div className="mt-12 h-0.5 w-full bg-dark-3" />
    </section>
  )
};

export default ProfileHeader;