import React, { ReactElement } from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { AuthProvider } from '../contexts/AuthContext';
import theme from '../theme/theme';

interface WrapperProps {
  children: React.ReactNode;
  initialRoute?: string;
}

function AllTheProviders({ children, initialRoute = '/' }: WrapperProps) {
  return (
    <StyledEngineProvider injectFirst>
      <MemoryRouter initialEntries={[initialRoute]}>
        <ThemeProvider theme={theme}>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    </StyledEngineProvider>
  );
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { initialRoute?: string }
) => {
  const { initialRoute, ...renderOptions } = options || {};
  return rtlRender(ui, {
    wrapper: (props) => <AllTheProviders {...props} initialRoute={initialRoute} />,
    ...renderOptions,
  });
};

export * from '@testing-library/react';
export { customRender as render };
