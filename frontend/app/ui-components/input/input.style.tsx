import styled from "styled-components";
import { InputSize } from "./input.model";
import { Theme } from "~/app/theme";

export const InputContainer = styled.div<{
  width?: string;
  disabled?: boolean;
}>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: ${(props) => props.width ?? "100%"};
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
`;

export const InputLabel = styled.label`
  color: ${Theme.text.secondary};
  font-size: 14px;
  font-weight: 500;
`;

export const InputWrapper = styled.div<{
  hasError?: boolean;
}>`
  position: relative;
  width: 100%;
`;

export const StyledInput = styled.input<{
  height?: InputSize;
  hasError?: boolean;
}>`
  width: 100%;
  height: ${(props) => props.height ?? InputSize.MEDIUM};
  padding: 8px 12px;
  background-color: ${Theme.background.primary};
  border: 1px solid ${(props) => 
    props.hasError ? Theme.border.errorSolid : Theme.border.primary};
  border-radius: 8px;
  color: ${Theme.text.primary};
  font-size: 14px;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: ${(props) =>
      props.hasError ? Theme.border.errorSolid : Theme.border.brandSolid};
  }

  &:disabled {
    background-color: ${Theme.background.disabled};
    cursor: not-allowed;
  }

  &::placeholder {
    color: ${Theme.text.placeholder};
  }

  &[type="file"] {
    padding: 6px;
  }

  &[type="number"] {
    -moz-appearance: textfield;
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }
`;

export const ErrorMessage = styled.span`
  color: ${Theme.text.error};
  font-size: 12px;
  margin-top: 4px;
`; 