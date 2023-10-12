"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

export interface UserCardProps {
  id: string,
  name: string,
  username: string,
  imgUrl: string,
  userType: string
}

/**
 * Renders a user card component that displays information about a user.
 * @param id - The unique identifier of the user.
 * @param name - The name of the user.
 * @param username - The username of the user.
 * @param imgUrl - The URL of the user's avatar image.
 * @param userType - The type of the user (e.g., "regular", "admin").
 * @returns The rendered user card component.
 */
const UserCard = ({
  id,
  name,
  username,
  imgUrl,
  userType
}: UserCardProps) => {

  const router = useRouter();

  const handleButtonClick = () => {
    router.push(`/profile/${id}`);
  };

  return (
    <article className="user-card" data-testid="user-card">
      <div className="user-card_avatar" data-testid="user-card_avatar">
        <Image
          src={imgUrl}
          alt="User Avatar"
          width={48}
          height={48}
          className="rounded-full"
        />

        <div className="flex-1 text-ellipsis">
          <h4 className="text-base-semibold text-light-1">{name}</h4>
          <p className="text-small-medium text-gray-1">@{username}</p>
        </div>
      </div>

      <Button className="user-card_btn" onClick={handleButtonClick} data-testid="user-card_btn">
        View Profile
      </Button>
    </article>
  );
};

export default UserCard;