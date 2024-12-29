'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { 
  BodyExtraLargeSemiBold, 
  BodySecondaryMedium,
  BodyPrimarySemiBold,
  Input,
} from '~/app/global-style'
import { InputType } from '~/app/ui-components/input';
import {
  Container,
  FormContainer,
  Form,
  QRCodeContainer,
  ErrorText,
  LinkText,
  CheckboxContainer,
  Checkbox,
  CheckboxLabel,
  FormGroup,
  PasswordRequirements,
  PasswordError
} from './style';
import Button from '~/app/ui-components/button/button';
import { ThemeProvider } from 'styled-components';
import { Theme } from '~/app/theme';
import { apiUrl } from '~/app/constants/authConstant';
import { validatePassword } from '~/app/utils/password-validation';

interface SignupFormData {
  full_name: string
  email: string
  password: string
  role: string
}

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<SignupFormData>({
    full_name: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mfaUri, setMfaUri] = useState<string | null>(null);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [isPasswordTouched, setIsPasswordTouched] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'password') {
      const validation = validatePassword(value);
      setPasswordErrors(validation.errors);
      setIsPasswordTouched(true);
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 'guest' : 'user') : value,
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password before submission
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      setPasswordErrors(passwordValidation.errors);
      setError('Please fix password errors before submitting');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${apiUrl}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Signup failed');
      }

      // Assuming the API returns the MFA URI in the response
      setMfaUri(data.mfa_uri);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  const handleMfaActivation = async () => {
    try {
      const response = await fetch(`${apiUrl}/activate-mfa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      if (!response.ok) {
        throw new Error('Failed to activate MFA');
      }

      setRegistrationComplete(true);
      setTimeout(() => {
        router.push('/authentication/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to activate MFA');
    }
  }

  return (
    <ThemeProvider theme={Theme}>
      <Container>
        <FormContainer>
          <BodyExtraLargeSemiBold style={{ marginBottom: '24px', textAlign: 'center' }}>
            {mfaUri ? 'Setup MFA' : 'Sign Up'}
          </BodyExtraLargeSemiBold>

          {!mfaUri ? (
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Input
                  type={InputType.TEXT}
                  name="full_name"
                  placeholder="Full Name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Input
                  type={InputType.EMAIL}
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Input
                  type={InputType.PASSWORD}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                {isPasswordTouched && passwordErrors.length > 0 && (
                  <PasswordRequirements>
                    {passwordErrors.map((error, index) => (
                      <PasswordError key={index}>{error}</PasswordError>
                    ))}
                  </PasswordRequirements>
                )}
              </FormGroup>

              <CheckboxContainer>
                <Checkbox
                  type="checkbox"
                  name="role"
                  checked={formData.role === 'guest'}
                  onChange={handleChange}
                  id="is_guest"
                />
                <CheckboxLabel htmlFor="is_guest">
                  Sign up as guest user
                </CheckboxLabel>
              </CheckboxContainer>

              {error && <ErrorText>{error}</ErrorText>}

              <Button 
                title={loading ? 'Please wait...' : 'Sign Up'} 
                onButtonClick={handleSubmit}
                type='submit'
              />

              <BodySecondaryMedium style={{ textAlign: 'center' }}>
                Already have an account?{' '}
                <LinkText onClick={() => router.push('/authentication/login')}>
                  Sign In
                </LinkText>
              </BodySecondaryMedium>
            </Form>
          ) : (
            <div>
              <QRCodeContainer>
                <BodyPrimarySemiBold>
                  Scan this QR code with your authenticator app
                </BodyPrimarySemiBold>
                <QRCodeSVG value={mfaUri} size={200} />
              </QRCodeContainer>

              {registrationComplete ? (
                <BodyPrimarySemiBold style={{ textAlign: 'center', color: Theme.text.success }}>
                  Registration complete! Redirecting to login...
                </BodyPrimarySemiBold>
              ) : (
                <>
                  {error && <ErrorText>{error}</ErrorText>}
                  <Button 
                    title="I've scanned the QR code" 
                    onButtonClick={handleMfaActivation}
                  />
                </>
              )}
            </div>
          )}
        </FormContainer>
      </Container>
    </ThemeProvider>
  )
}
