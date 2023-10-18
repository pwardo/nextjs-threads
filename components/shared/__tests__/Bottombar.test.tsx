import { screen, fireEvent, render } from '@testing-library/react';
import { AppRouterContextProviderMock } from '@/lib/testUtils/appRouterContextProviderMock';
import { sidebarLinks } from '@/constants';
import Bottombar from '../Bottombar';

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

const push = jest.fn();
const renderWithAppRouterContext = () => {
  return render(
    <AppRouterContextProviderMock router={{ push }}>
      <Bottombar/>
    </AppRouterContextProviderMock>
  );
}

describe('Bottombar', () => {
  it('should render all links when called', () => {
    mockUsePathname.mockImplementation(() => '/');
    const {container} = renderWithAppRouterContext();
    expect(container.querySelectorAll('.bottombar_link')).toHaveLength(sidebarLinks.length);
  });

  it('should highlight active link when called', () => {
    mockUsePathname.mockImplementation(() => '/');
    const {container} = renderWithAppRouterContext();
    expect(container.querySelectorAll('.bottombar_link')).toHaveLength(sidebarLinks.length);
    expect(container.querySelector('.bg-primary-500')).toBeInTheDocument();
  });

  it('should truncate link labels to first word when called', () => {
    mockUsePathname.mockImplementation(() => '/');
    const {container} = renderWithAppRouterContext();
    expect(container.querySelectorAll('.bottombar_link')).toHaveLength(sidebarLinks.length);
    expect(container.querySelector('.text-light-1')?.textContent).toBe(sidebarLinks[0].label.split(/\s+./)[0]);
  });

  it('should not highlight any link when called with no active link', () => {
    mockUsePathname.mockImplementation(() => ''); // No current page
    const {container} = renderWithAppRouterContext();
    expect(container.querySelectorAll('.bottombar_link')).toHaveLength(sidebarLinks.length);
    expect(container.querySelector('.bg-primary-500')).not.toBeInTheDocument();
  });
  
  it('should navigate to the correct route when a link is clicked', () => {
    mockUsePathname.mockImplementation(() => '/communities');
    renderWithAppRouterContext();
    fireEvent.click(screen.getByText(/communities/i));
    expect(push).toHaveBeenCalledWith(`/communities`, {
      "forceOptimisticNavigation": false,
      "scroll": true
    });
  });
});
