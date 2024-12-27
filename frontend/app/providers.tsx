'use client'

import { Provider } from 'react-redux'
import { ThemeProvider } from 'styled-components'
import { store } from './store/store'
import { AuthProvider } from './context/AuthContext'
import { Theme } from './theme'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthProvider>
        <ThemeProvider theme={Theme}>
          {children}
        </ThemeProvider>
      </AuthProvider>
    </Provider>
  )
} 