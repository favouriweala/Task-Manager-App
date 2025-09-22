import '@testing-library/jest-dom';
import { setupServer } from 'msw/node';
import { handlers } from './tests/mocks/handlers';

// Setup MSW server for API mocking
export const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());