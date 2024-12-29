import styled, { keyframes } from 'styled-components';
import { Theme } from '~/app/theme';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
  animation: ${fadeIn} 0.2s ease-in-out;
`;

export const ModalContainer = styled.div`
  background: ${Theme.background.primary};
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 480px;
  position: relative;
  animation: ${fadeIn} 0.3s ease-in-out;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  cursor: pointer;
  color: ${Theme.text.tertiary};
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;

  &:hover {
    color: ${Theme.text.primary};
  }
`;

export const Title = styled.h2`
  color: ${Theme.text.primary};
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 24px 0;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Label = styled.label`
  color: ${Theme.text.secondary};
  font-size: 14px;
  font-weight: 500;
`;

export const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid ${Theme.border.primary};
  border-radius: 6px;
  font-size: 14px;
  color: ${Theme.text.primary};
  background: ${Theme.background.primary};
  transition: border-color 0.2s ease;

  &:focus {
    border-color: ${Theme.brand};
    outline: none;
  }

  &::placeholder {
    color: ${Theme.text.tertiary};
  }
`;

export const RadioGroup = styled.div`
  display: flex;
  gap: 16px;
`;

export const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: ${Theme.text.primary};
  font-size: 14px;
`;

export const RadioInput = styled.input`
  cursor: pointer;
  accent-color: ${Theme.brand};
`;

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

export const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;

  ${({ variant }) => variant === 'primary' ? `
    background: ${Theme.background.brandCTA};
    color: ${Theme.text.white};
    border: none;

    &:hover {
      background: ${Theme.background.brandCTAHover};
    }
  ` : `
    background: none;
    color: ${Theme.text.primary};
    border: 1px solid ${Theme.border.primary};

    &:hover {
      background: ${Theme.background.secondary};
    }
  `}
`; 