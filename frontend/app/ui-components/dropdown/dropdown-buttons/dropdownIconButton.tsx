import React from "react";
import styled from "styled-components";
import { DropdownButtonProps, dropdownHeight } from "../model";
import { Theme } from "~/app/theme";
import MenuIcon from "~/app/assets/icons/menu-icon";

export const DropdownButton = styled.button<{ isOpen: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 5px;
  height: ${dropdownHeight.MEDIUM};
  width: max-content;
  padding: 8px 12px;
  background-color: ${Theme.background.primary};
  color: ${Theme.text.tertiary};
  border: none;
  cursor: pointer;
`;

const DropdownButtonIcon: React.FC<DropdownButtonProps> = (props) => {
  const { isOpen, onClick } = props;
  return (
    <DropdownButton
      aria-label="Toggle dropdown"
      aria-haspopup="true"
      aria-expanded={isOpen}
      type="button"
      onClick={() => onClick(!isOpen)}
      isOpen={isOpen}
    >
      <MenuIcon height={24} width={24} />
    </DropdownButton>
  );
};

export default DropdownButtonIcon;
