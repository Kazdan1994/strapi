import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { QueryClientProvider, QueryClient } from 'react-query';
import { useGuidedTour } from '@strapi/helper-plugin';
import { fetchUserRoles } from '../utils/api';
import Theme from '../../Theme';
import AuthenticatedApp from '..';
import { ConfigurationsContext } from '../../../contexts';

const setGuidedTourVisibility = jest.fn();

jest.mock('@strapi/helper-plugin', () => ({
  ...jest.requireActual('@strapi/helper-plugin'),
  auth: { getUserInfo: () => ({ firstname: 'kai', lastname: 'doe' }) },
  useGuidedTour: jest.fn(() => ({ setGuidedTourVisibility })),
}));

jest.mock('../utils/api', () => ({
  fetchUserRoles: jest.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <Theme>
    <QueryClientProvider client={queryClient}>
      <ConfigurationsContext.Provider value={{ showReleaseNotification: false }}>
        <AuthenticatedApp />
      </ConfigurationsContext.Provider>
    </QueryClientProvider>
  </Theme>
);

describe('Admin | components | AuthenticatedApp', () => {
  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
  });

  it('should call setGuidedTourVisibility when user is super admin', async () => {
    fetchUserRoles.mockImplementation(() => [{ code: 'strapi-super-admin' }]);

    const gtVisibility = jest.fn();
    useGuidedTour.mockImplementation(() => ({ setGuidedTourVisibility: gtVisibility }));
    render(<App />);

    await waitFor(() => expect(gtVisibility).toHaveBeenCalledWith(true));
  });

  it('should not setGuidedTourVisibility when user is not super admin', async () => {
    fetchUserRoles.mockImplementation(() => [{ code: 'strapi-editor' }]);

    render(<App />);

    await waitFor(() => expect(setGuidedTourVisibility).not.toHaveBeenCalled());
  });
});
