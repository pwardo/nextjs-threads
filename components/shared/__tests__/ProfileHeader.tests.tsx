import { screen, fireEvent, render } from '@testing-library/react';
import { AppRouterContextProviderMock } from '@/lib/testUtils/app-router-context-provider-mock';
import ProfileHeader, { ProfileHeaderProps } from '../ProfileHeader';

jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: () => jest.fn(),
      replace: () => jest.fn(),
    };
  },
  usePathname() {
    return jest.fn();
  },
}));

const mockProps = {
  accountId: '123',
  authUserId: '123',
  name: 'John Doe',
  username: 'johndoe',
  imgUrl: '/profile.jpg',
  bio: 'Lorem ipsum dolor sit amet',
  type: 'User'
};

const renderWithAppRouterContext = (props: ProfileHeaderProps) => {
  const push = jest.fn();
  return render(
    <AppRouterContextProviderMock router={{ push }}>
      <ProfileHeader {...props} />
    </AppRouterContextProviderMock>
  );
}

describe('ProfileHeader', () => {

  it('should render profile header with edit button for authenticated user', () => {
    renderWithAppRouterContext(mockProps);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('@johndoe')).toBeInTheDocument();
    expect(screen.getByAltText('Profile picture of John Doe')).toBeInTheDocument();
    expect(screen.getByText('Lorem ipsum dolor sit amet')).toBeInTheDocument();
    expect(screen.getByAltText('edit profile')).toBeInTheDocument();
  });

  it('should render profile header without edit button for unauthenticated user', () => {
    renderWithAppRouterContext({ ...mockProps, authUserId: '' });
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    expect(screen.getByText(/@johndoe/)).toBeInTheDocument();
    expect(screen.getByAltText(/Profile picture of John Doe/)).toBeInTheDocument();
    expect(screen.getByText(/Lorem ipsum dolor sit amet/)).toBeInTheDocument();
    expect(screen.queryByAltText(/edit profile/)).not.toBeInTheDocument();
  });

  it('should render profile header with default values for missing props', () => {
    const consoleError = console.error;
    console.error = jest.fn();

    renderWithAppRouterContext({...mockProps, name: '', username: '', imgUrl: '', bio: ''});
    expect(screen.getByText(/Name/)).toBeInTheDocument();
    expect(screen.getByText(/@Username/)).toBeInTheDocument();
    expect(screen.getByAltText(/Profile picture of/)).toBeInTheDocument();    
    expect(screen.getByAltText(/edit profile/)).toBeInTheDocument();

    expect(console.error).toHaveBeenCalled(); // Image is missing required "src" property 
    console.error = consoleError;
  });

  it('should render profile header with default profile picture if imgUrl is missing', () => {
    const consoleError = console.error;
    console.error = jest.fn();

    renderWithAppRouterContext({...mockProps, imgUrl: ''});
    expect(screen.getByAltText(/Profile picture of John Doe/)).toBeInTheDocument();

    expect(console.error).toHaveBeenCalled(); // Image is missing required "src" property 
    console.error = consoleError;
  });

  it('should render profile header without edit button for community type', () => {
    renderWithAppRouterContext({...mockProps, type: 'Community'});
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    expect(screen.getByText(/@johndoe/)).toBeInTheDocument();
    expect(screen.getByAltText(/Profile picture of John Doe/)).toBeInTheDocument();
    expect(screen.getByText(/Lorem ipsum dolor sit amet/)).toBeInTheDocument();
    expect(screen.queryByAltText(/edit profile/)).not.toBeInTheDocument();
  });
});
