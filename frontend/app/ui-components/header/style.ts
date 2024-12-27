import styled from 'styled-components';
import { Theme } from '~/app/theme';

export const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: ${Theme.background.primary};
  border-bottom: 1px solid ${Theme.border.primary};
  position: sticky;
  top: 0;
  z-index: 100;
`;

export const BrandSection = styled.div`
  display: flex;
  align-items: center;
`;

export const BrandName = styled.h1`
  color: ${Theme.text.primary};
  font-size: 20px;
  font-weight: 600;
  margin: 0;
`;

export const ActionsSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const BaseButton = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
`;

export const UploadButton = styled(BaseButton)`
  background: ${Theme.background.brandCTA};
  color: ${Theme.text.white};

  &:hover {
    background: ${Theme.background.brandCTAHover};
  }
`;

export const LogoutButton = styled(BaseButton)`
  background: ${Theme.background.tertiary};
  color: ${Theme.text.primary};
  border: 1px solid ${Theme.border.primary};

  &:hover {
    background: ${Theme.background.quaternary};
  }
`;

export const UploadFileInput = styled.input`
  display: none;
`;

export const UploadFileLabel = styled.label`
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  background: ${Theme.background.brandCTA};
  color: ${Theme.text.white};
  display: inline-block;
  text-align: center;

  &:hover {
    background: ${Theme.background.brandCTAHover};
  }
`; 