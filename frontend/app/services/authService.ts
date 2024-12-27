import { apiUrl } from '../constants/authConstant';
import { UserData } from '../store/slices/authSlice';

export const authService = {
  async login(credentials: { email: string; password: string; mfa_code?: string }) {
    const response = await fetch(`${apiUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }
    
    return response.json();
  },

  async logout() {
    await fetch(`${apiUrl}/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  },

  async getCurrentUser(): Promise<UserData> {
    const response = await fetch(`${apiUrl}/get-user`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to get user data');
    }
    
    const data = await response.json();
    console.log('getCurrentUser response:', data); // Debug log
    return data;
  },

  async refreshToken() {
    const response = await fetch(`${apiUrl}/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }
    
    return response.json();
  },
}; 