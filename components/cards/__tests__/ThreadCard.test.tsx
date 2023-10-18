
import { render, screen } from '@testing-library/react';
import { AppRouterContextProviderMock } from '@/lib/testUtils/appRouterContextProviderMock';
import { formatDateString } from "@/lib/utils";
import ThreadCard, { ThreadCardProps } from '../ThreadCard';

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
  currentUserId: "123",
  parentId: null,
  content: "This is a thread card",
  author: {
    id: "456",
    name: "John Doe",
    image: "/assets/profile.jpg",
  },
  community: null,
  createdAt: "2022-01-01T12:00:00Z",
  comments: [
    {
      author: {
        image: "/assets/profile.jpg",
      },
    },
    {
      author: {
        image: "/assets/profile.jpg",
      },
    },
  ],
  isComment: false,
}

const push = jest.fn();
const renderWithAppRouterContext = (props: ThreadCardProps) => {
  return render(
    <AppRouterContextProviderMock router={{ push }}>
      <ThreadCard {...props} />
    </AppRouterContextProviderMock>
  );
}

describe('ThreadCard', () => {
  it('should render the thread card with all required props', () => {
    renderWithAppRouterContext(mockProps);
    expect(screen.getByText(mockProps.content)).toBeInTheDocument();
    expect(screen.getByText(mockProps.author.name)).toBeInTheDocument();
  });

  it('should render the thread card with a community prop', () => {
    const mockPropsWithCommunity = { 
      ...mockProps,
      community: {
        id: "789",
        name: "Tech Community",
        image: "/assets/community.jpg",
      }
    }
    renderWithAppRouterContext(mockPropsWithCommunity);
    const formattedDateString = formatDateString(mockPropsWithCommunity.createdAt);
    expect(screen.getByText(formattedDateString + ' - ' + mockPropsWithCommunity.community.name + ' Community')).toBeInTheDocument();
  });

  it('should render the thread card with a comment prop as true', () => {
    renderWithAppRouterContext({...mockProps, isComment: true });
    expect(screen.getByText(mockProps.content)).toBeInTheDocument();
    expect(screen.getByText(mockProps.author.name)).toBeInTheDocument();
  });

  it('should render the thread card with empty comments array', () => {
    renderWithAppRouterContext({...mockProps, comments: []});
    expect(screen.getByText(mockProps.content)).toBeInTheDocument();
    expect(screen.getByText(mockProps.author.name)).toBeInTheDocument();
   });

  it('should render the thread card with no community prop', () => {
    renderWithAppRouterContext({...mockProps, community: null});
    expect(screen.getByText(mockProps.content)).toBeInTheDocument();
    expect(screen.getByText(mockProps.author.name)).toBeInTheDocument();
   });

});