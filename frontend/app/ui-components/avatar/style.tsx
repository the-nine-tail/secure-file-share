import styled from "styled-components";
import { AvatarSize, AvatarVariant } from "./model";
import { Theme } from "~/app/theme";

export const AvatarStyle = styled.div<{
  size: AvatarSize;
  variant: AvatarVariant;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${(props) => props.size}px;
  width: ${(props) => props.size}px;
  border-radius: ${(props) =>
    props.variant === AvatarVariant.CIRCLE ? "50%" : "8px"};
  background: ${Theme.background.primary};
  overflow: hidden;
  cursor: pointer;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;
