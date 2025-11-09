# Testing Documentation

## Overview
This document outlines the testing strategy, structure, and practices for the University RFID Card System.

## Table of Contents
- [Testing Stack](#testing-stack)
- [Folder Structure](#folder-structure)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Test Coverage](#test-coverage)
- [Testing Guidelines](#testing-guidelines)
- [CI/CD Integration](#cicd-integration)

## Testing Stack

### Unit & Integration Tests
- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **@testing-library/jest-dom**: Custom matchers for DOM elements
- **@testing-library/user-event**: User interaction simulation

### E2E Tests (Future)
- **Playwright** or **Cypress**: Recommended for end-to-end testing

## Folder Structure

```
uni-rfid/
├── jest.config.js              # Jest configuration
├── jest.setup.js               # Jest setup and global mocks
├── TESTING.md                  # This file - testing documentation
├── src/
│   ├── app/
│   │   ├── __tests__/          # Tests for app pages
│   │   │   └── page.test.tsx   # Home page tests
│   │   ├── admin/
│   │   │   └── __tests__/      # Admin route tests
│   │   ├── student/
│   │   │   └── __tests__/      # Student route tests
│   │   └── ...
│   ├── components/
│   │   ├── __tests__/          # Component tests
│   │   │   ├── LoginForm.test.tsx
│   │   │   └── ...
│   │   └── ui/
│   │       └── __tests__/      # UI component tests
│   ├── hooks/
│   │   └── __tests__/          # Custom hooks tests
│   ├── lib/
│   │   └── __tests__/          # Utility/library tests
│   └── types/
└── __tests__/                  # Integration tests (optional)
```

### Convention
- **Unit Tests**: Place in `__tests__` folder next to the code being tested
- **Test Files**: Use `.test.tsx` or `.test.ts` extension
- **Mock Files**: Create `__mocks__` folder when needed

## Running Tests

### Available Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (re-run on file changes)
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- page.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="Admin Portal"

# Run tests in a specific folder
npm test -- src/app/__tests__

# Update snapshots
npm test -- -u
```

### Using VS Code Test Extension
1. Install "Jest" extension (Orta.vscode-jest)
2. Tests will run automatically in the background
3. See results inline in your code
4. Click the ✓ or ✗ in the gutter to run individual tests

## Writing Tests

### Test Structure

```typescript
describe('ComponentName', () => {
  // Setup
  beforeEach(() => {
    // Runs before each test
  });

  afterEach(() => {
    // Cleanup after each test
  });

  // Individual test
  it('should do something specific', () => {
    // Arrange
    const expected = 'value';
    
    // Act
    const result = someFunction();
    
    // Assert
    expect(result).toBe(expected);
  });

  // Nested describe for grouping
  describe('when in specific state', () => {
    it('should behave differently', () => {
      // test code
    });
  });
});
```

### Testing React Components

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    render(<MyComponent />);
    const button = screen.getByRole('button', { name: 'Click Me' });
    
    fireEvent.click(button);
    
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

### Common Queries
- `getByText()` - Find by text content
- `getByRole()` - Find by ARIA role
- `getByLabelText()` - Find by label
- `getByTestId()` - Find by data-testid attribute
- `queryBy*()` - Returns null if not found (good for negative tests)
- `findBy*()` - Async queries (waits for element)

### Mocking

```typescript
// Mock a module
jest.mock('next/link', () => {
  return ({ children, href }) => <a href={href}>{children}</a>;
});

// Mock a function
const mockFn = jest.fn();
mockFn.mockReturnValue('mocked value');

// Mock API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ data: 'mocked' }),
  })
);
```

## Test Coverage

### Viewing Coverage

```bash
npm test -- --coverage
```

Coverage reports are generated in:
- **Terminal**: Summary view
- **HTML Report**: `coverage/lcov-report/index.html` (open in browser)

### Coverage Thresholds
Current thresholds (defined in `jest.config.js`):
- Branches: 50%
- Functions: 50%
- Lines: 50%
- Statements: 50%

### What to Test
✅ **DO TEST:**
- Component rendering
- User interactions
- Conditional rendering
- Props handling
- State changes
- Error states
- Edge cases
- Business logic

❌ **DON'T TEST:**
- Third-party libraries
- Implementation details
- Styles (unless critical to functionality)

## Testing Guidelines

### Best Practices

1. **Test Behavior, Not Implementation**
   - Test what the user sees and does
   - Avoid testing internal state or methods

2. **Keep Tests Simple**
   - One assertion per test when possible
   - Clear test names that describe the expected behavior

3. **Use Descriptive Test Names**
   ```typescript
   // Good ✅
   it('displays error message when login fails')
   
   // Bad ❌
   it('test login')
   ```

4. **Follow AAA Pattern**
   - **Arrange**: Set up test data
   - **Act**: Execute the code being tested
   - **Assert**: Verify the results

5. **Avoid Test Interdependence**
   - Each test should be independent
   - Tests should pass in any order

6. **Mock External Dependencies**
   - API calls
   - Database connections
   - Third-party services

### Test Naming Convention

```typescript
// Component Tests
describe('ComponentName', () => {
  it('renders {expected output}', () => {});
  it('handles {user action}', () => {});
  it('displays {content} when {condition}', () => {});
});

// Function Tests
describe('functionName', () => {
  it('returns {expected} when {input}', () => {});
  it('throws error when {invalid input}', () => {});
});

// Integration Tests
describe('Feature: User Login', () => {
  it('successfully logs in with valid credentials', () => {});
  it('redirects to correct dashboard after login', () => {});
});
```

## Test Tracking & Documentation

### Test Log
Keep a log of major test additions in this section:

#### 2025-01-08
- ✅ Added Home page (`page.tsx`) unit tests
  - Tests all 5 portal cards (Admin, Lecturer, Student, Library, Canteen)
  - Verifies correct links and navigation
  - Validates icons and descriptions
  - Coverage: 100%
  - Tests: 24/24 passing

- ✅ Added LoginForm component tests
  - Tests rendering for all 4 user roles
  - Validates form inputs and validation
  - **Tests login flow and dashboard redirect** ⭐
  - Tests error handling (invalid credentials, role mismatch)
  - Tests session management
  - Coverage: 100%
  - Tests: 24/24 passing

#### Future Tests Planned
- [ ] Dashboard pages (Admin, Student, Lecturer, Library, Canteen)
- [ ] RFID reader component tests
- [ ] API endpoint tests
- [ ] Database query tests
- [ ] E2E tests for complete user journeys

### Test Metrics

| Module | Coverage | Tests | Status |
|--------|----------|-------|--------|
| Home Page | 100% | 24 | ✅ Passing |
| LoginForm | 100% | 24 | ✅ Passing |
| Components | 0% | 0 | 📝 Pending |
| Hooks | 0% | 0 | 📝 Pending |
| API Routes | 0% | 0 | 📝 Pending |
| **Total** | **~5%** | **48** | ✅ **All Passing** |

## CI/CD Integration

### GitHub Actions (Future)

Create `.github/workflows/test.yml`:

```yaml
name: Run Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - run: npm ci
      - run: npm test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Integration vs Unit Tests

### Unit Tests
- Test individual components/functions in isolation
- Fast to run
- Easy to debug
- Example: Testing if a button renders correctly

### Integration Tests
- Test multiple components working together
- Test user flows across pages
- Example: Testing login → redirect to dashboard flow

### E2E Tests (Playwright/Cypress)
- Test complete user journeys
- Run in real browser
- Test actual authentication
- Example: Complete login flow with real API calls

**For testing "does portal correctly log into its correct dashboard?":**
- **Unit Test**: Verify dashboard page renders correctly ✅
- **Integration Test**: Test authentication logic + navigation ✅✅
- **E2E Test**: Full login flow in browser ✅✅✅ (RECOMMENDED)

## Troubleshooting

### Common Issues

**Tests not running?**
```bash
# Clear Jest cache
npx jest --clearCache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Module not found errors?**
- Check `moduleNameMapper` in `jest.config.js`
- Verify import paths use `@/` alias correctly

**Async test timeout?**
- Increase timeout: `jest.setTimeout(10000)`
- Use `async/await` with `findBy*` queries

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Next.js Testing](https://nextjs.org/docs/testing)

---

**Last Updated**: January 8, 2025
**Maintained by**: Development Team
