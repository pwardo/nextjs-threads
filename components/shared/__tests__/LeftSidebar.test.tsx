import { screen, fireEvent, render } from '@testing-library/react';
import { AppRouterContextProviderMock } from '@/lib/testUtils/app-router-context-provider-mock';
import { sidebarLinks } from '@/constants';
import LeftSidebar from '../LeftSidebar';

const mockUsePathname = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: () => jest.fn(),
      replace: () => jest.fn(),
    };
  },
  usePathname() {
    return mockUsePathname();
  },
}));

const mockUserId = '123';
jest.mock('@clerk/nextjs', () => ({
  useAuth() {
    return {
      userId: mockUserId,
    };
  },
  SignedIn() {
    return true;
  },
  SignOutButton() {
    return <button />;
  },
}));

const push = jest.fn();
const renderWithAppRouterContext = () => {
  return render(
    <AppRouterContextProviderMock router={{ push }}>
      <LeftSidebar/>
    </AppRouterContextProviderMock>
  );
}

describe('LeftSidebar', () => {
  it('should render all links when called', () => {
    mockUsePathname.mockImplementation(() => '/');
    const {container} = renderWithAppRouterContext();
    expect(container.querySelectorAll('.leftsidebar_link')).toHaveLength(sidebarLinks.length);
  });

  it('should highlight active link when called', () => {
    mockUsePathname.mockImplementation(() => '/');
    const {container} = renderWithAppRouterContext();
    expect(container.querySelectorAll('.leftsidebar_link')).toHaveLength(sidebarLinks.length);
    expect(container.querySelector('.bg-primary-500')).toBeInTheDocument();
  });

  it('should truncate link labels to first word when called', () => {
    mockUsePathname.mockImplementation(() => '/');
    const {container} = renderWithAppRouterContext();
    expect(container.querySelectorAll('.leftsidebar_link')).toHaveLength(sidebarLinks.length);
    expect(container.querySelector('.text-light-1')?.textContent).toBe(sidebarLinks[0].label.split(/\s+./)[0]);
  });

  it('should not highlight any link when called with no active link', () => {
    mockUsePathname.mockImplementation(() => ''); // No current page
    const {container} = renderWithAppRouterContext();
    expect(container.querySelectorAll('.leftsidebar_link')).toHaveLength(sidebarLinks.length);
    expect(container.querySelector('.bg-primary-500')).not.toBeInTheDocument();
  });

  it('should navigate to the correct route when a link is clicked', () => {
    mockUsePathname.mockImplementation(() => '/profile');
    renderWithAppRouterContext();
    fireEvent.click(screen.getByText(/profile/i));
    expect(push).toHaveBeenCalledWith(`/profile/${mockUserId}`, {
      "forceOptimisticNavigation": false,
      "scroll": true
    });
  });

});
