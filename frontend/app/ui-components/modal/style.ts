import styled, { css, keyframes } from 'styled-components';
import { Theme } from '~/app/theme';
import { ModalType } from './types';

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

export const ModalContainer = styled.div<{ type: ModalType }>`
  background: ${Theme.background.primary};
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 480px;
  position: relative;
  animation: ${fadeIn} 0.3s ease-in-out;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  ${({ type }) => {
    switch (type) {
      case 'success':
        return css`
          border-top: 4px solid ${Theme.text.success};
        `;
      case 'fail':
        return css`
          border-top: 4px solid ${Theme.text.error};
        `;
      default:
        return css`
          border-top: 4px solid ${Theme.brand};
        `;
    }
  }}
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

export const IconContainer = styled.div<{ type: ModalType }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;

  ${({ type }) => {
    switch (type) {
      case 'success':
        return css`
          background: ${Theme.text.success};
          color: ${Theme.text.white};
        `;
      case 'fail':
        return css`
          background: ${Theme.text.error};
          color: ${Theme.text.white};
        `;
      case 'loading':
        return css`
          background: ${Theme.background.brandPrimary};
          color: ${Theme.brand};
        `;
    }
  }}
`;

export const Title = styled.h2`
  color: ${Theme.text.primary};
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
`;

export const Description = styled.p`
  color: ${Theme.text.secondary};
  font-size: 16px;
  margin: 0;
  line-height: 1.5;
`;

export const Content = styled.div`
  padding-right: 24px;
`;

export const LoadingSpinner = styled.div`
  width: 24px;
  height: 24px;
  border: 3px solid ${Theme.background.brandSecondary};
  border-top-color: ${Theme.brand};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`; 