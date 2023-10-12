import { render, screen, fireEvent } from '@testing-library/react';
import { AppRouterContextProviderMock } from '@/lib/testUtils/app-router-context-provider-mock';
import UserCard, { UserCardProps } from '../UserCard';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

// next Image component changes the imgUrl so need to mock it here to stop that
// https://github.com/vercel/next.js/discussions/32325#discussioncomment-3164774
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    const propsCopy = props?.fill ? {...props, fill: "true" } : props; // Fix for the warning: Received `true` for a non-boolean attribute `fill`.
    return <img {...propsCopy} />
  },
}));

const mockProps = {
  id: "1",
  name: "John Doe",
  username: "johndoe",
  imgUrl: "https://example.com/avatar.jpg",
  userType: "User",
}

const push = jest.fn();
const renderWithAppRouterContext = (props: UserCardProps) => {
  return render(
    <AppRouterContextProviderMock router={{ push }}>
      <UserCard {...props} />
    </AppRouterContextProviderMock>
  );
}

describe('UserCard', () => {
  beforeEach(() => {
    renderWithAppRouterContext(mockProps);
  });

  it('should render user card with correct name, username, and avatar image', () => {
    expect(screen.getByText(mockProps.name)).toBeInTheDocument();
    expect(screen.getByText(`@${mockProps.username}`)).toBeInTheDocument();
    expect(screen.getByAltText("User Avatar")).toHaveAttribute("src", mockProps.imgUrl);
  });

  it('should navigate to correct profile page when "View Profile" button is clicked', () => {
    fireEvent.click(screen.getByText("View Profile"));
    expect(push).toHaveBeenCalledWith(`/profile/${mockProps.id}`);
  });

  it('should render UserCard component with correct styling', () => {
    expect(screen.getByTestId("user-card")).toHaveClass("user-card");
    expect(screen.getByTestId("user-card_avatar")).toHaveClass("user-card_avatar");
    expect(screen.getByTestId("user-card_btn")).toHaveClass("user-card_btn");
  });
});
