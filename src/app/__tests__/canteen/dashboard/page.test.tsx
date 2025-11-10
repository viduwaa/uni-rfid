import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CanteenPage from '@/app/canteen/dashboard/page';

const mockMenuItems = [
  {
    menu_item_id: '1',
    item_name: 'Rice & Curry',
    description: 'Tasty meal',
    price: 150,
    category: 'Main',
    is_available: true,
  },
  {
    menu_item_id: '2',
    item_name: 'Iced Coffee',
    description: 'Chilled drink',
    price: 60,
    category: 'Drink',
    is_available: true,
  },
];

jest.mock('lucide-react', () => ({
  ShoppingCart: () => <span data-testid="icon-shopping" />,
  Plus: () => <span data-testid="icon-plus" />,
  Minus: () => <span data-testid="icon-minus" />,
  Trash2: () => <span data-testid="icon-trash" />,
  UtensilsCrossed: () => <span data-testid="icon-utensils" />,
  CreditCard: () => <span data-testid="icon-card" />,
  CheckCircle: () => <span data-testid="icon-check" />,
  RefreshCw: () => <span data-testid="icon-refresh" />,
  Settings: () => <span data-testid="icon-settings" />,
  Monitor: () => <span data-testid="icon-monitor" />,
  User: () => <span data-testid="icon-user" />,
  Clock: () => <span data-testid="icon-clock" />,
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <section>{children}</section>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <header>{children}</header>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

jest.mock('@/components/ui/separator', () => ({
  Separator: () => <hr />,
}));

jest.mock('@/components/Logout', () => ({
  __esModule: true,
  default: () => <button data-testid="logout-button">Logout</button>,
}));

jest.mock('@/components/RFIDOrderProcessor', () => ({
  __esModule: true,
  default: React.forwardRef((_props, ref) => {
    React.useImperativeHandle(ref, () => ({
      startReading: jest.fn(),
      clearData: jest.fn(),
      processManualPayment: jest.fn(),
    }));
    return <div data-testid="rfid-order-processor">RFID Processor</div>;
  }),
}));

jest.mock('@/components/ManualPaymentDialog', () => ({
  __esModule: true,
  default: ({ isOpen }: { isOpen: boolean }) => (isOpen ? <div data-testid="manual-payment-dialog" /> : null),
}));

const originalFetch = globalThis.fetch;
let fetchMock: jest.Mock;

beforeEach(() => {
  fetchMock = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ success: true, data: mockMenuItems }),
  });

  Object.defineProperty(globalThis, 'fetch', {
    configurable: true,
    writable: true,
    value: fetchMock,
  });

  window.localStorage.clear();
});

afterEach(() => {
  Object.defineProperty(globalThis, 'fetch', {
    configurable: true,
    writable: true,
    value: originalFetch,
  });

  jest.clearAllMocks();
});

describe('Canteen Dashboard Page', () => {
  it('renders the canteen dashboard header and navigation buttons', async () => {
    render(<CanteenPage />);

    expect(await screen.findByRole('heading', { name: /canteen management/i })).toBeInTheDocument();
    expect(screen.getByText(/staff interface - menu & orders/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /student display/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /transactions/i })).toBeInTheDocument();
    expect(screen.getByTestId('logout-button')).toBeInTheDocument();
  });

  it('loads menu items from the api and shows them in the menu grid', async () => {
    render(<CanteenPage />);

    expect(fetchMock).toHaveBeenCalledWith('/api/canteen/menu-items');
    expect(await screen.findByText('Rice & Curry')).toBeInTheDocument();
    expect(screen.getByText('Iced Coffee')).toBeInTheDocument();
  });

  it('adds menu items to the cart and enables the pay now button', async () => {
    render(<CanteenPage />);

    expect(await screen.findByText(/no items in cart/i)).toBeInTheDocument();

    const addButtons = await screen.findAllByRole('button', { name: /add/i });
    fireEvent.click(addButtons[0]);

    expect(screen.getByText(/1 item/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pay now/i })).toBeEnabled();
    expect(screen.getAllByText(/rs\./i).length).toBeGreaterThan(0);
  });
});
