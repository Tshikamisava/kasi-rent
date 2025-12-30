import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

// We'll use module mocking inside each test to control useAuth/useToast/useNavigate

describe('Hero component', () => {
  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  test('redirects to signin with redirect param when user is not authenticated', async () => {
    const navigateMock = vi.fn();

    // mock react-router-dom useNavigate and Link
    vi.doMock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => navigateMock,
        Link: ({ children, to }: any) => <a href={to}>{children}</a>,
      };
    });

    // unauthenticated
    vi.doMock('@/hooks/use-auth', () => ({ useAuth: () => ({ user: null, userType: null }) }));

    // mock toast but should not be called for unauthenticated path
    vi.doMock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));

    const { Hero } = await import('@/components/Hero');

    render(<Hero />);

    const landlordButton = screen.getByLabelText('For Landlords - List properties');
    fireEvent.click(landlordButton);

    expect(navigateMock).toHaveBeenCalledWith('/signin?redirect=/dashboard/landlord');
  });

  test('navigates to landlord dashboard when user is landlord', async () => {
    const navigateMock = vi.fn();

    vi.doMock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => navigateMock,
        Link: ({ children, to }: any) => <a href={to}>{children}</a>,
      };
    });

    vi.doMock('@/hooks/use-auth', () => ({ useAuth: () => ({ user: { _id: '1' }, userType: 'landlord' }) }));
    vi.doMock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));

    const { Hero } = await import('@/components/Hero');

    render(<Hero />);

    const landlordButton = screen.getByLabelText('For Landlords - List properties');
    fireEvent.click(landlordButton);

    expect(navigateMock).toHaveBeenCalledWith('/dashboard/landlord');
  });

  test('shows unauthorized toast and navigates to get-started for non-landlord users', async () => {
    const navigateMock = vi.fn();
    const toastMock = vi.fn();

    vi.doMock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => navigateMock,
        Link: ({ children, to }: any) => <a href={to}>{children}</a>,
      };
    });

    vi.doMock('@/hooks/use-auth', () => ({ useAuth: () => ({ user: { _id: '2' }, userType: 'tenant' }) }));
    vi.doMock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: toastMock }) }));

    const { Hero } = await import('@/components/Hero');

    render(<Hero />);

    const landlordButton = screen.getByLabelText('For Landlords - List properties');
    fireEvent.click(landlordButton);

    expect(toastMock).toHaveBeenCalled();
    // check that toast was called with the destructive variant
    const callArg = toastMock.mock.calls[0][0];
    expect(callArg.variant).toBe('destructive');
    expect(navigateMock).toHaveBeenCalledWith('/get-started');
  });
});
