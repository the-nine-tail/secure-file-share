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

export const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: ${Theme.brand};
`;

export const CheckboxLabel = styled.label`
  color: ${Theme.text.secondary};
  font-size: 14px;
  cursor: pointer;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const PasswordRequirements = styled.ul`
  list-style: none;
  padding: 8px;
  margin: 0;
  background: ${Theme.background.tertiary};
  border-radius: 4px;
  border: 1px solid ${Theme.border.primary};
`;

export const PasswordError = styled.li`
  color: ${Theme.text.error};
  font-size: 12px;
  margin: 4px 0;
  display: flex;
  align-items: center;
  gap: 4px;

  &::before {
    content: "•";
    color: ${Theme.text.error};
  }
`;
