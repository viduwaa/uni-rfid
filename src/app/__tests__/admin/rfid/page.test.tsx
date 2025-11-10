import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RFIDManagement from '@/app/admin/rfid/page';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

jest.mock('lucide-react', () => ({
  IdCard: () => <span data-testid="icon-id-card" />,
  ArrowLeft: () => <span data-testid="icon-arrow-left" />,
  CreditCard: () => <span data-testid="icon-credit-card" />,
  UserCog: () => <span data-testid="icon-user-cog" />,
  DollarSign: () => <span data-testid="icon-dollar" />,
  Loader2: () => <span data-testid="icon-loader" />,
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/components/PageHeader', () => ({
  __esModule: true,
  default: ({ title, subtitle, right }: { title: React.ReactNode; subtitle?: React.ReactNode; right?: React.ReactNode }) => (
    <header data-testid="page-header">
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
      {right}
    </header>
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <section>{children}</section>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <header>{children}</header>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  CardFooter: ({ children }: { children: React.ReactNode }) => <footer>{children}</footer>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

jest.mock('@/app/admin/rfid/IssueNewCard', () => ({
  __esModule: true,
  default: () => <div data-testid="issue-new-card">Issue New Card Component</div>,
}));

jest.mock('@/app/admin/rfid/ManageExistingCard', () => ({
  __esModule: true,
  default: () => <div data-testid="manage-existing-card">Manage Existing Card Component</div>,
}));

jest.mock('@/components/DeviceStatus', () => ({
  __esModule: true,
  default: () => <div data-testid="device-status">Device Status</div>,
}));

jest.mock('@/app/admin/rfid/AddMenu', () => ({
  __esModule: true,
  default: () => <div data-testid="add-menu">Add Menu</div>,
}));

jest.mock('@/lib/formatCurrency', () => ({
  __esModule: true,
  default: (value: number) => `Rs. ${value.toFixed(2)}`,
}));

const statsResponse = {
  success: true,
  data: {
    activeCards: 12,
    issuedCards: 34,
    totalBalance: 98765.43,
    unissuedCards: 5,
  },
};

let originalFetch: typeof fetch;
let mockFetch: jest.Mock;

beforeAll(() => {
  originalFetch = global.fetch;
});

afterAll(() => {
  global.fetch = originalFetch;
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('RFID Management Page', () => {
  beforeEach(() => {
    mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => statsResponse,
    });
    global.fetch = mockFetch as unknown as typeof fetch;
  });

  it('renders header information with device status', async () => {
    render(<RFIDManagement />);
    expect(await screen.findByText(/rfid card management/i)).toBeInTheDocument();
    expect(screen.getByText(/modern card management system/i)).toBeInTheDocument();
    expect(screen.getByTestId('device-status')).toBeInTheDocument();
  });

  it('fetches RFID statistics on mount', async () => {
    render(<RFIDManagement />);
    await waitFor(() => expect(mockFetch).toHaveBeenCalledWith('/api/rfid/stats'));
  });

  it('displays refreshed statistic values once loaded', async () => {
    render(<RFIDManagement />);
    await waitFor(() => expect(screen.getByText('12')).toBeInTheDocument());
    expect(screen.getByText('34')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Rs. 98765.43')).toBeInTheDocument();
  });

  it('shows the issue new card workflow by default', async () => {
    render(<RFIDManagement />);
    expect(await screen.findByTestId('issue-new-card')).toBeInTheDocument();
    expect(screen.queryByTestId('manage-existing-card')).not.toBeInTheDocument();
  });
});
