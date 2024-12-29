'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeProvider } from 'styled-components';
import { Theme } from '~/app/theme';
import { 
  BodyExtraLargeSemiBold, 
  BodySecondaryMedium,
  Input
} from '~/app/global-style';
import { InputType } from '~/app/ui-components/input';
import {
  Container,
  FormContainer,
  Form,
  ErrorText,
  LinkText
} from './style';
import Button from '~/app/ui-components/button/button';
import { useAuth } from '~/app/context/AuthContext';  
import { useAppSelector } from '~/app/store/hooks';
import { authService } from '~/app/services/authService';

interface LoginFormData {
  email: string;
  password: string;
  mfa_code?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    mfa_code: '',
  })
  const [requiresMfa, setRequiresMfa] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { isLoading } = useAppSelector(state => state.auth);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    setError('');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await authService.login(formData);

      if (data.requires_mfa && !formData.mfa_code) {
        setRequiresMfa(true);
        setLoading(false);
        return;
      }

      await login(data);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message ?? 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ThemeProvider theme={Theme}>
      <Container>
        <FormContainer>
          <BodyExtraLargeSemiBold style={{ marginBottom: '24px', textAlign: 'center' }}>
            {requiresMfa ? 'Enter MFA Code' : 'Sign In'}
          </BodyExtraLargeSemiBold>

          <Form onSubmit={handleSubmit}>
            <Input
              type={InputType.EMAIL}
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            
            <Input
              type={InputType.PASSWORD}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            
            <Input
              type={InputType.TEXT}
              name="mfa_code"
              placeholder="Enter MFA Code"
              value={formData.mfa_code}
              onChange={handleChange}
              required={requiresMfa}
              autoComplete="off"
            />

            {error && <ErrorText>{error}</ErrorText>}

            <Button 
              title={loading ? 'Please wait...' : requiresMfa ? 'Verify' : 'Sign In'} 
              onButtonClick={handleSubmit} 
              type='submit' 
            />

            <BodySecondaryMedium style={{ textAlign: 'center' }}>
              Don&apos;t have an account?{' '}
              <LinkText onClick={() => router.push('/authentication/signup')}>
                Sign Up
              </LinkText>
            </BodySecondaryMedium>
          </Form>
        </FormContainer>
      </Container>
    </ThemeProvider>
  )
}
