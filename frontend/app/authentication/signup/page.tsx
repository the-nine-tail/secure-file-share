'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { 
  BodyExtraLargeSemiBold, 
  BodySecondaryMedium,
  BodyPrimarySemiBold,
  Input,
} from '~/app/global-style'
import { InputType } from '~/app/ui-components/input'
import {
  Container,
  FormContainer,
  Form,
  QRCodeContainer,
  ErrorText,
  LinkText
} from './style'
import Button from '~/app/ui-components/button/button'
import { ThemeProvider } from 'styled-components'
import { Theme } from '~/app/theme'

// "hashed_password": "$2b$12$jV3nDxzqgI9gkA42mHmc7uqpX/XDYiSyue6BAY8zN25Km2hTMruca",
// "mfa_secret": "5SWTOLGKMENMY3R6Y435HGFJ3OVGWVTI",
// "mfa_uri": "otpauth://totp/SecureFileShare:suroliasahdev%40gmail.com?secret=5SWTOLGKMENMY3R6Y435HGFJ3OVGWVTI&issuer=SecureFileShare"

interface SignupFormData {
  full_name: string
  email: string
  password: string
}

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<SignupFormData>({
    full_name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mfaUri, setMfaUri] = useState<string | null>(null);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:8000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Signup failed')
      }

      // Assuming the API returns the MFA URI in the response
      setMfaUri(data.mfa_uri)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleMfaActivation = async () => {
    try {
      const response = await fetch('http://localhost:8000/activate-mfa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to activate MFA')
      }

      setRegistrationComplete(true)
      setTimeout(() => {
        router.push('/authentication/login')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to activate MFA')
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
              <Input
                type={InputType.TEXT}
                name="full_name"
                placeholder="Full Name"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
              
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
