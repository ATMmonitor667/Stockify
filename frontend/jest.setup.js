import '@testing-library/jest-dom';

// Mock fetch globally
// Return an array for news requests, otherwise return an empty object
// This helps prevent 'news.slice is not a function' errors
// and matches the expected return type in the News component
//
global.fetch = jest.fn((...args) => {
  if (args[0] && args[0].toString().includes('news')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([
        { id: 1, headline: 'Test News 1', summary: 'Summary 1', url: 'https://example.com/1', datetime: Date.now(), source: 'Source 1', category: 'general', image: '' },
        { id: 2, headline: 'Test News 2', summary: 'Summary 2', url: 'https://example.com/2', datetime: Date.now(), source: 'Source 2', category: 'business', image: '' },
      ]),
    });
  }
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  });
});

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
  }),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() { return null; }
  unobserve() { return null; }
  disconnect() { return null; }
};

// --- Supabase Mock ---
const mockUser = { id: 'test-user', email: 'test@example.com', user_metadata: { username: 'testuser' } };
const mockProfile = { wallet_amt: 10000 };
const mockPortfolio = [
  {
    stock_id: 1,
    amt_bought: 10,
    total_spent: 1500,
    stock: { tick: 'AAPL' },
  },
];
const mockStock = { id: 1, tick: 'AAPL', name: 'Apple Inc.', num_investors: 1 };

// Create a base mock function that returns itself
const createBaseMock = () => {
  const mock = jest.fn();
  mock.mockReturnValue(mock);
  return mock;
};

// Create a chainable mock with all necessary methods
const createChainableMock = (returnValue) => {
  const mock = createBaseMock();
  
  // Add all chainable methods
  const methods = ['select', 'insert', 'update', 'delete', 'eq', 'onConflict', 'ignoreDuplicates'];
  methods.forEach(method => {
    mock[method] = createBaseMock();
  });

  // Add special methods that return promises
  mock.single = jest.fn().mockResolvedValue({ data: returnValue });
  mock.maybeSingle = jest.fn().mockResolvedValue({ data: returnValue });
  
  return mock;
};

jest.mock('@/config/supabaseClient', () => {
  const from = jest.fn((table) => {
    if (table === 'profiles') {
      return {
        select: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: mockProfile }) ) })) })),
        update: jest.fn(() => ({ eq: jest.fn(() => Promise.resolve({ error: null })) })),
        insert: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: mockProfile }) ) })) })),
        eq: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: mockProfile }) ) })),
        single: jest.fn(() => Promise.resolve({ data: mockProfile })),
      };
    }
    if (table === 'userstock') {
      return {
        select: jest.fn(() => ({ eq: jest.fn(() => Promise.resolve({ data: mockPortfolio })) })),
        upsert: jest.fn(() => Promise.resolve({ error: null })),
        delete: jest.fn(() => ({ eq: jest.fn(() => Promise.resolve({ error: null })) })),
        eq: jest.fn(() => ({ maybeSingle: jest.fn(() => Promise.resolve({ data: mockPortfolio[0] })) })),
        maybeSingle: jest.fn(() => Promise.resolve({ data: mockPortfolio[0] })),
      };
    }
    if (table === 'stock') {
      return {
        select: jest.fn(() => ({ eq: jest.fn(() => ({ maybeSingle: jest.fn(() => Promise.resolve({ data: mockStock }) ) })) })),
        insert: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: mockStock }) ) })) })),
        update: jest.fn(() => ({ eq: jest.fn(() => Promise.resolve({ error: null })) })),
        eq: jest.fn(() => ({ maybeSingle: jest.fn(() => Promise.resolve({ data: mockStock })) })),
        maybeSingle: jest.fn(() => Promise.resolve({ data: mockStock })),
        single: jest.fn(() => Promise.resolve({ data: mockStock })),
      };
    }
    if (table === 'transactionhistory') {
      return {
        insert: jest.fn(() => Promise.resolve({ data: {}, error: null })),
      };
    }
    return createChainableMock();
  });

  return {
    supabase: {
      from,
      auth: {
        getSession: jest.fn(() => Promise.resolve({ data: { session: { user: mockUser } } })),
        getUser: jest.fn(() => Promise.resolve({ data: { user: mockUser } })),
        signIn: jest.fn(),
        signOut: jest.fn(),
      },
    },
  };
});

// --- Finnhub/News API Mock ---
jest.mock('@/config/finnhubClient', () => ({
  getStockQuote: jest.fn((symbol) => Promise.resolve({ c: 150, d: 2, dp: 1.5, o: 148, h: 151 })),
  getCompanyProfile: jest.fn((symbol) => Promise.resolve({ ticker: symbol, name: 'Apple Inc.' })),
  searchStocks: jest.fn((query) => Promise.resolve([
    { symbol: 'AAPL', description: 'Apple Inc.', type: 'Common Stock' },
    { symbol: 'MSFT', description: 'Microsoft Corp.', type: 'Common Stock' },
  ])),
  getNews: jest.fn(() => Promise.resolve([
    { id: 1, headline: 'Test News 1', summary: 'Summary 1', url: 'https://example.com/1', datetime: Date.now(), source: 'Source 1', category: 'general', image: '' },
    { id: 2, headline: 'Test News 2', summary: 'Summary 2', url: 'https://example.com/2', datetime: Date.now(), source: 'Source 2', category: 'business', image: '' },
  ])),
}));

// --- Environment Variables for News ---
process.env.NEXT_PUBLIC_FINNHUB_API_KEY = 'test-key';

// Mock UserContext
jest.mock('@/config/UserContext', () => ({
  GlobalUser: ({ children }) => children,
  useGlobalUser: jest.fn().mockReturnValue({ id: 'test-user' })
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: require('react').forwardRef(({ children, ...props }, ref) => (
      <div ref={ref} {...props}>{children}</div>
    ))
  }
}));