import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

describe('LandlordCard component', () => {
  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  test('redirects to signin when not authenticated', async () => {
    const navigateMock = vi.fn();

    vi.doMock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => navigateMock,
      };
    });

    vi.doMock('@/hooks/use-auth', () => ({ useAuth: () => ({ user: null, userType: null }) }));
    vi.doMock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));

    const { LandlordCard } = await import('@/components/LandlordCard');

    render(<LandlordCard />);

    const button = screen.getByRole('button', { name: /go to dashboard/i });
    fireEvent.click(button);

    expect(navigateMock).toHaveBeenCalledWith('/signin?redirect=/dashboard/landlord');
  });

  test('navigates to landlord dashboard when user is landlord', async () => {
    const navigateMock = vi.fn();

    vi.doMock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => navigateMock,
      };
    });

    vi.doMock('@/hooks/use-auth', () => ({ useAuth: () => ({ user: { _id: '1' }, userType: 'landlord' }) }));
    vi.doMock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));

    const { LandlordCard } = await import('@/components/LandlordCard');

    render(<LandlordCard />);

    const button = screen.getByRole('button', { name: /go to dashboard/i });
    fireEvent.click(button);

    expect(navigateMock).toHaveBeenCalledWith('/dashboard/landlord');
  });

  test('shows upgrade modal for tenant and navigates to get-started on upgrade', async () => {
    const navigateMock = vi.fn();

    vi.doMock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => navigateMock,
      };
    });

    vi.doMock('@/hooks/use-auth', () => ({ useAuth: () => ({ user: { _id: '2' }, userType: 'tenant' }) }));

    const toastMock = vi.fn();
    vi.doMock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: toastMock }) }));

    const { LandlordCard } = await import('@/components/LandlordCard');

    render(<LandlordCard />);

    const button = screen.getByRole('button', { name: /go to dashboard/i });
    fireEvent.click(button);

    // Dialog content should be present
    expect(await screen.findByText(/landlord access/i)).toBeInTheDocument();
    expect(screen.getByText(/you are signed in as/i)).toBeInTheDocument();
    expect(screen.getByText(/tenant/i)).toBeInTheDocument();

    const upgradeButton = screen.getByRole('button', { name: /upgrade to landlord/i });
    fireEvent.click(upgradeButton);

    expect(navigateMock).toHaveBeenCalledWith('/get-started');
  });
});
