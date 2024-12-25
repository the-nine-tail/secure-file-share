import styled from "styled-components";
import { ButtonHeight } from "./button.model";
import { Theme } from "~/app/theme";

export const ButtonStyle = styled.div<{
  width?: string;
  height?: ButtonHeight;
  backgroundColor?: string;
  textColor?: string;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${(props) => props.width ?? "100%"};
  height: ${(props) => props.height ?? ButtonHeight.SMALL};
  padding: 12px;
  background-color: ${(props) => props.backgroundColor ?? Theme.brand};
  border-radius: 8px;
  cursor: pointer;
`;
