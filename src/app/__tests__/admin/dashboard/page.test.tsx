import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminDashboard from '@/app/admin/dashboard/page';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

jest.mock('lucide-react', () => ({
  GraduationCap: () => <span data-testid="icon-graduation" />,
  UserCheck: () => <span data-testid="icon-user-check" />,
  BookOpen: () => <span data-testid="icon-book" />,
  BarChart3: () => <span data-testid="icon-bar-chart" />,
  IdCard: () => <span data-testid="icon-id-card" />,
  UserPlus: () => <span data-testid="icon-user-plus" />,
  Users: () => <span data-testid="icon-users" />,
  Wallet: () => <span data-testid="icon-wallet" />,
}));

jest.mock('@/components/PageHeader', () => ({
  __esModule: true,
  default: ({ title, subtitle }: { title: React.ReactNode; subtitle?: React.ReactNode }) => (
    <header data-testid="page-header">
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </header>
  ),
}));

jest.mock('@/components/Logout', () => ({
  __esModule: true,
  default: () => <button data-testid="logout-button">Logout</button>,
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <section>{children}</section>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <header>{children}</header>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));

describe('Admin Dashboard Page', () => {
  it('renders the dashboard header and subtitle', () => {
    render(<AdminDashboard />);
    expect(screen.getByRole('heading', { name: /admin dashboard/i })).toBeInTheDocument();
    expect(
      screen.getByText(/manage all aspects of the university nfc card system/i)
    ).toBeInTheDocument();
  });

  it('renders primary management cards', () => {
    render(<AdminDashboard />);
    expect(screen.getByText('Students')).toBeInTheDocument();
    expect(screen.getByText('Lecturers')).toBeInTheDocument();
    expect(screen.getByText('Courses')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
  });

  it('renders quick action and card management links', () => {
    render(<AdminDashboard />);
    expect(screen.getByText(/quick add student/i)).toBeInTheDocument();
    expect(screen.getByText(/quick add lecturer/i)).toBeInTheDocument();
    expect(screen.getAllByText('RFID Cards')[0]).toBeInTheDocument();
    expect(screen.getByText(/recharge cards/i)).toBeInTheDocument();
  });

  it('displays the logout button', () => {
    render(<AdminDashboard />);
    expect(screen.getByTestId('logout-button')).toBeInTheDocument();
  });
});
