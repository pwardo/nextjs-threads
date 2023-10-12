
import { render, screen } from '@testing-library/react';
import { AppRouterContextProviderMock } from '@/lib/testUtils/app-router-context-provider-mock';
import CommunityCard, { CommunityCardProps } from '../CommunityCard';

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

const push = jest.fn();
const renderWithAppRouterContext = (props: CommunityCardProps) => {
  return render(
    <AppRouterContextProviderMock router={{ push }}>
      <CommunityCard {...props} />
    </AppRouterContextProviderMock>
  );
}

const mockProps = {
  id: "123",
  name: "Test Community",
  username: "testcommunity",
  imgUrl: "/assets/community.jpg",
  bio: "This is a test community",
  members: [
    { id: "1", image: "/assets/member1.jpg" },
    { id: "2", image: "/assets/member2.jpg" },
    { id: "3", image: "/assets/member3.jpg" }
  ]
};

describe('CommunityCard', () => {
  it('should render the community card with all required props', () => {
    renderWithAppRouterContext(mockProps);
    expect(screen.getByAltText(/Test Community community_logo/)).toBeInTheDocument();
    expect(screen.getByText(/Test Community/)).toBeInTheDocument();
    expect(screen.getByText(/@testcommunity/)).toBeInTheDocument();
    expect(screen.getByText(/This is a test community/)).toBeInTheDocument();
    expect(screen.getByText(/View/)).toBeInTheDocument();
    expect(screen.getAllByAltText(/Profile picture of member with id/)).toHaveLength(3);
  });

  it('should render the community card with no members', () => {
    renderWithAppRouterContext({...mockProps, members: [] });
    expect(screen.queryAllByAltText(/Profile picture of member with id/)).toHaveLength(0);
  });

  it('should render the community card with more than 3 members', () => {
    const mockPropsWithManyMembers = {
      ...mockProps,
      members: [
        { id: "1", image: "/assets/member1.jpg" },
        { id: "2", image: "/assets/member2.jpg" },
        { id: "3", image: "/assets/member3.jpg" },
        { id: "4", image: "/assets/member4.jpg" }
      ]
    };
    renderWithAppRouterContext(mockPropsWithManyMembers);
    expect(screen.getByText("4+ Users")).toBeInTheDocument();
  });

  it('should render the community card with a long bio', () => {
    const mockPropsWithLongBio = {
      ...mockProps,
      bio: "This is a very long bio that exceeds the character limit for the card. It should be truncated with an ellipsis.",
    };
    renderWithAppRouterContext(mockPropsWithLongBio);
    expect(screen.getByText("This is a very long bio that exceeds the character limit for the card. It should be truncated with an ellipsis.")).toBeInTheDocument();
  });
});