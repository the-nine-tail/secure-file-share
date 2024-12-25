import styled from "styled-components";
import { Theme } from "~/app/theme";

export const MessageInputComponentStyle = styled.div<{
  isActive: boolean;
  height?: string;
  width?: string;
}>`
  display: flex;
  align-items: center;
  height: ${(props) => props.height ?? "48px"};
  width: ${(props) => props.width ?? "100%;"};
  border-radius: 12px;
  border: 1px solid
    ${(props) => (props.isActive ? Theme.brand : Theme.border.secondary)};
  background: ${Theme.background.primary};
  box-shadow: ${(props) =>
    props.isActive ? "0 0 0 2px " + Theme.brandLight : "none"};
`;

export const StyledMessageInputInput = styled.input`
  outline: none;
  border: none;
  height: 100%;
  width: 100%;
  font-size: 16px;
  box-sizing: border-box;
  border-radius: 12px;
  padding: 8px;
  color: ${Theme.text.secondary};
`;

export const MessageInputIconWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 8px;
  border-radius: 50%;
  cursor: pointer;
  &:hover {
    background-color: ${Theme.background.brandSecondary};
  }
`;
