
import { render, screen } from '@testing-library/react';
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

  it('should render the thread card with a comment prop as true', () => {
    const mockPropsWithIsComment = { 
      ...mockProps,
      isComment: true,
    }

    render(
      <AppRouterContextProviderMock router={{ push }}>
        <ThreadCard {...mockProps} />
      </AppRouterContextProviderMock>
    );

    expect(screen.getByText(mockPropsWithIsComment.content)).toBeInTheDocument();
    expect(screen.getByText(mockPropsWithIsComment.author.name)).toBeInTheDocument();
  });

  it('should render the thread card with empty comments array', () => {
    const mockPropsWithEmptyComments = { 
      ...mockProps,
      comments: [],
    }

    render(
      <AppRouterContextProviderMock router={{ push }}>
        <ThreadCard {...mockPropsWithEmptyComments} />
      </AppRouterContextProviderMock>
    );

    expect(screen.getByText(mockPropsWithEmptyComments.content)).toBeInTheDocument();
    expect(screen.getByText(mockPropsWithEmptyComments.author.name)).toBeInTheDocument();
   });

  it('should render the thread card with no community prop', () => {
    const mockPropsWithNoCommunity = { 
      ...mockProps,
      community: null,
    }

    render(
      <AppRouterContextProviderMock router={{ push }}>
        <ThreadCard {...mockPropsWithNoCommunity} />
      </AppRouterContextProviderMock>
    );

    expect(screen.getByText(mockPropsWithNoCommunity.content)).toBeInTheDocument();
    expect(screen.getByText(mockPropsWithNoCommunity.author.name)).toBeInTheDocument();
   });

});