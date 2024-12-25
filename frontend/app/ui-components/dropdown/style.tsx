import styled from "styled-components";
import { Theme } from "~/app/theme";

export const DropdownContainerStyle = styled.div`
  position: relative;
`;

export const DropdownMenuStyle = styled.div<{ position: string }>`
  position: absolute;
  background-color: ${Theme.background.primary};
  width: max-content;
  max-height: 280px;
  overflow-y: auto;
  padding: 8px;
  border: 1px solid ${Theme.border.secondary};
  border-radius: 4px;
  // box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 10;
  ${(props) => {
    switch (props.position) {
      case "bottom-right":
        return `top: 100%; right: 0; margin-top: 8px;`;
      case "bottom-left":
        return `top: 100%; left: 0; margin-top: 8px;`;
      case "top-right":
        return `bottom: 100%; right: 0; margin-bottom: 8px;`;
      case "top-left":
        return `bottom: 100%; left: 0; margin-bottom: 8px;`;
      default:
        return ``;
    }
  }}
`;

export const DropdownListStyle = styled.ul`
  display: flex;
  flex-direction: column;
  list-style-type: none;
  gap: 4px;
`;

export const DropdownItemStyle = styled.li<{ selected: boolean }>`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px;
  background-color: transparent;
  ${(props) =>
    props.selected
      ? `background-color: ${Theme.background.brandSecondary}; border-radius: 8px;`
      : ""}
  &:hover {
    background-color: ${(props) =>
      props.selected
        ? Theme.background.brandSecondary
        : Theme.background.tertiary};
    border-radius: 8px;
  }
`;

export const DropdownImageStyle = styled.img`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #d8d8d8;
  object-fit: cover;
  margin-right: 8px;
`;
