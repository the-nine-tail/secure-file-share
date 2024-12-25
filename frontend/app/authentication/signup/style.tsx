import styled from 'styled-components';
import { Theme } from '~/app/theme';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: ${Theme.background.primary};
`;

export const FormContainer = styled.div`
  background-color: ${Theme.background.secondary};
  border: 1px solid ${Theme.border.primary};
  border-radius: 8px;
  padding: 32px;
  width: 100%;
  max-width: 400px;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const QRCodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin: 20px 0;
  padding: 20px;
  border: 1px solid ${Theme.border.primary};
  border-radius: 8px;
  background-color: ${Theme.background.primary};
`;

export const ErrorText = styled.p`
  color: ${Theme.text.error};
  font-size: 14px;
  margin-top: 4px;
`;

export const LinkText = styled.span`
  color: ${Theme.text.brandPrimary};
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;
