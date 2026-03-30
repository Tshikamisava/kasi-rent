import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

describe('Features component', () => {
  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  test('renders live subscription plans and removes the coming soon state', async () => {
    const navigateMock = vi.fn();

    vi.doMock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => navigateMock,
      };
    });

    vi.doMock('@/hooks/use-scroll-animation', () => ({
      useScrollAnimation: () => ({ ref: { current: null }, isVisible: true }),
    }));
    vi.doMock('@/hooks/use-auth', () => ({ useAuth: () => ({ user: null }) }));
    vi.doMock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));
    vi.doMock('@/lib/api', () => ({ apiFetch: vi.fn() }));

    const { Features } = await import('@/components/Features');

    render(<Features />);

    expect(screen.getByText(/KasiRent Subscriptions/i)).toBeInTheDocument();
    expect(screen.getByText(/Live now/i)).toBeInTheDocument();
    expect(screen.queryByText(/Coming soon/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Upgrade to Pro/i })).toBeInTheDocument();
  });

  test('redirects unauthenticated users to sign in before checkout', async () => {
    const navigateMock = vi.fn();
    const toastMock = vi.fn();
    const apiFetchMock = vi.fn();

    vi.doMock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => navigateMock,
      };
    });

    vi.doMock('@/hooks/use-scroll-animation', () => ({
      useScrollAnimation: () => ({ ref: { current: null }, isVisible: true }),
    }));
    vi.doMock('@/hooks/use-auth', () => ({ useAuth: () => ({ user: null }) }));
    vi.doMock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: toastMock }) }));
    vi.doMock('@/lib/api', () => ({ apiFetch: apiFetchMock }));

    const { Features } = await import('@/components/Features');

    render(<Features />);
    fireEvent.click(screen.getByRole('button', { name: /Start Starter/i }));

    expect(toastMock).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith('/signin');
    expect(apiFetchMock).not.toHaveBeenCalled();
  });

  test('starts checkout for authenticated users', async () => {
    const navigateMock = vi.fn();
    const toastMock = vi.fn();
    const apiFetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        payment: {
          authorization_url: 'https://paystack.example/checkout',
        },
      }),
    });

    const assignMock = vi.spyOn(window.location, 'assign').mockImplementation(() => undefined);

    vi.doMock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => navigateMock,
      };
    });

    vi.doMock('@/hooks/use-scroll-animation', () => ({
      useScrollAnimation: () => ({ ref: { current: null }, isVisible: true }),
    }));
    vi.doMock('@/hooks/use-auth', () => ({
      useAuth: () => ({ user: { email: 'landlord@example.com' } }),
    }));
    vi.doMock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: toastMock }) }));
    vi.doMock('@/lib/api', () => ({ apiFetch: apiFetchMock }));

    const { Features } = await import('@/components/Features');

    render(<Features />);
    fireEvent.click(screen.getByRole('button', { name: /Start Starter/i }));

    await waitFor(() => {
      expect(apiFetchMock).toHaveBeenCalledTimes(1);
      expect(assignMock).toHaveBeenCalledWith('https://paystack.example/checkout');
    });

    const [, options] = apiFetchMock.mock.calls[0];
    expect(apiFetchMock).toHaveBeenCalledWith(
      '/api/subscriptions/checkout',
      expect.objectContaining({ method: 'POST' })
    );
    expect(String(options.body)).toContain('starter_monthly');

    assignMock.mockRestore();
  });
});
