
import { render, screen, fireEvent } from '@testing-library/react';
import { AppRouterContextProviderMock } from '@/lib/testUtils/app-router-context-provider-mock';
import { formatDateString } from "@/lib/utils";
import ThreadCard from '../ThreadCard';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

// next Image component changes the imgUrl so need to mock it here to stop that
// https://github.com/vercel/next.js/discussions/32325#discussioncomment-3164774
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} />
  },
}));

// Required for AppRouterContextProviderMock
const push = jest.fn();

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

describe('ThreadCard', () => {
  it('should render the thread card with all required props', () => {
    render(
      <AppRouterContextProviderMock router={{ push }}>
        <ThreadCard {...mockProps} />
      </AppRouterContextProviderMock>
    );

    const formattedDateString = formatDateString(mockProps.createdAt);

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

    render(
      <AppRouterContextProviderMock router={{ push }}>
        <ThreadCard {...mockPropsWithCommunity} />
      </AppRouterContextProviderMock>
    );

    const formattedDateString = formatDateString(mockPropsWithCommunity.createdAt);
    expect(screen.getByText(formattedDateString + ' - ' + mockPropsWithCommunity.community.name + ' Community')).toBeInTheDocument();
  });

  it('should render the thread card with a comment prop', () => {
    const mockPropsWithCommunity = { 
      ...mockProps,
      community: {
        id: "789",
        name: "Tech Community",
        image: "/assets/community.jpg",
      },
      isComment: true,
    }
    
    render(
      <AppRouterContextProviderMock router={{ push }}>
        <ThreadCard {...mockProps} />
      </AppRouterContextProviderMock>
    );

    expect(screen.getByText(mockPropsWithCommunity.content)).toBeInTheDocument();
    expect(screen.getByText(mockPropsWithCommunity.author.name)).toBeInTheDocument();
  });
});