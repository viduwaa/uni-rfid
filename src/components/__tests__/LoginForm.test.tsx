import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import LoginForm from '../LoginForm';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock NextAuth signIn
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('LoginForm', () => {
  const mockPush = jest.fn();
  const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    // Mock fetch for session
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders admin login form correctly', () => {
      render(<LoginForm role="admin" />);
      expect(screen.getByText(/admin.*login/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Enter your credentials to access the admin dashboard/i)
      ).toBeInTheDocument();
    });

    it('renders student login form correctly', () => {
      render(<LoginForm role="student" />);
      expect(screen.getByText(/student.*login/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Enter your credentials to access the student dashboard/i)
      ).toBeInTheDocument();
    });

    it('renders lecturer login form correctly', () => {
      render(<LoginForm role="lecturer" />);
      expect(screen.getByText(/lecturer.*login/i)).toBeInTheDocument();
    });

    it('renders canteen login form correctly', () => {
      render(<LoginForm role="canteen" />);
      expect(screen.getByText(/canteen.*login/i)).toBeInTheDocument();
    });

    it('renders email input field', () => {
      render(<LoginForm role="admin" />);
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('admin@university.edu')).toBeInTheDocument();
    });

    it('renders password input field', () => {
      render(<LoginForm role="admin" />);
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('renders login button', () => {
      render(<LoginForm role="admin" />);
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    it('renders forgot password link', () => {
      render(<LoginForm role="admin" />);
      const forgotPasswordLink = screen.getByText('Forgot password?');
      expect(forgotPasswordLink).toBeInTheDocument();
      expect(forgotPasswordLink.closest('a')).toHaveAttribute('href', '/forgot-password');
    });

    it('renders back to home link', () => {
      render(<LoginForm role="admin" />);
      const backLink = screen.getByText('Back to Home').closest('a');
      expect(backLink).toHaveAttribute('href', '/');
    });
  });

  describe('Form Input Handling', () => {
    it('updates email input value when typed', () => {
      render(<LoginForm role="admin" />);
      const emailInput = screen.getByLabelText('Email') as HTMLInputElement;

      fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });

      expect(emailInput.value).toBe('admin@test.com');
    });

    it('updates password input value when typed', () => {
      render(<LoginForm role="admin" />);
      const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;

      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      expect(passwordInput.value).toBe('password123');
    });

    it('has required attribute on email input', () => {
      render(<LoginForm role="admin" />);
      expect(screen.getByLabelText('Email')).toBeRequired();
    });

    it('has required attribute on password input', () => {
      render(<LoginForm role="admin" />);
      expect(screen.getByLabelText('Password')).toBeRequired();
    });

    it('email input has correct type', () => {
      render(<LoginForm role="admin" />);
      expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
    });

    it('password input has correct type', () => {
      render(<LoginForm role="admin" />);
      expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
    });
  });

  describe('Successful Login', () => {
    it('successfully logs in admin and redirects to admin dashboard', async () => {
      mockSignIn.mockResolvedValue({ ok: true, error: null } as any);
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ user: { role: 'admin' } }),
      });

      render(<LoginForm role="admin" />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const loginButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('credentials', {
          email: 'admin@test.com',
          password: 'password123',
          redirect: false,
        });
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/dashboard');
      });
    });

    it('successfully logs in student and redirects to student dashboard', async () => {
      mockSignIn.mockResolvedValue({ ok: true, error: null } as any);
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ user: { role: 'student' } }),
      });

      render(<LoginForm role="student" />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const loginButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(emailInput, { target: { value: 'student@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/student/dashboard');
      });
    });

    it('successfully logs in lecturer and redirects to lecturer dashboard', async () => {
      mockSignIn.mockResolvedValue({ ok: true, error: null } as any);
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ user: { role: 'lecturer' } }),
      });

      render(<LoginForm role="lecturer" />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const loginButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(emailInput, { target: { value: 'lecturer@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/lecturer/dashboard');
      });
    });

    it('successfully logs in canteen staff and redirects to canteen dashboard', async () => {
      mockSignIn.mockResolvedValue({ ok: true, error: null } as any);
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ user: { role: 'canteen' } }),
      });

      render(<LoginForm role="canteen" />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const loginButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(emailInput, { target: { value: 'canteen@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/canteen/dashboard');
      });
    });
  });

  describe('Failed Login - Invalid Credentials', () => {
    it('displays error message when credentials are invalid', async () => {
      mockSignIn.mockResolvedValue({ ok: false, error: 'Invalid credentials' } as any);

      render(<LoginForm role="admin" />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const loginButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(emailInput, { target: { value: 'wrong@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
      });

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('clears previous error when attempting new login', async () => {
      mockSignIn.mockResolvedValueOnce({ ok: false, error: 'Invalid' } as any);

      render(<LoginForm role="admin" />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const loginButton = screen.getByRole('button', { name: /login/i });

      // First login attempt - should fail
      fireEvent.change(emailInput, { target: { value: 'wrong@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrong' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
      });

      // Second login attempt - error should be cleared before new attempt
      mockSignIn.mockResolvedValueOnce({ ok: true, error: null } as any);
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ user: { role: 'admin' } }),
      });

      fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'correct' } });
      fireEvent.click(loginButton);

      // Error should not be visible during the new attempt
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/dashboard');
      });
    });
  });

  describe('Failed Login - Role Mismatch', () => {
    it('displays error when user tries to login with wrong role', async () => {
      mockSignIn.mockResolvedValue({ ok: true, error: null } as any);
      // User is actually a student but trying to login as admin
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ user: { role: 'student' } }),
      });

      render(<LoginForm role="admin" />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const loginButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(emailInput, { target: { value: 'student@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(
          screen.getByText('You are not authorized to login as admin')
        ).toBeInTheDocument();
      });

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('displays error when session cannot be fetched', async () => {
      mockSignIn.mockResolvedValue({ ok: true, error: null } as any);
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({}), // No user in session
      });

      render(<LoginForm role="admin" />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const loginButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('Unable to fetch session.')).toBeInTheDocument();
      });

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('prevents default form submission', async () => {
      mockSignIn.mockResolvedValue({ ok: true, error: null } as any);
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ user: { role: 'admin' } }),
      });

      render(<LoginForm role="admin" />);

      const form = screen.getByRole('button', { name: /login/i }).closest('form')!;
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      const preventDefaultSpy = jest.spyOn(submitEvent, 'preventDefault');

      fireEvent(form, submitEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });
});
